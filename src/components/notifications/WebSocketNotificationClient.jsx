import React, { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebSocketNotificationClient({ user, onNotificationReceived }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const connectWebSocket = () => {
      try {
        // Get the WebSocket URL from your backend
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/websocket/notifications`;
        
        // For now, we'll use a fallback to HTTP polling since WebSocket backend
        // requires a persistent server (we'll use polling as a reliable alternative)
        // In production, you'd need to set up a proper WebSocket server
        
        startPolling();
        setIsConnected(true);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        // Fallback to polling
        startPolling();
      }
    };

    const startPolling = () => {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/functions/getUnreadNotifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.notifications && data.notifications.length > 0) {
              // Play notification sound
              playNotificationSound();
              
              // Add new notifications
              data.notifications.forEach(notif => {
                if (!notifications.find(n => n.id === notif.id)) {
                  setNotifications(prev => [notif, ...prev].slice(0, 10));
                  
                  // Show toast or browser notification
                  if (onNotificationReceived) {
                    onNotificationReceived(notif);
                  }

                  // Show visual indicator
                  showNotificationUI(notif);
                }
              });
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000); // Poll every 2 seconds for near real-time experience

      return () => clearInterval(pollInterval);
    };

    const cleanup = startPolling();
    connectWebSocket();

    return () => {
      if (cleanup) cleanup();
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?.id]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Could not play notification sound:', e);
    }
  };

  const showNotificationUI = (notification) => {
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);
  };

  const dismissNotification = async (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    try {
      await fetch('/api/functions/markNotificationAsRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId })
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.length;

  return (
    <>
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 w-96 max-h-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notificaciones</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPanel(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No hay notificaciones nuevas
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer",
                        notification.priority === 'high' && 'bg-red-50 dark:bg-red-900/20'
                      )}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {notification.message}
                          </p>
                          <span className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                            {new Date(notification.created_date).toLocaleTimeString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => dismissNotification(notification.id)}
                          className="h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
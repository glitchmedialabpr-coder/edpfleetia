import React, { useEffect, useState } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function VideoSplash() {
  const [redirecting, setRedirecting] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    // Get user info from localStorage
    const pinUser = localStorage.getItem('pin_user');
    
    if (!pinUser) {
      window.location.href = createPageUrl('Home');
      return;
    }

    let user;
    try {
      user = JSON.parse(pinUser);
    } catch (e) {
      window.location.href = createPageUrl('Home');
      return;
    }

    // Get video URL from settings
    try {
      const settings = await base44.entities.AppSettings.filter({ setting_key: 'splash_video_url' });
      if (settings && settings.length > 0) {
        setVideoUrl(settings[0].setting_value);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading video:', error);
    }

    // No video, redirect immediately
    setLoading(false);
    let destination = 'Home';
    if (user.role === 'admin') {
      destination = 'Dashboard';
    } else if (user.user_type === 'driver') {
      destination = 'DriverRequests';
    } else if (user.user_type === 'passenger') {
      destination = 'PassengerTrips';
    }
    window.location.href = createPageUrl(destination);
  };

  useEffect(() => {
    if (videoUrl) {
      // Auto-redirect after 10 seconds
      const timer = setTimeout(() => {
        const pinUser = localStorage.getItem('pin_user');
        if (pinUser) {
          const user = JSON.parse(pinUser);
          let destination = 'Home';
          if (user.role === 'admin') destination = 'Dashboard';
          else if (user.user_type === 'driver') destination = 'DriverRequests';
          else if (user.user_type === 'passenger') destination = 'PassengerTrips';
          window.location.href = createPageUrl(destination);
        }
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [videoUrl]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <video
        src={videoUrl}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-contain"
        onEnded={() => {
          const pinUser = localStorage.getItem('pin_user');
          if (pinUser) {
            const user = JSON.parse(pinUser);
            let destination = 'Home';
            if (user.role === 'admin') destination = 'Dashboard';
            else if (user.user_type === 'driver') destination = 'DriverRequests';
            else if (user.user_type === 'passenger') destination = 'PassengerTrips';
            window.location.href = createPageUrl(destination);
          }
        }}
      />
      
      {redirecting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="animate-pulse text-white text-xl">Cargando...</div>
        </div>
      )}
    </div>
  );
}
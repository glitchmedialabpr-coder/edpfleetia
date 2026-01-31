import React, { useEffect, useState } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function VideoSplash() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideoAndRedirect();
  }, []);

  const loadVideoAndRedirect = async () => {
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

    try {
      const settings = await base44.entities.AppSettings.filter({ setting_key: 'splash_video_url' });
      
      if (settings && settings.length > 0 && settings[0].setting_value) {
        setVideoUrl(settings[0].setting_value);
        setLoading(false);
        
        setTimeout(() => {
          redirect(user);
        }, 10000);
        return;
      }
    } catch (error) {
      console.error('Error loading video:', error);
    }

    redirect(user);
  };

  const redirect = (user) => {
    let destination = 'Home';
    if (user.role === 'admin') destination = 'Dashboard';
    else if (user.user_type === 'driver') destination = 'DriverRequests';
    else if (user.user_type === 'passenger') destination = 'PassengerTrips';
    window.location.href = createPageUrl(destination);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!videoUrl) {
    return null;
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
            redirect(JSON.parse(pinUser));
          }
        }}
      />
    </div>
  );
}
import React, { useEffect, useState, useRef } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function VideoSplash() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    const pinUser = localStorage.getItem('pin_user');
    
    if (!pinUser) {
      redirectToDestination(null);
      return;
    }

    let user;
    try {
      user = JSON.parse(pinUser);
    } catch (e) {
      redirectToDestination(null);
      return;
    }

    try {
      const settings = await base44.entities.AppSettings.filter({ setting_key: 'splash_video_url' });
      
      if (settings && settings.length > 0 && settings[0].setting_value) {
        console.log('Video URL found:', settings[0].setting_value);
        setVideoUrl(settings[0].setting_value);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading video:', error);
    }

    redirectToDestination(user);
  };

  const redirectToDestination = (user) => {
    const pinUser = user || (localStorage.getItem('pin_user') ? JSON.parse(localStorage.getItem('pin_user')) : null);
    
    let destination = 'Home';
    if (pinUser) {
      if (pinUser.role === 'admin') destination = 'Dashboard';
      else if (pinUser.user_type === 'driver') destination = 'DriverRequests';
      else if (pinUser.user_type === 'passenger') destination = 'PassengerTrips';
    }
    
    window.location.href = createPageUrl(destination);
  };

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
      
      const timer = setTimeout(() => {
        redirectToDestination();
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
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-contain"
        onEnded={redirectToDestination}
        onError={(e) => {
          console.error('Video error:', e);
          redirectToDestination();
        }}
        onLoadedData={() => console.log('Video loaded')}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
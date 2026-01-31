import React, { useEffect, useState } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';

export default function VideoSplash() {
  const [videoUrl, setVideoUrl] = useState('loading');

    useEffect(() => {
      loadVideo();
    }, []);

    const loadVideo = async () => {
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
          console.log('Video URL:', settings[0].setting_value);
          setVideoUrl(settings[0].setting_value);

          // Redirect after 4.5 seconds
          setTimeout(() => {
            redirect(user);
          }, 4500);
          return;
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }

      // No video found, redirect immediately
      redirect(user);
    };

  const redirect = (user) => {
    let destination = 'Home';
    if (user.role === 'admin') destination = 'Dashboard';
    else if (user.user_type === 'driver') destination = 'DriverRequests';
    else if (user.user_type === 'passenger') destination = 'PassengerTrips';
    window.location.href = createPageUrl(destination);
  };

  if (!videoUrl) {
    return (
      <div className="fixed inset-0 bg-black z-[9999]" />
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <video
        key={videoUrl}
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
        onError={(e) => {
          console.error('Error en video:', e);
          const pinUser = localStorage.getItem('pin_user');
          if (pinUser) {
            redirect(JSON.parse(pinUser));
          }
        }}
        onLoadedData={() => console.log('Video cargado correctamente')}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
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
          const [videoSettings, enableSettings] = await Promise.all([
            base44.entities.AppSettings.filter({ setting_key: 'splash_video_url' }),
            base44.entities.AppSettings.filter({ setting_key: 'enable_splash_video' })
          ]);

          const videoEnabled = enableSettings && enableSettings.length > 0 ? enableSettings[0].setting_value === 'true' : true;

          if (videoEnabled && videoSettings && videoSettings.length > 0 && videoSettings[0].setting_value) {
            console.log('Video URL:', videoSettings[0].setting_value);
            setVideoUrl(videoSettings[0].setting_value);

            // Redirect after 4.5 seconds
            setTimeout(() => {
              redirect(user);
            }, 4500);
            return;
          }
        } catch (error) {
          console.error('Error loading video:', error);
        }

        // No video found or disabled, redirect immediately
        redirect(user);
    };

  const redirect = (user) => {
    let destination = 'Home';
    if (user.role === 'admin') destination = 'Dashboard';
    else if (user.user_type === 'driver') destination = 'DriverRequests';
    else if (user.user_type === 'passenger') destination = 'PassengerTrips';
    window.location.href = createPageUrl(destination);
  };



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
import React, { useEffect, useState } from 'react';
import { createPageUrl } from '../utils';

export default function VideoSplash() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const pinUser = localStorage.getItem('pin_user');
    
    if (!pinUser) {
      // If no user, redirect to home
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

    // Set up video end handler
    const videoElement = document.getElementById('splash-video');
    
    const handleVideoEnd = () => {
      setRedirecting(true);
      
      // Determine destination based on user type
      let destination = 'Home';
      
      if (user.role === 'admin') {
        destination = 'Dashboard';
      } else if (user.user_type === 'driver') {
        destination = 'DriverRequests';
      } else if (user.user_type === 'passenger') {
        destination = 'PassengerTrips';
      }
      
      // Small delay before redirect for smooth transition
      setTimeout(() => {
        window.location.href = createPageUrl(destination);
      }, 300);
    };

    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd);
      
      // Fallback: redirect after 5 seconds if video doesn't end
      const fallbackTimeout = setTimeout(handleVideoEnd, 5000);
      
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
        clearTimeout(fallbackTimeout);
      };
    } else {
      // If video element not found, redirect immediately
      handleVideoEnd();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <video
        id="splash-video"
        className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
      >
        {/* Replace this URL with your actual video URL */}
        <source src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/video-logo.mp4" type="video/mp4" />
        Tu navegador no soporta la reproducción de video.
      </video>
      
      {redirecting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-pulse text-white text-xl">Cargando...</div>
        </div>
      )}
    </div>
  );
}
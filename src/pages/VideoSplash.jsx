import React, { useEffect, useState } from 'react';
import { createPageUrl } from '../utils';

export default function VideoSplash() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
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

    const handleRedirect = () => {
      setRedirecting(true);
      
      let destination = 'Home';
      
      if (user.role === 'admin') {
        destination = 'Dashboard';
      } else if (user.user_type === 'driver') {
        destination = 'DriverRequests';
      } else if (user.user_type === 'passenger') {
        destination = 'PassengerTrips';
      }
      
      setTimeout(() => {
        window.location.href = createPageUrl(destination);
      }, 300);
    };

    // Listen for video end
    const video = document.getElementById('splash-video');
    if (video) {
      video.addEventListener('ended', handleRedirect);
      
      // Fallback: redirect after 10 seconds if video doesn't trigger
      const fallback = setTimeout(handleRedirect, 10000);
      
      return () => {
        video.removeEventListener('ended', handleRedirect);
        clearTimeout(fallback);
      };
    } else {
      // If no video element, redirect after 5 seconds
      const timer = setTimeout(handleRedirect, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] overflow-hidden">
      <iframe 
        id="splash-video"
        src="https://drive.google.com/file/d/1VeEsl5KCVoN6nFYEM9qjMBtDsEWK5JYu/preview"
        className="w-full h-full border-0"
        allow="autoplay"
        allowFullScreen
      />
      
      {redirecting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-none">
          <div className="animate-pulse text-white text-xl">Cargando...</div>
        </div>
      )}
    </div>
  );
}
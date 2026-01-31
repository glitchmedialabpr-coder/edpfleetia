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

    // Redirect after video duration (adjust based on your video length)
    const timer = setTimeout(handleRedirect, 8000); // 8 seconds for video
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[9999]">
      <iframe 
        src="https://drive.google.com/file/d/1VeEsl5KCVoN6nFYEM9qjMBtDsEWK5JYu/preview"
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
        style={{ display: 'block' }}
      />
      
      {redirecting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="animate-pulse text-white text-xl">Cargando...</div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';

export default function VideoSplash() {
  const [redirecting, setRedirecting] = useState(false);
  const [showButton, setShowButton] = useState(true);

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

    // Auto-redirect after 10 seconds
    const timer = setTimeout(handleRedirect, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = () => {
    setShowButton(false);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <iframe
        src="https://drive.google.com/file/d/1VeEsl5KCVoN6nFYEM9qjMBtDsEWK5JYu/preview?autoplay=1"
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
      
      {showButton && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Button 
            onClick={handlePlay}
            className="bg-white text-black hover:bg-gray-200 text-xl px-8 py-6"
          >
            ▶ Ver Video
          </Button>
        </div>
      )}
      
      {redirecting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="animate-pulse text-white text-xl">Cargando...</div>
        </div>
      )}
    </div>
  );
}
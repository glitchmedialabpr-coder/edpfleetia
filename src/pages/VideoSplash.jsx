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

    // Redirect after 4 seconds (adjust based on your video length)
    const timer = setTimeout(handleVideoEnd, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        controls={false}
      >
        <source src="https://drive.google.com/uc?export=download&id=1VeEsl5KCVoN6nFYEM9qjMBtDsEWK5JYu" type="video/mp4" />
      </video>
      
      {redirecting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="animate-pulse text-white text-xl">Cargando...</div>
        </div>
      )}
    </div>
  );
}
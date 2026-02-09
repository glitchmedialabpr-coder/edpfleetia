import React, { useEffect, useState } from 'react';
import { Bus } from 'lucide-react';

/**
 * Non-destructive initialization guard for APK stability
 * Ensures auth validation completes before app renders
 */
export default function AppInitializer({ children, loading }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth loading to complete
    if (!loading) {
      // Small delay to ensure sessionStorage is accessible in APK
      setTimeout(() => setIsReady(true), 100);
    }
  }, [loading]);

  // Show splash during initialization
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 animate-pulse">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/303d16ba3_471231367_1006775134815986_8615529326532786364_n.jpg" 
              alt="EDP University"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-16 h-16 bg-teal-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Bus className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Fleetia</h2>
          <p className="text-teal-300">Iniciando...</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
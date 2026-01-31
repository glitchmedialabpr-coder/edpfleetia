import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';

// Función para generar sonidos cortos con Web Audio API
const generateNotificationSound = (type) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  switch(type) {
    case 'default':
      osc.frequency.setValueAtTime(800, now);
      break;
    case 'bell':
      osc.frequency.setValueAtTime(1047, now);
      break;
    case 'chime':
      osc.frequency.setValueAtTime(1319, now);
      break;
    case 'notification':
      osc.frequency.setValueAtTime(900, now);
      break;
    case 'alert':
      osc.frequency.setValueAtTime(1200, now);
      break;
    default:
      osc.frequency.setValueAtTime(800, now);
  }
  
  osc.start(now);
  osc.stop(now + 0.1);
};

const SOUNDS = {
  default: {
    label: 'Predeterminado'
  },
  bell: {
    label: 'Campana'
  },
  chime: {
    label: 'Timbre'
  },
  notification: {
    label: 'Notificación'
  },
  alert: {
    label: 'Alerta'
  },
  silent: {
    label: 'Silencioso'
  }
};

export default function SoundSelector({ value, onChange }) {
  const [playing, setPlaying] = useState(null);

  const playSound = (soundKey) => {
    if (soundKey === 'silent') return;
    
    try {
      generateNotificationSound(soundKey);
      setPlaying(soundKey);
      setTimeout(() => setPlaying(null), 150);
    } catch (e) {
      console.log('Sound play failed:', e);
    }
  };

  const handleSoundChange = (key) => {
    onChange(key);
    // Auto-reproduce when selecting a sound
    if (key !== 'silent') {
      setTimeout(() => playSound(key), 100);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(SOUNDS).map(([key, sound]) => (
          <label
            key={key}
            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              value === key 
                ? 'border-indigo-600 bg-indigo-50' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="notification_sound"
              value={key}
              checked={value === key}
              onChange={() => handleSoundChange(key)}
              className="w-5 h-5 accent-indigo-600"
            />
            <span className="flex-1 text-sm font-medium text-slate-700">{sound.label}</span>
            {sound.url && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  playSound(key);
                }}
                className="flex-shrink-0"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
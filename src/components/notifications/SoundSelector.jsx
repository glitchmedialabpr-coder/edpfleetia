import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';

// Función para generar sonidos de notificación con Web Audio API
const generateNotificationSound = (type) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  gain.gain.setValueAtTime(0.3, now);
  
  let duration = 3;
  let frequency = 800;
  
  switch(type) {
    case 'default':
      duration = 3;
      frequency = 800;
      gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
      gain.gain.linearRampToValueAtTime(0.05, now + duration);
      break;
    case 'bell':
      duration = 4;
      frequency = 1047;
      gain.gain.linearRampToValueAtTime(0.25, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.05, now + duration);
      break;
    case 'chime':
      duration = 3.5;
      frequency = 1319;
      gain.gain.linearRampToValueAtTime(0.2, now + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.03, now + duration);
      break;
    case 'notification':
      duration = 3;
      frequency = 900;
      gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
      gain.gain.linearRampToValueAtTime(0.08, now + duration);
      break;
    case 'alert':
      duration = 4.5;
      frequency = 1200;
      gain.gain.linearRampToValueAtTime(0.3, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.05, now + duration);
      break;
    default:
      duration = 3;
      frequency = 800;
  }
  
  osc.frequency.setValueAtTime(frequency, now);
  osc.start(now);
  osc.stop(now + duration);
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
      setTimeout(() => setPlaying(null), 4500);
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
            {key !== 'silent' && (
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
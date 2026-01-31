import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';

const SOUNDS = {
  default: {
    label: 'Predeterminado',
    url: null
  },
  bell: {
    label: 'Campana',
    url: null
  },
  chime: {
    label: 'Timbre',
    url: null
  },
  notification: {
    label: 'Notificación',
    url: null
  },
  alert: {
    label: 'Alerta',
    url: null
  },
  silent: {
    label: 'Silencioso',
    url: null
  }
};

export default function SoundSelector({ value, onChange }) {
  const [playing, setPlaying] = useState(null);

  const playSound = (soundKey) => {
    const sound = SOUNDS[soundKey];
    if (!sound.url || soundKey === 'silent') return;

    const audio = new Audio(sound.url);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
    setPlaying(soundKey);
    setTimeout(() => setPlaying(null), 1000);
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
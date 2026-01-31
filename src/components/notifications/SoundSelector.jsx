import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';

const SOUNDS = {
  default: {
    label: 'Predeterminado',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_3840df62eb.mp3'
  },
  bell: {
    label: 'Campana',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_ce3d2c8b06.mp3'
  },
  chime: {
    label: 'Timbre',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_3fb67345fc.mp3'
  },
  notification: {
    label: 'Notificación',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_fbc3f738c8.mp3'
  },
  alert: {
    label: 'Alerta',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_d45934c8e0.mp3'
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
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';

const SOUNDS = {
  default: {
    label: 'Predeterminado',
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnl87RiGwU7k9n0yHInBSh+zPLaizsKFF+28ud2URwMTKXh8bllHAU2jdTxy3ksiCV8zPDbjzsKEly18O2jUBsMSqPf8r1nHwU6kdnzxnErBSh+zvPaiTwKEV619Oy+aCAGL47V8tWTQwsVYLXp7JhPEAxMovTyvmsiBTaO1vLNdSYEJ4HO8tiJOAgZaLzu551NEQxPqOT0s2IcBTiQ2PPLeSgEKH7N8tmJPAoUXrXy77hVGApFnuHytW0hBSuCz/PaiDUHGWi78OWcTQ0OUKjk87NhHAU7k9jzy3krBCiAz/PaiD0GEly08uq5Vx0LRZP0yHMnBSh9zfDcjD4HEly18uq5V+0LPJrc8shzJwUng87y2Ik3CBpouPDmnk0PDlCo5fKzYhwFOpPZ88t5KwQogc7y2Yk3CBppofHvnU0QDFGr5PK0YRoFPJTY88p5TAUAAAAAAAA='
  },
  bell: {
    label: 'Campana',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
  },
  chime: {
    label: 'Timbre',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
  },
  notification: {
    label: 'Notificación',
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+'
  },
  alert: {
    label: 'Alerta',
    url: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
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
    if (!sound.url) return;

    const audio = new Audio(sound.url);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
    setPlaying(soundKey);
    setTimeout(() => setPlaying(null), 1000);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <Volume2 className="w-4 h-4" />
        Sonido de Notificación
      </label>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(SOUNDS).map(([key, sound]) => (
          <div key={key} className="flex items-center gap-2">
            <label className={`flex items-center gap-2 flex-1 p-3 border rounded-lg cursor-pointer transition-colors ${
              value === key 
                ? 'border-teal-600 bg-teal-50' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="notification_sound"
                value={key}
                checked={value === key}
                onChange={() => onChange(key)}
                className="w-4 h-4 accent-teal-600"
              />
              <span className="text-sm text-slate-700">{sound.label}</span>
            </label>
            {sound.url && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => playSound(key)}
                disabled={playing === key}
                className="flex-shrink-0"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
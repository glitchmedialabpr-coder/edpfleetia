import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';

const ADMIN_PIN = '0573';

export default function PinVerification({ open, onClose, onVerified, title = "Verificación de Administrador" }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (pin === ADMIN_PIN) {
        onVerified();
        setPin('');
        onClose();
      } else {
        setError('PIN incorrecto. Solo administradores pueden realizar esta acción.');
        setPin('');
      }
      setLoading(false);
    }, 500);
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-sm text-slate-600">
              Ingresa el PIN de administrador para continuar
            </p>
          </div>

          <div className="space-y-2">
            <Label>PIN de Administrador</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="text-center text-2xl tracking-widest"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
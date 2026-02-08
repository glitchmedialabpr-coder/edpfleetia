import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bell, Lock, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('pin_user');
    toast.success('Sesión cerrada');
    navigate(createPageUrl('Home'));
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem('pin_user');
    toast.success('Cuenta eliminada');
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500 mt-2">Administra tus preferencias</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Bell className="w-5 h-5 text-slate-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800">Notificaciones</h3>
                <p className="text-sm text-slate-500 mt-1">Manage notification preferences</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Lock className="w-5 h-5 text-slate-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800">Privacidad</h3>
                <p className="text-sm text-slate-500 mt-1">Gestiona tu privacidad y datos</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <LogOut className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-700">Cerrar Sesión</h3>
                <p className="text-sm text-red-600 mt-1">Termina tu sesión actual</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </Card>

        {/* Account Deletion */}
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Trash2 className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-700">Eliminar Cuenta</h3>
                <p className="text-sm text-orange-600 mt-1">Esta acción es permanente e irreversible</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
            >
              Eliminar
            </Button>
          </div>
        </Card>
        </div>

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu cuenta y todos tus datos serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
        </div>
        );
        }
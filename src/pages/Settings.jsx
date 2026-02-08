import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, Lock, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';

export default function Settings() {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('pin_user');
    toast.success('Sesión cerrada');
    navigate(createPageUrl('Home'));
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const pinUser = localStorage.getItem('pin_user');
      if (!pinUser) {
        toast.error('Datos de usuario no encontrados');
        return;
      }

      const user = JSON.parse(pinUser);

      // Delete from Student or Driver entity
      if (user.user_type === 'driver') {
        const drivers = await base44.entities.Driver.filter({ driver_id: user.driver_id });
        if (drivers && drivers.length > 0) {
          await base44.entities.Driver.delete(drivers[0].id);
        }
      } else if (user.user_type === 'passenger') {
        const students = await base44.entities.Student.filter({ student_id: user.student_id });
        if (students && students.length > 0) {
          await base44.entities.Student.delete(students[0].id);
        }
      }

      // Clear local data
      localStorage.removeItem('pin_user');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('driver_vehicle_')) {
          localStorage.removeItem(key);
        }
      });

      toast.success('Cuenta eliminada correctamente');
      setShowDeleteDialog(false);
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error al eliminar la cuenta');
    } finally {
      setDeleteLoading(false);
    }
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

        {/* Delete Account */}
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Trash2 className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-700">Eliminar Cuenta</h3>
                <p className="text-sm text-red-600 mt-1">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <LogOut className="w-5 h-5 text-amber-600 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-700">Cerrar Sesión</h3>
                <p className="text-sm text-amber-600 mt-1">Termina tu sesión actual</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Cerrar Sesión
            </Button>
          </div>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cuenta permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará tu cuenta y todos los datos asociados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Eliminando...' : 'Eliminar cuenta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
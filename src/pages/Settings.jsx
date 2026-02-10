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
import { Bell, Lock, LogOut, Trash2, Info, ChevronDown, Download, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function Settings() {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPresentation = async () => {
    setIsGeneratingPDF(true);
    try {
      const response = await base44.functions.invoke('generateFleetiaPresentation');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Fleetia_Presentacion.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Presentación descargada');
    } catch (error) {
      toast.error('Error al descargar');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

      {/* Download Presentation */}
      <div className="max-w-4xl mb-8">
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Descargar Presentación</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Documento PDF completo sobre Fleetia (9 páginas)</p>
              </div>
            </div>
            <Button 
              onClick={handleDownloadPresentation}
              disabled={isGeneratingPDF}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* About Fleetia Section */}
      <div className="max-w-4xl mb-8">
        <div className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 rounded-xl border border-teal-500/30 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Info className="w-6 h-6 text-teal-500" />
              <div className="text-left">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Acerca de Fleetia</h2>
                <p className="text-sm text-slate-500">Conoce todas las características y portales disponibles</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${expandedSection === 'about' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'about' && (
            <div className="p-6 border-t border-teal-500/20 bg-black/5 space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-3">Portal Administrador</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div>✓ Gestión de conductores y datos</div>
                  <div>✓ Asignación de horarios semanales</div>
                  <div>✓ Control de vehículos</div>
                  <div>✓ Registro de mantenimiento</div>
                  <div>✓ Reportes de accidentes</div>
                  <div>✓ Monitoreo en vivo de viajes</div>
                  <div>✓ Gestión de combustible</div>
                  <div>✓ Reportes consolidados</div>
                  <div>✓ Advertencias a conductores</div>
                  <div>✓ Gestión de estudiantes</div>
                  <div>✓ Trabajos de servicio general</div>
                  <div>✓ Centro de notificaciones</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-3">Portal Conductor</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div>✓ Dashboard de actividad</div>
                  <div>✓ Recepción de solicitudes</div>
                  <div>✓ Aceptar/Rechazar viajes</div>
                  <div>✓ Historial de viajes</div>
                  <div>✓ Notificaciones en vivo</div>
                  <div>✓ Perfil y documentos</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-3">Portal Estudiante</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div>✓ Solicitar viaje</div>
                  <div>✓ Ver asignación</div>
                  <div>✓ Rastrear en tiempo real</div>
                  <div>✓ Historial de viajes</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-3">Portal Solicitudes</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div>✓ Formulario estructurado</div>
                  <div>✓ Solicitudes anónimas</div>
                  <div>✓ Seguimiento de estado</div>
                  <div>✓ Historial de peticiones</div>
                </div>
              </div>

              <div className="pt-4 border-t border-teal-500/20">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Fleetia</strong> es la plataforma integral para gestión de flota y transporte. Diseñada por <strong>Glitch Media Lab</strong> para proporcionar eficiencia, visibilidad, seguridad y datos en tiempo real.
                </p>
              </div>
            </div>
          )}
        </div>
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
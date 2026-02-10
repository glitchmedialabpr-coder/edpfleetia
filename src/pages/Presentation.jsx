import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Loader2, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Presentation() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPresentation = async () => {
    setIsGenerating(true);
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
      
      toast.success('Presentación descargada correctamente');
    } catch (error) {
      toast.error('Error al descargar la presentación: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Presentación Fleetia</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Descarga la presentación completa en PDF</p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20 border-teal-200 dark:border-teal-800">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-lg bg-teal-600/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Presentación Oficial de Fleetia
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl">
              Documento completo con 9 páginas incluyendo todas las características, portales disponibles, beneficios y por qué elegir Fleetia como solución integral de gestión de flota y transporte.
            </p>
          </div>

          <div className="pt-4 w-full">
            <Button
              onClick={handleDownloadPresentation}
              disabled={isGenerating}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Descargar Presentación
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 text-sm text-slate-600 dark:text-slate-400">
            <p>📄 Formato: PDF</p>
            <p>📑 Páginas: 9</p>
            <p>🎯 Contenido: Completo e Integrado</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Contenido de la Presentación</h3>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>✓ Portada con branding Fleetia</p>
          <p>✓ Introducción y características principales</p>
          <p>✓ Portal Administrador (12 funcionalidades)</p>
          <p>✓ Portal Conductor (6 funcionalidades)</p>
          <p>✓ Portal Estudiante (4 funcionalidades)</p>
          <p>✓ Portal Solicitudes (4 funcionalidades)</p>
          <p>✓ Razones para elegir Fleetia</p>
          <p>✓ Beneficios clave de la solución</p>
          <p>✓ Cierre inspirador</p>
        </div>
      </Card>
    </div>
  );
}
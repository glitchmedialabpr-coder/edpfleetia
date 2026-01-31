import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadVideo() {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Por favor selecciona un archivo de video');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Save to AppSettings
      const existingSetting = await base44.entities.AppSettings.filter({ setting_key: 'splash_video_url' });
      
      if (existingSetting && existingSetting.length > 0) {
        await base44.entities.AppSettings.update(existingSetting[0].id, {
          setting_value: file_url
        });
      } else {
        await base44.entities.AppSettings.create({
          setting_key: 'splash_video_url',
          setting_value: file_url,
          category: 'general',
          description: 'URL del video splash de bienvenida'
        });
      }

      setVideoUrl(file_url);
      toast.success('Video subido exitosamente');
    } catch (error) {
      toast.error('Error al subir el video');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Subir Video Splash</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="video-upload"
              disabled={uploading}
            />
            <label 
              htmlFor="video-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              {uploading ? (
                <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
              ) : videoUrl ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <Upload className="w-12 h-12 text-slate-400" />
              )}
              <div>
                <p className="text-lg font-medium text-slate-700">
                  {uploading ? 'Subiendo...' : videoUrl ? 'Video subido exitosamente' : 'Haz clic para subir video'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Formatos soportados: MP4, MOV, AVI, etc.
                </p>
              </div>
            </label>
          </div>

          {videoUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Vista previa:</p>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
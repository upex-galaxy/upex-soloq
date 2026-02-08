// src/app/(app)/onboarding/_components/logo-upload-step.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming shadcn/ui Avatar components
import { useToast } from '@/components/ui/use-toast';

interface LogoUploadStepProps {
  onNext: (data?: { logoUrl?: string }) => void;
  onBack: () => void;
  initialData?: { logoUrl?: string };
  isLoading: boolean;
}

export function LogoUploadStep({ onNext, onBack, initialData, isLoading }: LogoUploadStepProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.logoUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(selectedFile.type)) {
        toast({
          title: 'Error de archivo',
          description: 'Solo se permiten imágenes PNG, JPG o WEBP.',
          variant: 'destructive',
        });
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast({
          title: 'Error de archivo',
          description: 'El archivo es demasiado grande. Máximo 2MB.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un archivo para subir.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    // Simulate API call for logo upload
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/logo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al subir el logo.');
      }

      toast({
        title: 'Logo subido',
        description: 'Tu logo se ha guardado exitosamente.',
      });
      onNext({ logoUrl: data.url }); // Pass the new URL to the next step/wizard
    } catch (error: any) {
      toast({
        title: 'Error de subida',
        description: error.message || 'Ocurrió un error al subir el logo.',
        variant: 'destructive',
      });
      console.error('Logo upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || undefined} alt="Logo de negocio" />
          <AvatarFallback>SL</AvatarFallback>
        </Avatar>
        <Label htmlFor="logoUpload">Subir Logo</Label>
        <Input
          id="logoUpload"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="w-full max-w-sm"
          disabled={isUploading || isLoading}
        />
        <Button onClick={handleUpload} disabled={!file || isUploading || isLoading}>
          {isUploading ? 'Subiendo...' : 'Subir y Siguiente'}
        </Button>
      </div>

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Atrás
        </Button>
        <Button variant="ghost" onClick={() => onNext()} disabled={isUploading || isLoading}>
          Saltar
        </Button>
      </div>
    </div>
  );
}

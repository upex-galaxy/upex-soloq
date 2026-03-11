'use client';

import { useCallback, useRef, useState } from 'react';
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useUpdateBusinessProfile } from '@/hooks/business-profile';
import { validateLogoFile, resizeImage } from '@/lib/utils/image-resize';
import { cn } from '@/lib/utils';
import type { BusinessProfile } from '@/lib/types';

interface LogoUploadProps {
  businessProfile: BusinessProfile | null;
  onSuccess?: () => void;
}

export function LogoUpload({ businessProfile, onSuccess }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateProfile } = useUpdateBusinessProfile();

  const logoUrl = businessProfile?.logo_url;
  const hasLogo = !!logoUrl;

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validation = validateLogoFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setIsUploading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast.error('No autorizado.');
          return;
        }

        // Resize image (proportional, max 400x400)
        const resizedBlob = await resizeImage(file, 400, 400);

        // Delete old logo if replacing
        if (businessProfile?.logo_url) {
          const oldPath = extractStoragePath(businessProfile.logo_url);
          if (oldPath) {
            await supabase.storage.from('logos').remove([oldPath]);
          }
        }

        // Upload to Supabase Storage
        const ext = file.type === 'image/png' ? 'png' : 'jpg';
        const filePath = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, resizedBlob, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('logos').getPublicUrl(filePath);

        // Update business profile with logo URL
        await updateProfile({ logo_url: publicUrl });

        toast.success('Logo actualizado');
        onSuccess?.();
      } catch {
        toast.error('Error al subir. Intenta de nuevo.');
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [businessProfile?.logo_url, updateProfile, onSuccess]
  );

  const handleRemove = useCallback(async () => {
    if (!businessProfile?.logo_url) return;

    setIsRemoving(true);
    try {
      const supabase = createClient();

      // Delete file from storage
      const storagePath = extractStoragePath(businessProfile.logo_url);
      if (storagePath) {
        await supabase.storage.from('logos').remove([storagePath]);
      }

      // Set logo_url to null in DB
      await updateProfile({ logo_url: null });

      toast.success('Logo eliminado');
      onSuccess?.();
    } catch {
      toast.error('Error al eliminar. Intenta de nuevo.');
    } finally {
      setIsRemoving(false);
    }
  }, [businessProfile?.logo_url, updateProfile, onSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const isProcessing = isUploading || isRemoving;

  return (
    <Card data-testid="logoUpload">
      <CardHeader>
        <CardTitle>Logo de tu negocio</CardTitle>
        <CardDescription>
          Personaliza tus facturas con tu logo. PNG o JPG, máximo 2MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          data-testid="logo-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex items-center gap-6 rounded-lg border-2 border-dashed p-6 transition-colors',
            isDragOver && 'border-primary bg-primary/5',
            !isDragOver && 'border-muted-foreground/25',
            isProcessing && 'pointer-events-none opacity-60'
          )}
        >
          {/* Preview or placeholder */}
          <div className="flex-shrink-0">
            {hasLogo ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={logoUrl}
                  alt="Logo del negocio"
                  className="h-full w-full object-contain"
                  data-testid="logo-preview"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={hasLogo ? 'outline' : 'default'}
                size="sm"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                data-testid="logo-upload-button"
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {hasLogo ? 'Cambiar' : 'Subir logo'}
              </Button>

              {hasLogo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing}
                  onClick={handleRemove}
                  data-testid="logo-remove-button"
                >
                  {isRemoving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Eliminar
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {hasLogo
                ? 'PNG o JPG, máximo 2MB. Se redimensionará a un máximo de 400×400px.'
                : 'Sube tu logo o arrástralo aquí. PNG o JPG, máximo 2MB.'}
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleInputChange}
            data-testid="logo-upload-input"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Extracts the storage path from a Supabase public URL.
 * e.g., "https://xxx.supabase.co/storage/v1/object/public/logos/user-id/123.png"
 * → "user-id/123.png"
 */
function extractStoragePath(publicUrl: string): string | null {
  const marker = '/storage/v1/object/public/logos/';
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

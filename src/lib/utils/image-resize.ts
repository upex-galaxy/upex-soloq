const SUPPORTED_TYPES = ['image/png', 'image/jpeg'] as const;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

type SupportedMimeType = (typeof SUPPORTED_TYPES)[number];

/**
 * Validates a file for logo upload requirements:
 * - Must be PNG or JPG
 * - Must be <= 2MB
 * - Must not be empty/corrupt
 */
export function validateLogoFile(file: File): { valid: true } | { valid: false; error: string } {
  if (file.size === 0) {
    return { valid: false, error: 'El archivo está vacío o corrupto.' };
  }

  if (!SUPPORTED_TYPES.includes(file.type as SupportedMimeType)) {
    return { valid: false, error: 'Formato no soportado. Usa PNG o JPG.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'La imagen debe ser menor a 2MB.' };
  }

  return { valid: true };
}

/**
 * Resizes an image proportionally to fit within maxWidth x maxHeight.
 * Preserves aspect ratio (no crop). Preserves PNG transparency.
 * If image is already smaller, returns the original blob.
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;

      // No resize needed if already within bounds
      if (width <= maxWidth && height <= maxHeight) {
        resolve(file);
        return;
      }

      // Calculate proportional dimensions
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      const newWidth = Math.round(width * ratio);
      const newHeight = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Preserve original format (PNG keeps transparency, JPG stays as JPEG)
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = outputType === 'image/jpeg' ? 0.9 : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Error al procesar la imagen.'));
            return;
          }
          resolve(blob);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('El archivo está corrupto o no es una imagen válida.'));
    };

    img.src = url;
  });
}

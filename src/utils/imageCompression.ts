/**
 * Comprime una imagen a un tamaño y calidad máximos especificados.
 * Redimensiona si el ancho excede maxWidth o la calidad es mayor a maxQuality.
 */

export interface CompressionOptions {
  /** Ancho máximo en píxeles (default: 800) */
  maxWidth?: number;
  /** Calidad JPEG/WebP 0-1 (default: 0.7) */
  quality?: number;
  /** Tamaño máximo en bytes (default: 2MB) */
  maxSizeBytes?: number;
}

const DEFAULTS: Required<CompressionOptions> = {
  maxWidth: 800,
  quality: 0.7,
  maxSizeBytes: 2 * 1024 * 1024, // 2 MB
};

/**
 * Lee un File como data URL.
 */
const readAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });

/**
 * Comprime una imagen desde un File y devuelve un Blob comprimido.
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {},
): Promise<Blob> => {
  const config = { ...DEFAULTS, ...options };

  // Si el archivo ya es más pequeño que el límite, no comprimir
  if (file.size <= config.maxSizeBytes && file.type !== 'image/gif') {
    return file;
  }

  const dataUrl = await readAsDataURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Redimensionar manteniendo proporción
      if (width > config.maxWidth) {
        height = Math.round((height * config.maxWidth) / width);
        width = config.maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Error al obtener contexto del canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Intentar con calidad decreciente hasta que quepa en maxSizeBytes
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const tryCompress = (q: number): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'));
              return;
            }

            if (blob.size <= config.maxSizeBytes || q <= 0.1) {
              resolve(blob);
            } else {
              // Reducir calidad en 0.1 y reintentar
              setTimeout(() => tryCompress(q - 0.1), 0);
            }
          },
          mimeType,
          q,
        );
      };

      tryCompress(config.quality);
    };
    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = dataUrl;
  });
};

/**
 * Obtiene un objeto File comprimido a partir de un File original.
 * El nombre se mantiene pero el tipo puede cambiar a JPEG si era PNG grande.
 */
export const getCompressedFile = async (
  file: File,
  options: CompressionOptions = {},
): Promise<File> => {
  const compressed = await compressImage(file, options);
  const ext = compressed.type === 'image/png' ? 'png' : 'jpg';
  const fileName = file.name.replace(/\.[^.]+$/, '') + '.' + ext;
  return new File([compressed], fileName, { type: compressed.type });
};

/**
 * Limpia data URLs antiguas del localStorage.
 * Busca claves que contengan data:image y las elimina.
 */
export const cleanAvatarDataUrls = (): void => {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    try {
      const value = localStorage.getItem(key);
      if (value && value.startsWith('data:image')) {
        keysToRemove.push(key);
      }
    } catch {
      // ignorar errores de parsing
    }
  }

  keysToRemove.forEach((key) => {
    console.log(`[Avatar Cleanup] Eliminando data URL de localStorage: ${key}`);
    localStorage.removeItem(key);
  });
};
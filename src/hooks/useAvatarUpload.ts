import { useState, useRef, useCallback } from 'react';
import { uploadAvatarRequest } from '../services/authService';
import useAuthStore from '../store/authStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const useAvatarUpload = () => {
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [preview, setPreview]     = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Abrir el file picker
  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Manejar selección de archivo
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset
    setUploadError(null);

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Solo se permiten imágenes (JPG, PNG, WebP, GIF)');
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('La imagen no debe superar 5 MB');
      return;
    }

    // Preview inmediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Subir a la API
    setIsUploading(true);
    try {
      const { avatarUrl } = await uploadAvatarRequest(file);
      // Actualizar store con la URL del servidor
      if (user) {
        setUser({ ...user, avatar: avatarUrl });
      }
      setPreview(avatarUrl);
    } catch (err: any) {
      setUploadError(
        err?.response?.data?.message || err?.message || 'Error al subir la imagen'
      );
      // Revertir preview
      setPreview(user?.avatar ?? null);
      URL.revokeObjectURL(localUrl);
    } finally {
      setIsUploading(false);
      // Limpiar input para poder re-seleccionar el mismo archivo
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [user, setUser]);

  // URL final para mostrar: preview temporal > avatar del store > null
  const avatarUrl = preview ?? user?.avatar ?? null;

  return {
    avatarUrl,
    isUploading,
    uploadError,
    inputRef,
    openFilePicker,
    handleFileChange,
  };
};

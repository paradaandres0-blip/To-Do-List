import { useState, useRef, useCallback } from 'react';
import { uploadAvatarRequest, AVATAR_MAX_SIZE, AVATAR_ALLOWED_TYPES } from '../services/authService';
import { cleanAvatarDataUrls } from '../utils/imageCompression';
import useAuthStore from '../store/authStore';

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

    // Validar tipo (más permisivo que el servicio para dar feedback temprano)
    if (!AVATAR_ALLOWED_TYPES.includes(file.type as any)) {
      setUploadError(`Solo se permiten imágenes (${AVATAR_ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')})`);
      return;
    }

    // Validar tamaño (2MB)
    if (file.size > AVATAR_MAX_SIZE) {
      setUploadError(`La imagen no debe superar 2 MB (tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      return;
    }

    // Preview inmediato (comprimido ligero)
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Subir a la API (incluye compresión)
    setIsUploading(true);
    try {
      const { avatarUrl } = await uploadAvatarRequest(file);
      // Actualizar store con la URL del servidor
      if (user) {
        setUser({ ...user, avatar: avatarUrl });
      }
      setPreview(avatarUrl);

      // Limpiar data URLs antiguas de localStorage después de una subida exitosa
      cleanAvatarDataUrls();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al subir la imagen';
      setUploadError(message);
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

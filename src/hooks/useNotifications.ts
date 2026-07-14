import { useState, useEffect, useCallback, useRef } from 'react';
import { type NotificationPrefs, saveNotificationsRequest } from '../services/authService';

const STORAGE_KEY = 'wf_notifs';

const DEFAULT_PREFS: NotificationPrefs = {
  sesiones:  true,
  programas: true,
  alumnos:   false,
  reportes:  false,
};

const loadFromStorage = (): NotificationPrefs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PREFS;
};

const saveToStorage = (prefs: NotificationPrefs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

// ── Hook ──────────────────────────────────────
export const useNotifications = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadFromStorage);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar desde localStorage al montar (por si hay cambio desde otra pestaña)
  useEffect(() => {
    setPrefs(loadFromStorage());
  }, []);

  // Guardar en API con debounce de 800ms para no spamear en múltiples toggles rápidos
  const syncToApi = useCallback((newPrefs: NotificationPrefs) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSyncStatus('saving');
    debounceRef.current = setTimeout(async () => {
      try {
        await saveNotificationsRequest(newPrefs);
        setSyncStatus('saved');
        // Volver a idle después de 2.5 segundos
        setTimeout(() => setSyncStatus('idle'), 2500);
      } catch {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }, 800);
  }, []);

  // Alternar un toggle → guarda en localStorage inmediatamente + dispara sync API
  const toggle = useCallback((key: keyof NotificationPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveToStorage(next);   // ← persistencia inmediata en localStorage
      syncToApi(next);       // ← sync a la API (debounced)
      return next;
    });
  }, [syncToApi]);

  // Guardar todo explícitamente (botón "Guardar")
  const saveAll = useCallback(async () => {
    saveToStorage(prefs);
    await syncToApi(prefs);
  }, [prefs, syncToApi]);

  return { prefs, toggle, saveAll, syncStatus };
};

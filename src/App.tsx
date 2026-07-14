import { useEffect, useState } from 'react';
import { AppRouter } from './routes/AppRouter';
import useAuthStore from './store/authStore';

function App() {
  const token = useAuthStore((s) => s.token) ?? localStorage.getItem('wf_token');
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const [ready, setReady] = useState(!token);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        await refreshSession();
      } catch {
        window.location.href = '/auth/login';
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [refreshSession, token]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Cargando sesión...
      </div>
    );
  }

  return <AppRouter />;
}

export default App;
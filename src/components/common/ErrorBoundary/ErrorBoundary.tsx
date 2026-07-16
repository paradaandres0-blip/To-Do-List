import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Permite reportar el error a un servicio de observabilidad cuando esté disponible. */
  onError?: (error: Error, errorInfo?: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Evita que un error de la interfaz deje la aplicación en una pantalla en blanco.
 * También escucha errores no controlados de recursos o promesas asíncronas.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidMount() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logError(error, errorInfo);
  }

  private handleWindowError = (event: ErrorEvent) => {
    const error = event.error instanceof Error ? event.error : new Error(event.message || 'Error inesperado');
    this.captureAsyncError(error);
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error('Ocurrió un error inesperado al cargar la aplicación');
    this.captureAsyncError(error);
  };

  private captureAsyncError(error: Error) {
    this.logError(error);
    this.setState({ error });
  }

  private logError(error: Error, errorInfo?: ErrorInfo) {
    console.error('Error no controlado en la aplicación', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private reloadPage = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="error-boundary" role="alert" aria-live="assertive">
        <section className="error-boundary__card">
          <div className="error-boundary__icon" aria-hidden="true">
            <AlertTriangle size={30} />
          </div>
          <p className="error-boundary__eyebrow">Error inesperado</p>
          <h1>Algo no salió como esperábamos</h1>
          <p>
            Ocurrió un problema al cargar esta pantalla. Puedes recargar la página para intentarlo nuevamente.
          </p>
          <button type="button" className="error-boundary__reload" onClick={this.reloadPage}>
            <RefreshCw size={17} /> Recargar página
          </button>
        </section>
      </main>
    );
  }
}

import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const BrokenComponent = () => {
  throw new Error('Fallo de prueba');
};

describe('ErrorBoundary', () => {
  it('muestra una interfaz de recuperación y registra el error', () => {
    const logError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Algo no salió como esperábamos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recargar página' })).toBeInTheDocument();
    expect(logError).toHaveBeenCalled();

    logError.mockRestore();
  });
});

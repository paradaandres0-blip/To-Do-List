import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';

describe('Loader', () => {
  it('renders spinner label', () => {
    render(<Loader label="Cargando datos" />);
    expect(screen.getByText('Cargando datos')).toBeInTheDocument();
  });

  it('renders skeleton blocks', () => {
    render(<Loader variant="skeleton" count={2} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

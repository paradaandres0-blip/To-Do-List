import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders title and children', () => {
    render(<Card title="Título">Contenido</Card>);
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });
});

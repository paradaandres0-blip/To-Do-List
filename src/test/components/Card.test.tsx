import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../../components/common/Card/Card';

describe('Card Component', () => {
  it('debería renderizar children correctamente', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('debería renderizar title cuando se proporciona', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('debería renderizar footer cuando se proporciona', () => {
    render(<Card footer="Test Footer">Content</Card>);
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('debería aplicar variant por defecto', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('section');
    expect(card).toHaveClass('bg-white/90', 'border-slate-200', 'shadow-sm');
  });

  it('debería aplicar variant elevated', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    const card = container.querySelector('section');
    expect(card).toHaveClass('bg-white', 'shadow-lg');
  });

  it('debería aplicar variant outlined', () => {
    const { container } = render(<Card variant="outlined">Content</Card>);
    const card = container.querySelector('section');
    expect(card).toHaveClass('bg-transparent', 'border-2', 'border-slate-300');
  });

  it('debería aplicar className personalizado', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.querySelector('section');
    expect(card).toHaveClass('custom-class');
  });
});

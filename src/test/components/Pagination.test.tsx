import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../../components/common/Pagination/Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it('debería no renderizarse cuando totalPages es 1', () => {
    const { container } = render(
      <Pagination
        page={1}
        pageSize={10}
        total={5}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debería renderizar información de paginación', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={25}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );
    expect(screen.getByText(/resultados/)).toBeInTheDocument();
    expect(screen.getByLabelText('Página anterior')).toBeInTheDocument();
    expect(screen.getByLabelText('Página siguiente')).toBeInTheDocument();
  });

  it('debería mostrar "Cargando..." cuando isLoading es true', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={25}
        totalPages={3}
        onPageChange={mockOnPageChange}
        isLoading={true}
      />
    );
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('debería llamar onPageChange al hacer clic en página siguiente', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={25}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByLabelText('Página siguiente');
    fireEvent.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('debería llamar onPageChange al hacer clic en página anterior', () => {
    render(
      <Pagination
        page={2}
        pageSize={10}
        total={25}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByLabelText('Página anterior');
    fireEvent.click(prevButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('debería deshabilitar botón anterior en primera página', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={25}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByLabelText('Página anterior');
    expect(prevButton).toBeDisabled();
  });

  it('debería deshabilitar botón siguiente en última página', () => {
    render(
      <Pagination
        page={3}
        pageSize={10}
        total={25}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByLabelText('Página siguiente');
    expect(nextButton).toBeDisabled();
  });

  it('debería renderizar números de página correctamente', () => {
    render(
      <Pagination
        page={2}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByLabelText('Ir a página 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Ir a página 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Ir a página 3')).toBeInTheDocument();
  });

  it('debería mostrar ellipsis para muchas páginas', () => {
    render(
      <Pagination
        page={5}
        pageSize={10}
        total={100}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const ellipsis = screen.getAllByText('…');
    expect(ellipsis.length).toBeGreaterThan(0);
  });
});

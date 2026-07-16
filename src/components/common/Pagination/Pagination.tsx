import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const siblingCount = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (page > siblingCount + 2) {
      pages.push('...');
    }

    const start = Math.max(2, page - siblingCount);
    const end = Math.min(totalPages - 1, page + siblingCount);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - (siblingCount + 1)) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  const btnBase =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-200';

  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
      <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
        {isLoading ? (
          'Cargando...'
        ) : (
          <>
            <span className="font-semibold" style={{ color: '#475569' }}>
              {startItem}–{endItem}
            </span>{' '}
            de <span className="font-semibold" style={{ color: '#475569' }}>{total}</span> resultados
          </>
        )}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          className={`${btnBase} ${page <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100'}`}
          style={{ color: '#475569' }}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="inline-flex items-center justify-center min-w-[36px] h-9 text-sm" style={{ color: '#94a3b8' }}>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              disabled={isLoading}
              onClick={() => onPageChange(p)}
              className={btnBase}
              style={
                p === page
                  ? { background: 'rgba(124,58,237,0.1)', color: '#7c3aed', fontWeight: 700 }
                  : { color: '#475569' }
              }
              aria-label={`Ir a página ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
          className={`${btnBase} ${page >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100'}`}
          style={{ color: '#475569' }}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
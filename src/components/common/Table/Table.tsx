import React, { useMemo, useState } from 'react';

export interface TableColumn<T> {
  /** Column header label. */
  header: string;
  /** Key used to access item property. */
  key: keyof T;
  /** Optional renderer for custom content. */
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

export interface TableProps<T extends Record<string, unknown>> {
  /** Data rows to render. */
  data: T[];
  /** Column definitions. */
  columns: TableColumn<T>[];
  /** Number of rows per page. */
  pageSize?: number;
  /** Optional empty-state message. */
  emptyMessage?: string;
}

export const Table = <T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 5,
  emptyMessage = 'No hay datos disponibles.',
}: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (typeof left === 'number' && typeof right === 'number') {
        return sortDirection === 'asc' ? left - right : right - left;
      }
      const leftText = String(left ?? '').toLowerCase();
      const rightText = String(right ?? '').toLowerCase();
      return sortDirection === 'asc'
        ? leftText.localeCompare(rightText)
        : rightText.localeCompare(leftText);
    });
    return copy;
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [safePage, pageSize, sortedData]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="px-3 py-2 text-left font-semibold text-slate-700">
                <button type="button" className="flex items-center gap-1" onClick={() => handleSort(column.key)}>
                  {column.header}
                  {sortKey === column.key ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-100">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-3 py-2 text-slate-600">
                    {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-sm text-slate-500">
        <span>Página {safePage} de {totalPages}</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-slate-200 px-2 py-1 disabled:opacity-50"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
          >
            Anterior
          </button>
          <button
            type="button"
            className="rounded border border-slate-200 px-2 py-1 disabled:opacity-50"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safePage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

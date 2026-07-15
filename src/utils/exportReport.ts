export type ExportSessionRow = {
  date: string;
  course: string;
  status: string;
  duration: number;
};

const FORMAT_DATE = (value: string) =>
  new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/** Descarga un CSV genérico. */
export function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const csv = [header, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Exporta sesiones a CSV. */
export function exportSessionsCsv(
  sessions: ExportSessionRow[],
  filename = 'reporte-sesiones.csv',
) {
  const header = ['Fecha', 'Curso', 'Estado', 'Duración (min)'];
  const rows = sessions.map((s) => [
    s.date,
    s.course,
    s.status,
    String(s.duration),
  ]);
  downloadCsv(filename, header, rows);
}

/** Abre una ventana imprimible (PDF via diálogo del navegador). */
export function exportSessionsPdf(
  sessions: ExportSessionRow[],
  periodLabel = 'Todos los periodos',
) {
  const rows = sessions
    .map(
      (session) => `
      <tr>
        <td style="padding:8px;border:1px solid #eceff1">${FORMAT_DATE(session.date)}</td>
        <td style="padding:8px;border:1px solid #eceff1">${session.course}</td>
        <td style="padding:8px;border:1px solid #eceff1">${session.status}</td>
        <td style="padding:8px;border:1px solid #eceff1">${session.duration} min</td>
      </tr>
    `,
    )
    .join('');

  const html = `
    <html>
      <head><title>Reporte de Sesiones</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a;">
        <h1>Reporte de Sesiones</h1>
        <p>Periodo: ${periodLabel}</p>
        <table style="width:100%; border-collapse: collapse; margin-top:16px;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #cbd5e1;background:#f8fafc;text-align:left">Fecha</th>
              <th style="padding:8px;border:1px solid #cbd5e1;background:#f8fafc;text-align:left">Curso</th>
              <th style="padding:8px;border:1px solid #cbd5e1;background:#f8fafc;text-align:left">Estado</th>
              <th style="padding:8px;border:1px solid #cbd5e1;background:#f8fafc;text-align:left">Duración</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8">Sin sesiones</td></tr>'}</tbody>
        </table>
        <p style="margin-top:24px; font-size:0.95rem; color: #475569;">Sesiones totales: ${sessions.length}</p>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

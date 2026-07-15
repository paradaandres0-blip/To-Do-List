export type MonthlyBar = {
  label: string;
  val: number;
  year: number;
  monthIndex: number;
};

const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTH_LONG = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Pseudoaleatorio estable por seed (evita valores fijos de un año estático). */
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Últimos N meses a partir de hoy (labels y año dinámicos).
 * Los valores son fake pero se recalculan según el mes actual.
 */
export function buildMonthlySessionsChart(count = 7): MonthlyBar[] {
  const now = new Date();
  const bars: MonthlyBar[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const seed = d.getFullYear() * 100 + d.getMonth();
    // Tendencia suave al alza hacia el mes actual + variación
    const trend = ((count - 1 - i) / Math.max(count - 1, 1)) * 50;
    const val = Math.round(45 + trend + seeded(seed) * 70);

    bars.push({
      label: MONTH_SHORT[d.getMonth()],
      val,
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    });
  }

  return bars;
}

export function currentMonthBadge(date = new Date()): string {
  return `${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function chartPeriodLabel(bars: MonthlyBar[]): string {
  if (bars.length === 0) return 'Sin período';
  const years = [...new Set(bars.map((b) => b.year))];
  if (years.length === 1) return `Sesiones · ${years[0]}`;
  return `Sesiones · ${years[0]}–${years[years.length - 1]}`;
}

export function chartMiniStats(bars: MonthlyBar[]) {
  if (bars.length === 0) {
    return [
      { label: 'Promedio', value: '—' },
      { label: 'Pico', value: '—' },
      { label: 'Último mes', value: '—' },
    ];
  }

  const vals = bars.map((b) => b.val);
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const peak = Math.max(...vals);
  const last = vals[vals.length - 1];
  const prev = vals.length > 1 ? vals[vals.length - 2] : last;
  const deltaPct = prev === 0 ? 0 : Math.round(((last - prev) / prev) * 100);

  return [
    { label: 'Promedio', value: String(avg) },
    { label: 'Pico', value: String(peak) },
    {
      label: 'Vs mes ant.',
      value: `${deltaPct >= 0 ? '+' : ''}${deltaPct}%`,
    },
  ];
}

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

export function buildMonthlySessionsChart(sessions: { date: string }[] = [], count = 7): MonthlyBar[] {
  const latestTimestamp = sessions.reduce((max, session) => {
    const timestamp = new Date(session.date).getTime();
    return timestamp > max ? timestamp : max;
  }, 0);
  const referenceDate = latestTimestamp ? new Date(latestTimestamp) : new Date();

  const bars: MonthlyBar[] = Array.from({ length: count }, (_, index) => {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - (count - 1 - index), 1);
    return {
      label: MONTH_SHORT[d.getMonth()],
      val: 0,
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    };
  });

  sessions.forEach((session) => {
    const sessionDate = new Date(session.date);
    const bar = bars.find((b) => b.year === sessionDate.getFullYear() && b.monthIndex === sessionDate.getMonth());
    if (bar) bar.val += 1;
  });

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

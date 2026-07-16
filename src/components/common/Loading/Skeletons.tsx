import { COLORS } from '../../../constants/colors';

// ── Skeleton Card ──
export const SkeletonCard = ({ lines = 3 }: { lines?: number }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <div className="animate-pulse space-y-3">
      <div className="h-4 rounded bg-slate-200" style={{ width: '60%' }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-slate-100"
          style={{ width: i === lines - 1 ? '80%' : '100%' }}
        />
      ))}
    </div>
  </div>
);

// ── Skeleton Table ──
export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    {/* Header */}
    <div className="animate-pulse flex gap-4 px-5 py-3 border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-slate-200 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 px-5 py-4 border-b border-slate-50 last:border-b-0">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-3 rounded bg-slate-100 flex-1"
            style={{
              width: colIndex === 0 ? '40%' : colIndex === cols - 1 ? '20%' : '30%',
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

// ── Skeleton List ──
export const SkeletonList = ({ items = 4 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded bg-slate-200 w-3/4" />
            <div className="h-2.5 rounded bg-slate-100 w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ── Skeleton Stats Grid ──
export const SkeletonStatsGrid = ({ cards = 4 }: { cards?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200" />
          <div className="h-8 w-20 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

// ── Skeleton Profile Header ──
export const SkeletonProfileHeader = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
    <div className="animate-pulse px-6 py-8 flex flex-col sm:flex-row gap-5">
      <div className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-6 rounded bg-slate-200 w-1/3" />
        <div className="h-4 rounded bg-slate-100 w-1/2" />
      </div>
    </div>
  </div>
);

// ── Skeleton Form ──
export const SkeletonForm = ({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="animate-pulse space-y-2">
        <div className="h-3 rounded bg-slate-200 w-24" />
        <div className="h-10 rounded-xl bg-slate-100 w-full" />
      </div>
    ))}
  </div>
);
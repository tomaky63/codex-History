'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface CaseListItem {
  slug: string;
  title: string;
  oneLiner: string;
  summary:  string;
  periodStart: number | null;
  periodEnd:   number | null;
  industry:    string | null;
  turningPointCount: number;
  themes: Array<{ slug: string; name: string }>;
  tags:   Array<{ slug: string; name: string }>;
}

export interface ThemeOption {
  slug:  string;
  name:  string;
  count: number;
}

type View = 'grid' | 'table' | 'timeline';

export default function CasesView({
  cases,
  themes,
}: {
  cases: CaseListItem[];
  themes: ThemeOption[];
}) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const initialTheme = searchParams?.get('theme') ?? '';
  const initialQuery = searchParams?.get('q')     ?? '';

  const [theme, setTheme] = useState<string>(initialTheme);
  const [query, setQuery] = useState<string>(initialQuery);
  const [view,  setView]  = useState<View>('grid');

  // URL ↔ state 同期（戻る/進むで state を更新）
  useEffect(() => {
    setTheme(searchParams?.get('theme') ?? '');
    setQuery(searchParams?.get('q')     ?? '');
  }, [searchParams]);

  const syncUrl = useCallback((next: { theme?: string; q?: string }) => {
    const params = new URLSearchParams();
    const t = next.theme ?? theme;
    const q = next.q     ?? query;
    if (t) params.set('theme', t);
    if (q) params.set('q',     q);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, theme, query]);

  const qTrimmed = query.trim();

  const filtered = useMemo(() => {
    const q = qTrimmed.toLowerCase();
    return cases.filter(c => {
      if (theme && !c.themes.some(t => t.slug === theme)) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.oneLiner.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.tags.some(t => (t.name || '').toLowerCase().includes(q))
      );
    });
  }, [cases, theme, qTrimmed]);

  function onChipClick(slug: string) {
    const next = theme === slug ? '' : slug;
    setTheme(next);
    syncUrl({ theme: next });
  }

  return (
    <div>
      {/* 検索 + テーマチップ */}
      <div className="flex flex-col gap-3 pb-4 mb-5 border-b border-cream-500">

        {/* 検索入力 */}
        <div className="flex items-center gap-2 border border-cream-500 bg-cream-50 rounded-md px-3 py-1.5 w-full md:max-w-md focus-within:border-wine focus-within:ring-1 focus-within:ring-wine/40">
          <span aria-hidden className="text-ink-500">⌕</span>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onBlur={() => syncUrl({ q: query.trim() })}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                syncUrl({ q: query.trim() });
              }
            }}
            placeholder="タイトル・一言・本文・タグから検索"
            className="flex-1 bg-transparent outline-none text-[13px] text-ink-900 placeholder:text-ink-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); syncUrl({ q: '' }); }}
              className="text-[11px] text-ink-500 hover:text-wine"
              aria-label="検索をクリア"
            >
              ✕
            </button>
          )}
        </div>

        {/* テーマチップ */}
        <div className="flex flex-wrap gap-1.5 text-[12px]">
          <button
            type="button"
            onClick={() => { setTheme(''); syncUrl({ theme: '' }); }}
            className={[
              'rounded-md px-2.5 py-[5px] border font-medium transition-colors',
              !theme
                ? 'border-wine bg-wine text-cream-50'
                : 'border-cream-500 bg-cream-50 text-ink-700 hover:border-wine/40',
            ].join(' ')}
          >
            All
          </button>
          {themes.map(t => {
            const active = theme === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => onChipClick(t.slug)}
                className={[
                  'rounded-md px-2.5 py-[5px] border font-medium transition-colors inline-flex items-center gap-1.5',
                  active
                    ? 'border-wine bg-wine text-cream-50'
                    : 'border-cream-500 bg-cream-50 text-ink-700 hover:border-wine/40',
                ].join(' ')}
              >
                {t.name}
                <span className={active ? 'font-mono opacity-80' : 'font-mono text-ink-400'}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 検索一致バナー */}
      {qTrimmed && (
        <div className="flex items-center gap-3 mb-4 text-[13px]">
          <span className="text-ink-700">
            「<span className="font-semibold text-wine">{qTrimmed}</span>」に一致する {filtered.length} 件
          </span>
          <button
            type="button"
            onClick={() => { setQuery(''); syncUrl({ q: '' }); }}
            className="text-[12px] text-wine hover:underline"
          >
            ✕ 検索解除
          </button>
        </div>
      )}

      {/* ビュー切替 */}
      <div className="flex justify-between md:justify-end items-center mb-5 gap-3">
        <div className="text-[12px] text-ink-500 md:hidden">
          {filtered.length} 件
        </div>
        <div className="inline-flex gap-1 p-[3px] border border-cream-500 rounded-lg bg-cream-50">
          {(['grid', 'table', 'timeline'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={[
                'px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors',
                view === v ? 'bg-cream-400 text-wine' : 'text-ink-600 hover:text-wine',
              ].join(' ')}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'grid'     && <GridView cases={filtered} />}
      {view === 'table'    && <TableView cases={filtered} />}
      {view === 'timeline' && <TimelineView cases={filtered} />}
    </div>
  );
}

// ──────────────────────────────────────────────
// Grid
// ──────────────────────────────────────────────
function GridView({ cases }: { cases: CaseListItem[] }) {
  if (cases.length === 0) {
    return <p className="text-sm text-ink-500">該当する事例がありません。</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-16">
      {cases.map(c => (
        <Link
          key={c.slug}
          href={`/cases/${c.slug}`}
          className="block border border-cream-500 rounded-[10px] bg-cream-50 p-5 hover:border-wine/40 hover:shadow-sm transition-all"
        >
          <div className="font-mono text-[11px] text-ink-500 mb-2.5">
            {formatPeriod(c)}
            {c.industry && (
              <span className="ml-2.5 text-ink-400">{c.industry}</span>
            )}
          </div>
          <h3 className="font-serif text-[18px] font-bold tracking-tight leading-snug mb-2">
            {c.title}
          </h3>
          {c.oneLiner && (
            <p className="text-[13px] text-ink-700 leading-[1.65] mb-3.5 line-clamp-3">{c.oneLiner}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {c.themes.slice(0, 2).map(t => (
              <span key={t.slug} className="text-[10px] bg-cream-400 text-wine rounded px-[7px] py-0.5 font-medium">
                {t.name}
              </span>
            ))}
            {c.tags.slice(0, 2).map(t => (
              <span key={t.slug} className="text-[10px] bg-cream-300 text-ink-600 rounded px-[7px] py-0.5">
                {t.name}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Table
// ──────────────────────────────────────────────
function TableView({ cases }: { cases: CaseListItem[] }) {
  if (cases.length === 0) {
    return <p className="text-sm text-ink-500">該当する事例がありません。</p>;
  }
  return (
    <div className="border border-cream-500 rounded-[10px] bg-cream-50 overflow-x-auto mb-16">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[60px_1fr_100px_100px_140px_100px] px-4 py-2.5 text-[11px] text-ink-500 font-semibold uppercase tracking-wider bg-cream-100 border-b border-cream-500">
          <span>#</span>
          <span>Title</span>
          <span>Start</span>
          <span>End</span>
          <span>Industry</span>
          <span>転換点</span>
        </div>
        {cases.map((c, i) => (
          <Link
            key={c.slug}
            href={`/cases/${c.slug}`}
            className="grid grid-cols-[60px_1fr_100px_100px_140px_100px] px-4 py-3.5 border-b border-cream-400 last:border-b-0 text-[13px] hover:bg-cream-100 transition-colors"
          >
            <span className="font-mono text-ink-400">{String(i + 1).padStart(3, '0')}</span>
            <div className="min-w-0 pr-4">
              <div className="font-serif font-bold text-ink-900 truncate">{c.title}</div>
              {c.oneLiner && (
                <div className="text-[12px] text-ink-600 mt-0.5 line-clamp-1">{c.oneLiner}</div>
              )}
            </div>
            <span className="font-mono text-ink-700">{c.periodStart ?? '—'}</span>
            <span className="font-mono text-ink-700">{c.periodEnd ?? '—'}</span>
            <span className="text-ink-700 truncate">{c.industry ?? '—'}</span>
            <span>
              <span className="inline-block font-mono text-[11px] font-semibold bg-cream-400 text-wine rounded px-1.5 py-0.5">
                {c.turningPointCount}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Timeline
// ──────────────────────────────────────────────
function TimelineView({ cases }: { cases: CaseListItem[] }) {
  if (cases.length === 0) {
    return <p className="text-sm text-ink-500">該当する事例がありません。</p>;
  }

  const known = cases.filter(c => c.periodStart != null);
  const minY = known.length ? Math.min(...known.map(c => c.periodStart!)) : 1950;
  const rawMax = known.length
    ? Math.max(...known.map(c => c.periodEnd ?? c.periodStart!))
    : 2025;
  const min = Math.floor(minY / 10) * 10;
  const max = Math.ceil(rawMax / 10) * 10;
  const range = Math.max(10, max - min);
  const ticks = tickMarks(min, max);

  return (
    <div className="border border-cream-500 rounded-[10px] bg-cream-50 p-4 md:p-8 mb-16 overflow-x-auto">
      <div
        className="relative pl-5 min-w-[720px]"
        style={{ minHeight: cases.length * 44 + 40 }}
      >
        <div className="absolute left-5 right-5 top-0 h-6 border-b border-cream-500 flex justify-between font-mono text-[10px] text-ink-400 pb-1">
          {ticks.map(y => <span key={y}>{y}</span>)}
        </div>

        {cases.map((c, i) => {
          const ps = c.periodStart ?? min;
          const pe = c.periodEnd   ?? ps;
          const left  = ((ps - min) / range) * 100;
          const width = ((pe - ps) / range) * 100;
          return (
            <Link
              key={c.slug}
              href={`/cases/${c.slug}`}
              className="absolute h-7 bg-cream-400 border border-cream-600 rounded-md px-2.5 flex items-center gap-2 text-[12px] hover:bg-cream-300 hover:border-wine/40 transition-colors"
              style={{
                top: 40 + i * 36,
                left: `${left}%`,
                width: `max(160px, ${width}%)`,
              }}
            >
              <span className="font-serif font-bold text-wine truncate">{c.title}</span>
              <span className="font-mono text-wine text-[10px] ml-auto whitespace-nowrap">
                {c.periodStart ?? '—'}{c.periodEnd && c.periodEnd !== c.periodStart ? `–${c.periodEnd}` : ''}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatPeriod(c: CaseListItem): string {
  if (c.periodStart == null) return '—';
  if (c.periodEnd == null || c.periodEnd === c.periodStart) return String(c.periodStart);
  return `${c.periodStart}–${c.periodEnd}`;
}

function tickMarks(min: number, max: number): number[] {
  const span = max - min;
  const step = span <= 40 ? 10 : span <= 100 ? 20 : 50;
  const out: number[] = [];
  for (let y = min; y <= max; y += step) out.push(y);
  if (out[out.length - 1] !== max) out.push(max);
  return out;
}

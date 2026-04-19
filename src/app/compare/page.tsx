'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { withBase } from '@/lib/withBase';

// ────────────────────────────────────────────────────────────
// 型定義 (public/data/cases-full.json の形状)
// ────────────────────────────────────────────────────────────

interface ThemeRef { themeId: number; theme: { slug: string; name: string } }
interface TagRef   { tagId:   number; tag:   { slug: string; name: string; category: string | null } }
interface EventItem {
  id: number; year: number; month: number | null; day: number | null;
  title: string; description: string | null;
  eventType: string; isTurningPoint: boolean; displayOrder: number;
}
interface EntityItem {
  entityId: number; role: string; notes: string | null;
  entity: { slug: string; name: string; kind: string };
}
interface LessonItem {
  id: number; statement: string; kind: string; appliesTo: string | null; displayOrder: number;
}
interface CaseFull {
  slug: string;
  title: string;
  oneLiner: string;
  summary:  string;
  periodStart: number | null;
  periodEnd:   number | null;
  meta: string | null;
  themes:   ThemeRef[];
  tags:     TagRef[];
  events:   EventItem[];
  entities: EntityItem[];
  lessons:  LessonItem[];
}

// ────────────────────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────────────────────

const LESSON_KIND_LABEL: Record<string, string> = {
  PATTERN: 'パターン', ANTI_PATTERN: 'アンチパターン', MECHANISM: 'メカニズム',
  FORECAST_METHOD: '予測レンズ', HEURISTIC: '経験則',
};

const PLAYER_ROLE: Record<string, { label: string }> = {
  PROTAGONIST: { label: '主役'  },
  ANTAGONIST:  { label: '拮抗'  },
  DISRUPTOR:   { label: '破壊者' },
};

const ORDINALS = ['甲', '乙', '丙', '丁'];

const KEYS = ['a', 'b', 'c', 'd'] as const;
type Key = typeof KEYS[number];

// ────────────────────────────────────────────────────────────
// ページ本体
// ────────────────────────────────────────────────────────────

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 text-[13px] text-ink-500">読み込み中…</div>}>
      <CompareInner />
    </Suspense>
  );
}

function CompareInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const [allCases, setAllCases] = useState<CaseFull[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(withBase('/data/cases-full.json'))
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CaseFull[]) => { if (!cancelled) setAllCases(data); })
      .catch(err => { if (!cancelled) setLoadError(String(err)); });
    return () => { cancelled = true; };
  }, []);

  const selected: Record<Key, string> = {
    a: searchParams?.get('a') ?? '',
    b: searchParams?.get('b') ?? '',
    c: searchParams?.get('c') ?? '',
    d: searchParams?.get('d') ?? '',
  };
  const selectedSlugs = KEYS.map(k => selected[k]).filter(Boolean);

  const casesBySlug = useMemo(() => {
    const map = new Map<string, CaseFull>();
    (allCases ?? []).forEach(c => map.set(c.slug, c));
    return map;
  }, [allCases]);

  const selectedCases = selectedSlugs
    .map(s => casesBySlug.get(s))
    .filter((c): c is CaseFull => !!c);

  function updateSelection(key: Key, value: string) {
    const next: Record<Key, string> = { ...selected, [key]: value };
    const params = new URLSearchParams();
    KEYS.forEach(k => { if (next[k]) params.set(k, next[k]); });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    KEYS.forEach(k => {
      const v = String(form.get(k) ?? '');
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-6">
        <div className="font-mono text-[12px] text-ink-500 mb-1">/compare</div>
        <h1 className="font-serif text-[26px] md:text-[32px] font-extrabold tracking-tight">比較</h1>
        <p className="text-[14px] text-ink-700 mt-1.5">
          2〜4 つの事例を並べて、条件と結論を対比する。
        </p>
      </div>

      {/* モバイル向け案内カード */}
      <div className="lg:hidden border border-cream-500 rounded-[10px] bg-cream-50 p-5 mb-4">
        <div className="font-mono text-[10px] text-wine font-bold tracking-[0.08em] uppercase mb-2">
          PC 推奨
        </div>
        <p className="text-[13.5px] text-ink-700 leading-[1.75]">
          比較ビューは軸ごとに複数の事例を横並びで読む設計です。情報密度の都合で、<strong className="text-ink-900">PC もしくは横向きのタブレット</strong>でご覧ください。
        </p>
        <p className="text-[12.5px] text-ink-500 mt-2 leading-[1.7]">
          各事例の個別ページは、スマホでも快適に読める形に整えています。
        </p>
        <Link
          href="/cases"
          className="inline-block mt-3 text-[13px] text-wine hover:underline font-medium"
        >
          事例一覧に戻る →
        </Link>
      </div>

      {/* PC: 本体 */}
      <div className="hidden lg:block">
        {loadError && (
          <p className="text-sm text-wine">データの読み込みに失敗しました: {loadError}</p>
        )}

        {!allCases && !loadError && (
          <p className="text-sm text-ink-500">読み込み中…</p>
        )}

        {allCases && (
          <>
            {/* 選択フォーム */}
            <form
              onSubmit={onSubmit}
              className="mb-8 p-5 border border-cream-500 rounded-[10px] bg-cream-50"
            >
              <p className="text-[11px] font-bold text-ink-500 tracking-[0.08em] uppercase mb-4">
                比較する事例を選択（2〜4件）
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {KEYS.map((key, i) => (
                  <div key={key}>
                    <label className="block text-[11px] text-ink-500 mb-1">
                      {ORDINALS[i]} · 事例 {i + 1}
                      {i >= 2 ? '（任意）' : ''}
                    </label>
                    <select
                      name={key}
                      value={selected[key]}
                      onChange={e => updateSelection(key, e.target.value)}
                      className="w-full border border-cream-500 rounded-md px-2 py-1.5 text-[13px] text-ink-900 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-wine/40 focus:border-wine"
                    >
                      <option value="">— 選択しない —</option>
                      {allCases.map(c => (
                        <option key={c.slug} value={c.slug}>
                          {c.title}
                          {c.periodStart ? ` (${c.periodStart}${c.periodEnd && c.periodEnd !== c.periodStart ? `–${c.periodEnd}` : ''})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-wine hover:bg-wine-dark text-cream-50 text-[13px] font-medium rounded-md transition-colors"
              >
                比較する →
              </button>
              {selectedSlugs.length >= 2 && (
                <Link href="/compare" className="ml-3 text-[13px] text-ink-500 hover:text-wine">
                  リセット
                </Link>
              )}
            </form>

            {selectedCases.length >= 2 && (
              <CompareTable selectedCases={selectedCases} />
            )}

            {selectedSlugs.length === 1 && (
              <p className="text-[14px] text-ink-500 mt-4">もう1件選択してください（2件以上で比較できます）。</p>
            )}
            {selectedSlugs.length === 0 && (
              <p className="text-[14px] text-ink-500 mt-4">上のフォームから2〜4件の事例を選んで比較できます。</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 比較テーブル
// ────────────────────────────────────────────────────────────

function CompareTable({ selectedCases }: { selectedCases: CaseFull[] }) {
  const columnCount = selectedCases.length;
  const gridTemplate = `140px repeat(${columnCount}, minmax(0, 1fr))`;

  return (
    <>
      {/* 甲・乙カード */}
      <div
        className="grid gap-3 mb-6"
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {selectedCases.map((sc, i) => (
          <div key={sc.slug} className="border border-cream-500 rounded-[10px] bg-cream-50 p-5">
            <div className="font-mono text-[11px] text-ink-500 mb-1.5">
              {ORDINALS[i]} · Case {String.fromCharCode(65 + i)}
              {sc.periodStart != null && (
                <>
                  {' · '}
                  {sc.periodStart}
                  {sc.periodEnd && sc.periodEnd !== sc.periodStart ? `–${sc.periodEnd}` : ''}
                </>
              )}
            </div>
            <Link href={`/cases/${sc.slug}`} className="font-serif text-[20px] font-bold leading-[1.3] hover:text-wine block mb-1">
              {sc.title}
            </Link>
            {sc.oneLiner && (
              <p className="font-serif text-[13px] italic text-ink-700 leading-[1.6]">
                ——{sc.oneLiner}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 軸テーブル */}
      <div className="border border-cream-500 rounded-[10px] bg-cream-50 overflow-hidden">
        <div
          className="grid px-4 py-2.5 text-[11px] text-ink-500 font-bold uppercase tracking-[0.05em] bg-cream-100 border-b border-cream-500"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <span>軸</span>
          {selectedCases.map((_, i) => <span key={i}>{ORDINALS[i]}</span>)}
        </div>

        <CompareRow label="一言要約" gridTemplate={gridTemplate}>
          {selectedCases.map(c => (
            <div key={c.slug} className="text-[12.5px] text-ink-700 leading-[1.7]">
              {c.oneLiner || <span className="text-ink-400">—</span>}
            </div>
          ))}
        </CompareRow>

        <CompareRow label="変化の型" gridTemplate={gridTemplate}>
          {selectedCases.map(c => {
            const driverTags = c.tags.filter(t => t.tag.slug.startsWith('driver/'));
            const scopeTags  = c.tags.filter(t => t.tag.slug.startsWith('scope/'));
            return (
              <div key={c.slug}>
                {driverTags.length === 0 && scopeTags.length === 0 ? (
                  <span className="text-ink-400">—</span>
                ) : (
                  <div className="space-y-1">
                    {driverTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {driverTags.map(t => (
                          <span key={t.tagId} className="text-[11px] bg-cream-400 text-wine rounded px-2 py-0.5">
                            {t.tag.name || t.tag.slug}
                          </span>
                        ))}
                      </div>
                    )}
                    {scopeTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {scopeTags.map(t => (
                          <span key={t.tagId} className="text-[11px] bg-cream-300 text-ink-700 rounded px-2 py-0.5">
                            {t.tag.name || t.tag.slug}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CompareRow>

        <CompareRow label="転換点" gridTemplate={gridTemplate}>
          {selectedCases.map(c => {
            const turningPoints = c.events.filter(e => e.isTurningPoint);
            return (
              <div key={c.slug}>
                {turningPoints.length === 0 ? (
                  <span className="text-ink-400">—</span>
                ) : (
                  <ol className="space-y-2.5">
                    {turningPoints.map(e => (
                      <li key={e.id}>
                        <div className="flex gap-2">
                          <span className="font-mono text-[11px] text-wine shrink-0 font-bold mt-0.5">{e.year}</span>
                          <span className="text-[12.5px] text-ink-900 font-medium leading-[1.55]">{e.title}</span>
                        </div>
                        {e.description && (
                          <p className="text-[11.5px] text-ink-700 mt-0.5 ml-8 leading-[1.6]">{e.description}</p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </CompareRow>

        <CompareRow label="プレイヤー構造" gridTemplate={gridTemplate}>
          {selectedCases.map(c => {
            const keyPlayers = c.entities.filter(p =>
              p.role === 'PROTAGONIST' || p.role === 'ANTAGONIST' || p.role === 'DISRUPTOR'
            );
            return (
              <div key={c.slug}>
                {keyPlayers.length === 0 ? (
                  <span className="text-ink-400">—</span>
                ) : (
                  <div className="space-y-1.5">
                    {(Object.keys(PLAYER_ROLE) as Array<keyof typeof PLAYER_ROLE>).map(role => {
                      const players = keyPlayers.filter(p => p.role === role);
                      if (players.length === 0) return null;
                      const { label } = PLAYER_ROLE[role];
                      return (
                        <div key={role} className="flex items-start gap-1.5">
                          <span className="text-[11px] rounded px-1.5 py-0.5 shrink-0 bg-cream-400 text-wine font-medium">
                            {label}
                          </span>
                          <span className="text-[12px] text-ink-700 leading-snug">
                            {players.map(p => p.entity.name).join('、')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </CompareRow>

        <CompareRow label="示唆" gridTemplate={gridTemplate} last>
          {selectedCases.map(c => (
            <div key={c.slug}>
              {c.lessons.length === 0 ? (
                <span className="text-ink-400">—</span>
              ) : (
                <ul className="space-y-2.5">
                  {c.lessons.slice(0, 3).map(l => (
                    <li key={l.id} className="text-[12px] leading-[1.7]">
                      <span className="inline-block bg-cream-400 text-wine font-mono font-bold text-[10px] rounded px-1.5 py-px mr-1 align-middle">
                        {LESSON_KIND_LABEL[l.kind] ?? l.kind}
                      </span>
                      <span className="text-ink-900">{l.statement}</span>
                    </li>
                  ))}
                  {c.lessons.length > 3 && (
                    <details className="mt-1">
                      <summary className="text-[11px] text-ink-500 cursor-pointer hover:text-wine list-none">
                        残り {c.lessons.length - 3} 件 ▸
                      </summary>
                      <ul className="space-y-2.5 mt-2">
                        {c.lessons.slice(3).map(l => (
                          <li key={l.id} className="text-[12px] leading-[1.7]">
                            <span className="inline-block bg-cream-400 text-wine font-mono font-bold text-[10px] rounded px-1.5 py-px mr-1 align-middle">
                              {LESSON_KIND_LABEL[l.kind] ?? l.kind}
                            </span>
                            <span className="text-ink-900">{l.statement}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </ul>
              )}
            </div>
          ))}
        </CompareRow>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// 比較行
// ────────────────────────────────────────────────────────────

function CompareRow({
  label,
  children,
  gridTemplate,
  last,
}: {
  label: string;
  children: React.ReactNode[];
  gridTemplate: string;
  last?: boolean;
}) {
  return (
    <div
      className={[
        'grid px-4 py-4',
        last ? '' : 'border-b border-cream-400',
      ].join(' ')}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <span className="font-serif text-[13px] font-bold text-wine whitespace-nowrap">{label}</span>
      {children.map((cell, i) => (
        <div key={i} className="pl-4 pr-2">{cell}</div>
      ))}
    </div>
  );
}

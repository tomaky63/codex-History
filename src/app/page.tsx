import { prisma } from '@/lib/db';
import { getPublishedNotes } from '@/lib/notes';
import Link from 'next/link';

export default async function HomePage() {
  const [totalCount, featured, themes] = await Promise.all([
    prisma.case.count({ where: { status: 'PUBLISHED' } }),
    prisma.case.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
      include: {
        events:  { orderBy: [{ year: 'asc' }, { displayOrder: 'asc' }] },
        themes:  { include: { theme: true } },
      },
    }),
    prisma.theme.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        cases: {
          where: { case: { status: 'PUBLISHED' } },
          select: { caseId: true },
        },
      },
    }),
  ]);

  const notes = getPublishedNotes();
  const activeThemes = themes.filter(t => t.cases.length > 0).slice(0, 6);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-8 md:pt-14">

      {/* ── Hero ── */}
      <section className="mb-10 md:mb-14 grid lg:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">

        {/* 左: タイトル + CTA */}
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-cream-500 rounded-full text-[12px] text-ink-700 bg-cream-50 mb-4 md:mb-5">
            <span className="w-1.5 h-1.5 bg-wine rounded-full" aria-hidden />
            {totalCount} 事例を収録
          </div>
          <h1 className="font-serif text-[34px] md:text-[46px] lg:text-[60px] font-extrabold tracking-tight leading-[1.08] mb-4 md:mb-5">
            産業構造の変化を、<br />
            <span className="text-wine">構造化して</span>蓄積する。
          </h1>
          <p className="text-[15px] md:text-[17px] leading-[1.75] text-ink-700 mb-6 md:mb-7 max-w-[520px]">
            事例・テーマ・パターンの三層で記述した、ビジネス史のデータベース。
            転換点・関連・出典を辿りながら読める。
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/cases"
              className="bg-wine hover:bg-wine-dark text-cream-50 px-5 py-[11px] rounded-md text-[14px] font-semibold transition-colors"
            >
              事例を探す
            </Link>
            <Link
              href="/compare"
              className="hidden lg:inline-flex bg-cream-50 hover:bg-cream-100 text-ink-900 border border-cream-500 px-5 py-[11px] rounded-md text-[14px] font-semibold transition-colors"
            >
              比較モード →
            </Link>
            <Link
              href="/themes"
              className="lg:hidden bg-cream-50 hover:bg-cream-100 text-ink-900 border border-cream-500 px-5 py-[11px] rounded-md text-[14px] font-semibold transition-colors"
            >
              テーマを見る →
            </Link>
          </div>
        </div>

        {/* 右: 特集カード */}
        {featured && <FeaturedCaseCard c={featured} />}
      </section>

      {/* ── Philosophy ── */}
      <section className="mb-12 md:mb-16">
        <div className="border border-cream-500 rounded-2xl bg-cream-50 px-6 md:px-12 py-8 md:py-10 relative overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-wine/[0.03] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" aria-hidden />
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-wine/[0.03] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" aria-hidden />

          <div className="relative max-w-2xl">
            <blockquote className="font-serif text-[20px] md:text-[24px] font-bold tracking-tight leading-[1.4] text-ink-900 mb-6 md:mb-7">
              歴史は繰り返さない。だが、しばしば韻を踏む。
            </blockquote>

            <p className="text-[14px] md:text-[15px] text-ink-700 leading-[2] mb-4">
              事業の成立、熱狂と崩壊、規制変更、産業再編。<br />
              時代も業界も違って見える出来事の奥には、<br />
              繰り返し現れる力学がある。
            </p>
            <p className="text-[14px] md:text-[15px] text-ink-500 leading-[2]">
              過去を振り返るためではなく、<br />
              現在を読み解き、次を考えるために。
            </p>
          </div>
        </div>
      </section>

      {/* ── テーマ + パターン ── */}
      <section className="grid lg:grid-cols-[2fr_1fr] gap-8 md:gap-12 mb-12">

        {/* テーマ 2x3 */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-[22px] font-extrabold tracking-tight">テーマで読む</h2>
            <Link href="/themes" className="text-[13px] text-wine hover:text-wine-dark font-medium">
              すべて →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {activeThemes.map(t => (
              <Link
                key={t.slug}
                href={`/themes/${t.slug}`}
                className="min-w-0 overflow-hidden border border-cream-500 rounded-[10px] bg-cream-50 p-5 hover:border-wine/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <h3 className="min-w-0 font-serif text-[17px] font-bold leading-snug tracking-tight break-words">{t.name}</h3>
                  <span className="font-mono text-[11px] text-ink-500 shrink-0">{t.cases.length}</span>
                </div>
                {t.description && (
                  <p className="text-[12px] text-ink-600 leading-[1.65] break-words">{t.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* パターン aside */}
        <aside>
          <h2 className="text-[13px] font-bold text-ink-500 uppercase tracking-[0.08em] mb-3">
            繰り返されるパターン
          </h2>
          {notes.length === 0 ? (
            <p className="text-[12px] text-ink-500">パターン記事はまだありません。</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {notes.map(n => (
                <li key={n.frontmatter.slug}>
                  <Link
                    href={`/notes/${n.frontmatter.slug}`}
                    className="block border border-cream-500 rounded-lg p-3 bg-cream-50 hover:border-wine/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[9px] px-1.5 py-px rounded bg-cream-400 text-wine font-bold tracking-wider uppercase">
                        Pattern
                      </span>
                      {n.frontmatter.related_cases && (
                        <span className="font-mono text-[10px] text-ink-400">
                          {n.frontmatter.related_cases.length}例
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] font-medium text-ink-900">{n.frontmatter.title}</div>
                    {n.frontmatter.subtitle && (
                      <div className="text-[11px] text-ink-600 mt-0.5 line-clamp-2">
                        {n.frontmatter.subtitle}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Featured Case Card
// ──────────────────────────────────────────────────

function FeaturedCaseCard({
  c,
}: {
  c: {
    slug: string;
    title: string;
    oneLiner: string;
    periodStart: number | null;
    periodEnd:   number | null;
    events: Array<{ id: number; year: number; isTurningPoint: boolean }>;
  };
}) {
  const turningPoints = c.events.filter(e => e.isTurningPoint);

  // タイムライン用の年レンジ
  const years = c.events.map(e => e.year);
  const yStart = c.periodStart ?? (years.length ? Math.min(...years) : 2000);
  const yEnd   = c.periodEnd   ?? (years.length ? Math.max(...years) : 2020);
  const yRange = Math.max(1, yEnd - yStart);

  return (
    <Link
      href={`/cases/${c.slug}`}
      className="block border border-cream-500 rounded-xl bg-cream-50 overflow-hidden shadow-[0_1px_2px_rgba(110,31,42,0.04)] hover:shadow-md transition-shadow"
    >
      {/* ラベル行 */}
      <div className="px-5 py-3.5 border-b border-cream-400 flex items-center gap-2 text-[12px]">
        <span className="font-serif text-wine font-bold">◆ 特集</span>
        <span className="text-ink-400">·</span>
        <span className="text-ink-500 font-mono">{c.slug}</span>
      </div>

      {/* タイトル + 説明 */}
      <div className="px-[22px] pt-[22px]">
        <h3 className="font-serif text-[24px] font-extrabold leading-[1.22] tracking-tight mb-2.5">
          {c.title}
        </h3>
        {c.oneLiner && (
          <p className="text-[13.5px] text-ink-700 leading-[1.7] mb-4">{c.oneLiner}</p>
        )}

        {/* ミニタイムライン */}
        {c.events.length > 1 && (
          <div className="relative pt-[22px] pb-[30px] border-t border-cream-400">
            <div className="absolute left-1 right-1 top-1/2 h-px bg-cream-500" />
            {c.events.map((ev, i) => {
              const pct = ((ev.year - yStart) / yRange) * 100;
              const size = ev.isTurningPoint ? 10 : 6;
              const yOffset = i % 2 === 0 ? '-18px' : '14px';
              return (
                <div
                  key={ev.id}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pct}%` }}
                >
                  <span
                    className="block rounded-full border-2 border-cream-50"
                    style={{
                      width:  size,
                      height: size,
                      backgroundColor: ev.isTurningPoint ? '#6e1f2a' : '#a8976f',
                      boxShadow: `0 0 0 1px ${ev.isTurningPoint ? '#6e1f2a' : '#a8976f'}`,
                    }}
                  />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] text-ink-500 whitespace-nowrap"
                    style={{ top: yOffset }}
                  >
                    {ev.year}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* フッタ統計 */}
      <div className="px-5 py-3 border-t border-cream-400 bg-cream-100 flex gap-4 text-[11px] text-ink-500">
        <span>転換点 <span className="text-ink-900 font-semibold">{turningPoints.length}</span></span>
        <span>·</span>
        <span>イベント <span className="text-ink-900 font-semibold">{c.events.length}</span></span>
        <span>·</span>
        <span>
          {c.periodStart ?? '—'}
          {c.periodEnd && c.periodEnd !== c.periodStart ? `–${c.periodEnd}` : ''}
        </span>
        <span className="ml-auto text-wine font-semibold">開く →</span>
      </div>
    </Link>
  );
}

import { prisma } from '@/lib/db';
import { getCaseContent } from '@/lib/content';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import CaseDetailTabs, { type TabDef } from './CaseDetailTabs';

export async function generateStaticParams() {
  const cases = await prisma.case.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
  });
  return cases.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await prisma.case.findUnique({ where: { slug: params.slug } });
  if (!c || c.status !== 'PUBLISHED') return { title: params.slug };
  return { title: c.title };
}

const ROLE_LABEL: Record<string, string> = {
  PROTAGONIST: '主役', ANTAGONIST: '競合', ENABLER: '協力者',
  DISRUPTOR: '破壊者', REGULATOR: '規制', CUSTOMER: '顧客',
  SUPPLIER: '供給者', PARTNER: 'パートナー', OTHER: 'その他',
};

const LESSON_KIND_LABEL: Record<string, string> = {
  PATTERN: 'パターン', ANTI_PATTERN: 'アンチパターン', MECHANISM: 'メカニズム',
  FORECAST_METHOD: '予測レンズ', HEURISTIC: '経験則',
};

const RELATION_TYPE_LABEL: Record<string, string> = {
  CONTRAST: '対比', PRECEDENT: '先行例', DERIVATIVE: '派生',
  SIMILAR_MECHANISM: '類似メカニズム', SAME_INDUSTRY: '同一業界', SAME_PATTERN: '同一パターン',
};

const COMPARE_PRIORITY: Record<string, number> = {
  CONTRAST: 0, SIMILAR_MECHANISM: 1, SAME_PATTERN: 2,
  PRECEDENT: 3, DERIVATIVE: 4, SAME_INDUSTRY: 5,
};
const COMPARE_DEFAULT_REASON: Record<string, string> = {
  CONTRAST:          '対照的な構造で、比べると双方の特徴が際立つ',
  SIMILAR_MECHANISM: '同じメカニズムが働いており、条件の違いが見える',
  SAME_PATTERN:      '同じパターンが異なる文脈で現れた事例',
  PRECEDENT:         '先行例として並べると構造の伝播が見える',
  DERIVATIVE:        '派生事例として比較すると共通の論理が見える',
  SAME_INDUSTRY:     '同じ産業での異なる局面として比較できる',
};

export default async function CaseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const [dbCase, mdContent] = await Promise.all([
    prisma.case.findUnique({
      where: { slug },
      include: {
        themes:   { include: { theme: true } },
        tags:     { include: { tag: true } },
        events:   { orderBy: [{ year: 'asc' }, { displayOrder: 'asc' }] },
        lessons:  { orderBy: { displayOrder: 'asc' } },
        entities: { include: { entity: true }, orderBy: { role: 'asc' } },
        sources:  { include: { source: true }, orderBy: { sourceId: 'asc' } },
        relationsFrom: { where: { toCase:   { status: 'PUBLISHED' } }, include: { toCase:   true } },
        relationsTo:   { where: { fromCase: { status: 'PUBLISHED' } }, include: { fromCase: true } },
      },
    }),
    Promise.resolve(getCaseContent(slug)),
  ]);

  if (!dbCase || dbCase.status !== 'PUBLISHED') notFound();

  const turningPoints = dbCase.events.filter(e => e.isTurningPoint);

  // Entity by role
  const entityByRole = new Map<string, typeof dbCase.entities>();
  for (const ce of dbCase.entities) {
    const list = entityByRole.get(ce.role) ?? [];
    list.push(ce);
    entityByRole.set(ce.role, list);
  }

  // 関連事例の重複排除
  const seenSlugs = new Set<string>();
  type Rel = {
    id: number;
    relationType: string;
    note: string | null;
    relatedCase: { slug: string; title: string };
  };
  const mergedRelations: Rel[] = [];
  for (const r of dbCase.relationsFrom) {
    if (!seenSlugs.has(r.toCase.slug)) {
      seenSlugs.add(r.toCase.slug);
      mergedRelations.push({ id: r.id, relationType: r.relationType, note: r.note, relatedCase: r.toCase });
    }
  }
  for (const r of dbCase.relationsTo) {
    if (!seenSlugs.has(r.fromCase.slug)) {
      seenSlugs.add(r.fromCase.slug);
      mergedRelations.push({ id: r.id, relationType: r.relationType, note: r.note, relatedCase: r.fromCase });
    }
  }

  const compareCandidates = [...mergedRelations]
    .sort((a, b) => (COMPARE_PRIORITY[a.relationType] ?? 99) - (COMPARE_PRIORITY[b.relationType] ?? 99))
    .slice(0, 2)
    .map(r => ({
      slug:   r.relatedCase.slug,
      title:  r.relatedCase.title,
      reason: r.note?.trim() || COMPARE_DEFAULT_REASON[r.relationType] || '関連する事例として比較できる',
    }));

  const periodYears =
    dbCase.periodStart != null && dbCase.periodEnd != null
      ? dbCase.periodEnd - dbCase.periodStart
      : null;

  const updatedAt = dbCase.updatedAt.toISOString().slice(0, 10);
  const meta = parseMeta(dbCase.meta);

  // ──────────────── Tab content ────────────────
  const overview = (
    <div>
      {/* Summary カード */}
      {(dbCase.oneLiner || dbCase.summary) && (
        <div className="bg-cream-50 border border-cream-500 rounded-[10px] px-[22px] py-[18px] mb-6 border-l-[3px] border-l-wine">
          <div className="text-[11px] text-wine font-bold tracking-[0.08em] uppercase mb-1.5">
            Summary
          </div>
          <p className="text-[15px] leading-[1.85] text-ink-900">
            {dbCase.summary || dbCase.oneLiner}
          </p>
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-3 gap-1.5 md:gap-2.5 mb-6">
        {[
          { label: '転換点',    value: turningPoints.length },
          { label: '総イベント', value: dbCase.events.length },
          { label: '継続年数',   value: periodYears != null ? `${periodYears}年` : '—' },
        ].map(k => (
          <div key={k.label} className="border border-cream-500 rounded-[10px] bg-cream-50 px-3 py-3 md:px-4 md:py-3.5">
            <div className="text-[11px] text-ink-500 mb-1">{k.label}</div>
            <div className="font-serif text-[22px] md:text-[26px] font-extrabold tracking-tight text-wine">
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Markdown 本文 */}
      {mdContent && (
        <section className="prose max-w-none text-[15px] leading-[1.9]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {mdContent.content}
          </ReactMarkdown>
        </section>
      )}
    </div>
  );

  const timelinePanel = dbCase.events.length === 0 ? (
    <p className="text-sm text-ink-500">イベントがありません。</p>
  ) : (
    <div className="bg-cream-50 border border-cream-500 rounded-[10px] p-6">
      <div className="relative pl-6 border-l-2 border-cream-400">
        {dbCase.events.map(ev => (
          <div key={ev.id} className="relative pb-5">
            <span
              className={[
                'absolute left-[-30px] top-1 rounded-full border-2 border-cream-50',
                ev.isTurningPoint ? 'w-3 h-3' : 'w-2 h-2',
              ].join(' ')}
              style={{
                backgroundColor: ev.isTurningPoint ? '#6e1f2a' : '#a8976f',
                boxShadow: `0 0 0 ${ev.isTurningPoint ? 2 : 1}px ${ev.isTurningPoint ? '#6e1f2a' : '#a8976f'}`,
              }}
              aria-hidden
            />
            <div className="flex items-baseline gap-3 mb-0.5">
              <span
                className={[
                  'font-serif text-[18px] font-extrabold',
                  ev.isTurningPoint ? 'text-wine' : 'text-ink-900',
                ].join(' ')}
              >
                {ev.year}{ev.month ? `.${String(ev.month).padStart(2, '0')}` : ''}
              </span>
              {ev.isTurningPoint && (
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-wine bg-cream-400 px-[7px] py-0.5 rounded">
                  転換点
                </span>
              )}
            </div>
            <div
              className={[
                'text-[14px] leading-[1.6] text-ink-900',
                ev.isTurningPoint ? 'font-semibold' : 'font-medium',
              ].join(' ')}
            >
              {ev.title}
            </div>
            {ev.description && (
              <p className="text-[12.5px] text-ink-700 mt-1 leading-[1.7]">{ev.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const insightsPanel = dbCase.lessons.length === 0 ? (
    <p className="text-sm text-ink-500">示唆はまだ登録されていません。</p>
  ) : (
    <div className="flex flex-col gap-2.5">
      {dbCase.lessons.map(l => (
        <div
          key={l.id}
          className="border border-cream-500 rounded-[10px] bg-cream-50 px-5 py-4 flex gap-3.5"
        >
          <span className="font-mono text-[10px] tracking-[0.05em] bg-cream-400 text-wine font-bold uppercase px-2 py-1 rounded h-fit">
            {LESSON_KIND_LABEL[l.kind] ?? l.kind}
          </span>
          <div className="min-w-0">
            <p className="text-[14px] leading-[1.75] text-ink-900">{l.statement}</p>
            {l.appliesTo && (
              <p className="text-[12px] text-ink-500 mt-1.5">適用場面: {l.appliesTo}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const sourcesPanel = dbCase.sources.length === 0 ? (
    <p className="text-sm text-ink-500">出典は登録されていません。</p>
  ) : (
    <div className="border border-cream-500 rounded-[10px] bg-cream-50 p-6">
      <ol className="ml-6 list-decimal space-y-2 text-[13px] leading-[1.9] text-ink-900">
        {dbCase.sources.map(cs => (
          <li key={cs.sourceId}>
            <span className="text-ink-500 font-mono text-[11px] mr-2">[{cs.source.kind}]</span>
            {cs.source.title}
            {cs.source.author && ` / ${cs.source.author}`}
            {cs.source.year   && ` (${cs.source.year})`}
            {cs.source.url && (
              <a
                href={cs.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-wine hover:text-wine-dark text-[11px] underline"
              >
                URL →
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );

  const relatedPanel = mergedRelations.length === 0 ? (
    <p className="text-sm text-ink-500">関連事例はまだありません。</p>
  ) : (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {mergedRelations.slice(0, 4).map(r => (
          <Link
            key={r.id}
            href={`/compare?a=${slug}&b=${r.relatedCase.slug}`}
            className="block border border-cream-500 rounded-[10px] bg-cream-50 p-4 hover:border-wine/40 transition-colors"
          >
            <div className="text-[10px] text-wine font-bold tracking-[0.08em] uppercase mb-2">
              {RELATION_TYPE_LABEL[r.relationType] ?? r.relationType}
            </div>
            <h4 className="font-serif text-[16px] font-bold leading-snug mb-1.5">
              {r.relatedCase.title}
            </h4>
            {r.note && (
              <p className="text-[12px] text-ink-700 leading-[1.65] mb-2.5 line-clamp-2">{r.note}</p>
            )}
            <div className="text-[12px] text-wine font-semibold">比較する →</div>
          </Link>
        ))}
      </div>

      {compareCandidates.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-ink-500 uppercase tracking-[0.08em] mb-3">
            おすすめの比較
          </h3>
          <div className="space-y-3">
            {compareCandidates.map(c => (
              <div key={c.slug} className="flex items-start gap-3 border border-cream-500 rounded-[10px] bg-cream-50 p-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/cases/${c.slug}`} className="text-[14px] font-semibold text-ink-900 hover:text-wine">
                    {c.title}
                  </Link>
                  <p className="text-[12px] text-ink-700 mt-1 leading-[1.65]">{c.reason}</p>
                </div>
                <Link
                  href={`/compare?a=${slug}&b=${c.slug}`}
                  className="shrink-0 text-[12px] bg-wine hover:bg-wine-dark text-cream-50 rounded-md px-3 py-1.5 whitespace-nowrap font-medium"
                >
                  比較する →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const tabs: TabDef[] = [
    { id: 'overview',  label: '概要',      content: overview },
    { id: 'timeline',  label: 'タイムライン', count: dbCase.events.length,  content: timelinePanel },
    { id: 'insights',  label: '示唆',      count: dbCase.lessons.length,  content: insightsPanel },
    { id: 'sources',   label: '出典',      count: dbCase.sources.length,  content: sourcesPanel  },
    { id: 'related',   label: '関連',      count: mergedRelations.length, content: relatedPanel  },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6">

      {/* パンくず */}
      <nav className="font-mono text-[12px] text-ink-500 mb-4">
        <Link href="/cases" className="hover:text-wine">cases</Link>
        <span className="mx-1.5 text-cream-600">/</span>
        <span className="text-ink-900 break-all">{slug}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 md:gap-8">

        {/* メイン */}
        <article>
          {/* メタヘッダ */}
          <div className="mb-6">
            {dbCase.themes.length > 0 && (
              <div className="flex gap-1.5 mb-2.5 flex-wrap">
                {dbCase.themes.map(ct => (
                  <Link
                    key={ct.themeId}
                    href={`/themes/${ct.theme.slug}`}
                    className="text-[11px] text-wine bg-cream-400 hover:bg-cream-500 px-2.5 py-0.5 rounded font-medium transition-colors"
                  >
                    {ct.theme.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="font-serif text-[26px] md:text-[34px] lg:text-[40px] font-extrabold tracking-tight leading-[1.15] mb-2.5">
              {dbCase.title}
            </h1>

            {dbCase.oneLiner && (
              <p className="font-serif text-[15px] md:text-[18px] text-ink-700 italic leading-[1.55] mb-4">
                ——{dbCase.oneLiner}
              </p>
            )}

            <div className="flex flex-wrap gap-5 text-[13px] text-ink-700 pb-5 border-b border-cream-500">
              {dbCase.periodStart != null && (
                <span>
                  <span className="text-ink-400">期間</span>{' '}
                  <span className="font-mono font-semibold text-ink-900">
                    {dbCase.periodStart}
                    {dbCase.periodEnd && dbCase.periodEnd !== dbCase.periodStart ? `–${dbCase.periodEnd}` : ''}
                  </span>
                </span>
              )}
              {meta.region && (
                <span>
                  <span className="text-ink-400">地域</span> {meta.region}
                </span>
              )}
              {meta.industry && (
                <span>
                  <span className="text-ink-400">業界</span> {meta.industry}
                </span>
              )}
              <span className="ml-auto">
                <span className="text-ink-400">更新</span>{' '}
                <span className="font-mono">{updatedAt}</span>
              </span>
            </div>
          </div>

          {/* タブ */}
          <Suspense fallback={<div className="text-[13px] text-ink-500">読み込み中…</div>}>
            <CaseDetailTabs tabs={tabs} />
          </Suspense>
        </article>

        {/* サイドバー */}
        <aside>
          <div className="lg:sticky lg:top-[72px] space-y-4">

            {/* 登場 */}
            {dbCase.entities.length > 0 && (
              <div className="border border-cream-500 rounded-[10px] bg-cream-50 p-4">
                <div className="text-[11px] font-bold text-ink-500 tracking-[0.08em] uppercase mb-2.5">
                  登場
                </div>
                {Array.from(entityByRole.entries()).map(([role, list]) => (
                  <div key={role} className="mb-3 last:mb-0">
                    <div className="text-[11px] text-ink-400 mb-1">{ROLE_LABEL[role] ?? role}</div>
                    <div className="flex flex-wrap gap-1">
                      {list.map(ce => (
                        <span
                          key={`${ce.entityId}-${ce.role}`}
                          className="text-[12px] border border-cream-500 bg-cream-100 text-ink-700 rounded px-2 py-0.5"
                        >
                          {ce.entity.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* タグ */}
            {dbCase.tags.length > 0 && (
              <div className="border border-cream-500 rounded-[10px] bg-cream-50 p-4">
                <div className="text-[11px] font-bold text-ink-500 tracking-[0.08em] uppercase mb-2.5">
                  タグ
                </div>
                <div className="flex flex-wrap gap-1">
                  {dbCase.tags.map(ct => (
                    <Link
                      key={ct.tagId}
                      href={`/cases?q=${encodeURIComponent(ct.tag.name || ct.tag.slug)}`}
                      className="text-[11px] bg-cream-400 text-ink-700 hover:text-wine rounded px-2 py-0.5 transition-colors"
                    >
                      #{ct.tag.name || ct.tag.slug}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 比較に使う */}
            <Link
              href={`/compare?a=${slug}`}
              className="w-full border border-cream-500 bg-cream-50 hover:border-wine/40 text-ink-900 rounded-lg px-3 py-2.5 text-[13px] font-medium flex justify-between items-center"
            >
              <span>比較に使う</span>
              <span className="text-wine">→</span>
            </Link>

            {/* Admin 導線 (本番では非表示) */}
            {process.env.NEXT_PUBLIC_HIDE_ADMIN_LINKS !== '1' && (
              <Link
                href={`/admin/cases/${slug}`}
                className="block text-[11px] text-ink-400 hover:text-ink-700"
              >
                Admin で確認 →
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function parseMeta(meta: string | null): { region?: string; industry?: string } {
  if (!meta) return {};
  try {
    const obj = JSON.parse(meta);
    return {
      region:   typeof obj.region   === 'string' ? obj.region   : undefined,
      industry: typeof obj.industry === 'string' ? obj.industry : undefined,
    };
  } catch {
    return {};
  }
}

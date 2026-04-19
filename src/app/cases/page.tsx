import { prisma } from '@/lib/db';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import CasesView, { type CaseListItem, type ThemeOption } from './CasesView';

export const metadata: Metadata = { title: '事例' };

export default async function CasesPage() {
  const [cases, themes] = await Promise.all([
    prisma.case.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ periodStart: 'asc' }, { title: 'asc' }],
      include: {
        themes: { include: { theme: true } },
        tags:   { include: { tag: true } },
        events: { where: { isTurningPoint: true }, select: { id: true } },
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

  const items: CaseListItem[] = cases.map(c => ({
    slug: c.slug,
    title: c.title,
    oneLiner: c.oneLiner,
    summary:  c.summary,
    periodStart: c.periodStart,
    periodEnd:   c.periodEnd,
    industry: extractIndustry(c.meta),
    turningPointCount: c.events.length,
    themes: c.themes.map(t => ({ slug: t.theme.slug, name: t.theme.name })),
    tags:   c.tags.map(ct => ({ slug: ct.tag.slug, name: ct.tag.name || ct.tag.slug })),
  }));

  const themeOptions: ThemeOption[] = themes
    .filter(t => t.cases.length > 0)
    .map(t => ({ slug: t.slug, name: t.name, count: t.cases.length }));

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-5 md:mb-6">
        <div className="font-mono text-[12px] text-ink-500 mb-1">/cases</div>
        <h1 className="font-serif text-[26px] md:text-[32px] font-extrabold tracking-tight">
          事例 <span className="text-ink-400 font-medium">{items.length}</span>
        </h1>
      </div>

      <Suspense fallback={<div className="text-[13px] text-ink-500">読み込み中…</div>}>
        <CasesView cases={items} themes={themeOptions} />
      </Suspense>
    </div>
  );
}

function extractIndustry(meta: string | null): string | null {
  if (!meta) return null;
  try {
    const obj = JSON.parse(meta);
    if (obj && typeof obj.industry === 'string' && obj.industry) return obj.industry;
    if (obj && typeof obj.region   === 'string' && obj.region)   return obj.region;
  } catch {
    // invalid JSON, fall through
  }
  return null;
}

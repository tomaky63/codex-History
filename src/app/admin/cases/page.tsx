import { prisma } from '@/lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — 事例管理' };
export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<string, string> = {
  DRAFT:     'bg-cream-300 text-ink-600',
  REVIEW:    'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-wine text-cream-50',
};

export default async function AdminCasesPage() {
  const cases = await prisma.case.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      themes: { include: { theme: true } },
      _count: {
        select: { events: true, lessons: true, entities: true, sources: true },
      },
    },
  });

  const counts = {
    total:     cases.length,
    draft:     cases.filter(c => c.status === 'DRAFT').length,
    review:    cases.filter(c => c.status === 'REVIEW').length,
    published: cases.filter(c => c.status === 'PUBLISHED').length,
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-serif text-[22px] font-extrabold tracking-tight text-ink-900">事例管理</h1>
        <div className="flex gap-3 text-[12px] text-ink-500">
          <span>全 <span className="text-ink-900 font-semibold">{counts.total}</span> 件</span>
          <span className="text-cream-600">|</span>
          <span>Draft: {counts.draft}</span>
          <span>Review: {counts.review}</span>
          <span className="text-wine">Published: {counts.published}</span>
        </div>
      </div>

      <div className="border border-cream-500 rounded-[10px] bg-cream-50 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_120px_110px_80px_80px_80px_80px] px-4 py-2.5 text-[11px] text-ink-500 font-bold uppercase tracking-wider bg-cream-100 border-b border-cream-500">
          <span>タイトル</span>
          <span>期間</span>
          <span>Status</span>
          <span className="text-right">Events</span>
          <span className="text-right">Lessons</span>
          <span className="text-right">Entities</span>
          <span className="text-right">Sources</span>
        </div>
        {cases.map(c => (
          <div
            key={c.id}
            className="grid grid-cols-[minmax(0,1fr)_120px_110px_80px_80px_80px_80px] px-4 py-3 border-b border-cream-400 last:border-b-0 text-[13px] hover:bg-cream-100 transition-colors items-center"
          >
            <div className="min-w-0 pr-4">
              <Link href={`/admin/cases/${c.slug}`} className="font-serif font-bold text-ink-900 hover:text-wine">
                {c.title}
              </Link>
              <div className="font-mono text-[11px] text-ink-400">{c.slug}</div>
            </div>
            <span className="font-mono text-[12px] text-ink-700">
              {c.periodStart ?? '—'}
              {c.periodEnd && c.periodEnd !== c.periodStart ? `–${c.periodEnd}` : ''}
            </span>
            <span>
              <span className={`font-mono text-[10px] rounded px-2 py-0.5 font-bold tracking-wider uppercase ${STATUS_STYLE[c.status] ?? ''}`}>
                {c.status}
              </span>
            </span>
            <span className="text-right text-ink-700 font-mono">{c._count.events}</span>
            <span className="text-right text-ink-700 font-mono">{c._count.lessons}</span>
            <span className="text-right text-ink-700 font-mono">{c._count.entities}</span>
            <span className="text-right text-ink-700 font-mono">{c._count.sources}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

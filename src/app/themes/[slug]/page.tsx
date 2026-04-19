import { prisma } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const themes = await prisma.theme.findMany({ select: { slug: true } });
  return themes.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const theme = await prisma.theme.findUnique({ where: { slug: params.slug } });
  if (!theme) return { title: params.slug };
  return { title: theme.name };
}

export default async function ThemePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const theme = await prisma.theme.findUnique({ where: { slug } });
  if (!theme) notFound();

  const cases = await prisma.case.findMany({
    where: {
      status: 'PUBLISHED',
      themes: { some: { theme: { slug } } },
    },
    orderBy: [{ periodStart: 'asc' }, { title: 'asc' }],
    include: {
      themes: { include: { theme: true } },
      tags:   { include: { tag: true } },
      events: { where: { isTurningPoint: true }, orderBy: { year: 'asc' } },
    },
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <nav className="font-mono text-[12px] text-ink-500 mb-4">
        <Link href="/themes" className="hover:text-wine">themes</Link>
        <span className="mx-1.5 text-cream-600">/</span>
        <span className="text-ink-900 break-all">{slug}</span>
      </nav>

      <div className="mb-6 md:mb-8">
        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
          <h1 className="font-serif text-[26px] md:text-[32px] font-extrabold tracking-tight">{theme.name}</h1>
          <span className="text-[13px] md:text-[14px] text-ink-400">{cases.length} 件</span>
        </div>
        {theme.description && (
          <p className="text-[13px] md:text-[14px] text-ink-700 max-w-2xl leading-[1.75]">{theme.description}</p>
        )}
      </div>

      {cases.length === 0 ? (
        <p className="text-sm text-ink-500">このテーマの事例はまだありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
          {cases.map(c => (
            <Link
              key={c.id}
              href={`/cases/${c.slug}`}
              className="block border border-cream-500 rounded-[10px] bg-cream-50 p-5 hover:border-wine/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <span className="font-serif text-[17px] font-bold tracking-tight text-ink-900 leading-snug">
                  {c.title}
                </span>
                {c.periodStart != null && (
                  <span className="font-mono text-[11px] text-ink-500 shrink-0 mt-1">
                    {c.periodStart}{c.periodEnd && c.periodEnd !== c.periodStart ? `–${c.periodEnd}` : ''}
                  </span>
                )}
              </div>

              {c.oneLiner && (
                <p className="text-[13px] text-ink-700 leading-[1.65] line-clamp-2 mb-3">{c.oneLiner}</p>
              )}

              {c.events.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {c.events.slice(0, 2).map(e => (
                    <span
                      key={e.id}
                      className="text-[10px] bg-cream-400 text-wine rounded px-[7px] py-0.5"
                    >
                      TP: {e.year} {e.title.length > 18 ? e.title.slice(0, 18) + '…' : e.title}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {c.themes.map(ct => (
                  <span
                    key={ct.themeId}
                    className={[
                      'text-[10px] rounded px-[7px] py-0.5',
                      ct.theme.slug === slug
                        ? 'bg-wine text-cream-50 font-medium'
                        : 'bg-cream-400 text-wine',
                    ].join(' ')}
                  >
                    {ct.theme.name}
                  </span>
                ))}
                {c.tags.slice(0, 3).map(ct => (
                  <span key={ct.tagId} className="text-[10px] bg-cream-300 text-ink-600 rounded px-[7px] py-0.5">
                    {ct.tag.name || ct.tag.slug}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-cream-500">
        <Link href="/cases" className="text-[13px] text-wine hover:text-wine-dark font-medium">
          ← すべての事例一覧
        </Link>
      </div>
    </div>
  );
}

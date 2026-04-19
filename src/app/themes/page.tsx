import { prisma } from '@/lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'テーマ' };

export default async function ThemesPage() {
  const themes = await prisma.theme.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      cases: {
        where: { case: { status: 'PUBLISHED' } },
        orderBy: [{ case: { periodStart: 'asc' } }],
        include: {
          case: {
            select: { slug: true, title: true, periodStart: true, periodEnd: true },
          },
        },
      },
    },
  });

  const activeThemes = themes.filter(t => t.cases.length > 0);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-6">
        <div className="font-mono text-[12px] text-ink-500 mb-1">/themes</div>
        <h1 className="font-serif text-[26px] md:text-[32px] font-extrabold tracking-tight">
          テーマ <span className="text-ink-400 font-medium">{activeThemes.length}</span>
        </h1>
        <p className="text-[13px] md:text-[14px] text-ink-700 mt-1.5">
          横串の主題ごとに事例を束ねる。それぞれに成立条件と反例がある。
        </p>
      </div>

      {activeThemes.length === 0 ? (
        <p className="text-sm text-ink-500">公開中のテーマはまだありません。</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3">
          {activeThemes.map(t => (
            <Link
              key={t.id}
              href={`/themes/${t.slug}`}
              className="min-w-0 overflow-hidden block border border-cream-500 rounded-[10px] bg-cream-50 p-5 hover:border-wine/40 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <h2 className="min-w-0 font-serif text-[20px] font-bold tracking-tight break-words">{t.name}</h2>
                <span className="font-mono text-[12px] text-ink-500 shrink-0">{t.cases.length}</span>
              </div>
              {t.description && (
                <p className="text-[13px] text-ink-700 leading-[1.75] mb-3.5 break-words">{t.description}</p>
              )}
              <div className="pt-3 border-t border-cream-400">
                {t.cases.slice(0, 3).map(ct => (
                  <div
                    key={ct.case.slug}
                    className="flex justify-between text-[12px] py-1"
                  >
                    <span className="text-ink-900 truncate pr-3">{ct.case.title}</span>
                    <span className="font-mono text-ink-400 shrink-0">
                      {ct.case.periodStart ?? ''}
                    </span>
                  </div>
                ))}
                {t.cases.length > 3 && (
                  <div className="text-[11px] text-wine mt-1">
                    ほか {t.cases.length - 3} 件 →
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

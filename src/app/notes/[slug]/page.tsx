import { prisma } from '@/lib/db';
import { getNoteContent, getPublishedNotes } from '@/lib/notes';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return getPublishedNotes().map(n => ({ slug: n.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const note = getNoteContent(params.slug);
  if (!note || note.frontmatter.status !== 'published') return { title: params.slug };
  return { title: `${note.frontmatter.title} — パターン` };
}

export default async function NoteDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const note = getNoteContent(slug);
  if (!note || note.frontmatter.status !== 'published') notFound();

  const { frontmatter, content } = note;

  const relatedCaseSlugs  = frontmatter.related_cases  ?? [];
  const relatedThemeSlugs = frontmatter.related_themes ?? [];

  const [relatedCases, relatedThemes] = await Promise.all([
    relatedCaseSlugs.length > 0
      ? prisma.case.findMany({
          where: { slug: { in: relatedCaseSlugs }, status: 'PUBLISHED' },
          select: { slug: true, title: true, oneLiner: true, periodStart: true, periodEnd: true },
        })
      : Promise.resolve([]),
    relatedThemeSlugs.length > 0
      ? prisma.theme.findMany({
          where: { slug: { in: relatedThemeSlugs } },
          select: { slug: true, name: true, description: true },
        })
      : Promise.resolve([]),
  ]);

  const relatedCasesOrdered = relatedCaseSlugs
    .map(s => relatedCases.find(c => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => c != null);
  const relatedThemesOrdered = relatedThemeSlugs
    .map(s => relatedThemes.find(t => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => t != null);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <nav className="font-mono text-[12px] text-ink-500 mb-4">
        <Link href="/notes" className="hover:text-wine">notes</Link>
        <span className="mx-1.5 text-cream-600">/</span>
        <span className="text-ink-900 break-all">{slug}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 md:gap-8">
        <article>
          <div className="flex gap-1.5 mb-3">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cream-400 text-wine font-bold tracking-wider uppercase">
              Pattern
            </span>
          </div>

          <h1 className="font-serif text-[24px] md:text-[30px] lg:text-[36px] font-extrabold tracking-tight leading-[1.15] mb-2">
            {frontmatter.title}
          </h1>
          {frontmatter.subtitle && (
            <p className="text-[14px] md:text-[15px] text-ink-700 mb-3">{frontmatter.subtitle}</p>
          )}
          {frontmatter.one_liner && (
            <p className="font-serif text-[15px] md:text-[16px] italic text-ink-700 leading-[1.6] border-l-[3px] border-wine pl-4 mb-6">
              ——{frontmatter.one_liner}
            </p>
          )}

          {frontmatter.updated_at && (
            <p className="font-mono text-[11px] text-ink-400 mb-6">
              最終更新: {frontmatter.updated_at}
            </p>
          )}

          <section className="prose max-w-none text-[15px] leading-[1.9]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </section>
        </article>

        <aside>
          <div className="lg:sticky lg:top-[72px] space-y-4">
            {relatedCasesOrdered.length > 0 && (
              <div className="border border-cream-500 rounded-[10px] bg-cream-50 p-4">
                <h3 className="text-[11px] font-bold text-ink-500 tracking-[0.08em] uppercase mb-3">
                  このパターンが現れる事例
                </h3>
                <ul className="space-y-2.5">
                  {relatedCasesOrdered.map(c => (
                    <li key={c.slug}>
                      <Link
                        href={`/cases/${c.slug}`}
                        className="block border border-cream-400 rounded-lg p-3 bg-cream-50 hover:border-wine/40 transition-colors"
                      >
                        <p className="text-[12.5px] font-serif font-bold text-ink-900 mb-0.5 leading-snug">
                          {c.title}
                        </p>
                        {c.periodStart != null && (
                          <p className="font-mono text-[10px] text-ink-400 mb-1">
                            {c.periodStart}
                            {c.periodEnd && c.periodEnd !== c.periodStart ? `–${c.periodEnd}` : ''}
                          </p>
                        )}
                        {c.oneLiner && (
                          <p className="text-[11.5px] text-ink-700 line-clamp-3 leading-[1.6]">{c.oneLiner}</p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {relatedThemesOrdered.length > 0 && (
              <div className="border border-cream-500 rounded-[10px] bg-cream-50 p-4">
                <h3 className="text-[11px] font-bold text-ink-500 tracking-[0.08em] uppercase mb-2">
                  関連テーマ
                </h3>
                <ul className="space-y-1">
                  {relatedThemesOrdered.map(t => (
                    <li key={t.slug}>
                      <Link href={`/themes/${t.slug}`} className="text-[12.5px] text-wine hover:text-wine-dark">
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/notes" className="block text-[11px] text-ink-400 hover:text-ink-700">
              ← パターン一覧へ戻る
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

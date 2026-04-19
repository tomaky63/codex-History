import { getPublishedNotes } from '@/lib/notes';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'パターン' };

export default function NotesPage() {
  const notes = getPublishedNotes();

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <div className="font-mono text-[12px] text-ink-500 mb-1">/notes</div>
        <h1 className="font-serif text-[26px] md:text-[32px] font-extrabold tracking-tight">
          パターン <span className="text-ink-400 font-medium">{notes.length}</span>
        </h1>
        <p className="text-[13px] md:text-[14px] text-ink-700 max-w-2xl mt-1.5 leading-[1.75]">
          事例を横断して現れる構造的なパターンを、独立した記事として扱う場所。
          個別事例を読む前後にこちらを参照すると、同じ型が別の文脈で再演されていることが見えやすくなる。
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-ink-500">パターンはまだありません。</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-2.5 md:gap-3">
          {notes.map(n => (
            <li key={n.frontmatter.slug}>
              <Link
                href={`/notes/${n.frontmatter.slug}`}
                className="block border border-cream-500 rounded-[10px] bg-cream-50 p-5 hover:border-wine/40 hover:shadow-sm transition-all h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] px-1.5 py-px rounded bg-cream-400 text-wine font-bold tracking-wider uppercase">
                    Pattern
                  </span>
                  {n.frontmatter.related_cases && (
                    <span className="font-mono text-[10px] text-ink-400">
                      関連 {n.frontmatter.related_cases.length} 事例
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-[18px] font-bold tracking-tight leading-snug mb-1.5">
                  {n.frontmatter.title}
                </h2>
                {n.frontmatter.subtitle && (
                  <p className="text-[13px] text-ink-700 leading-[1.7] mb-1.5">{n.frontmatter.subtitle}</p>
                )}
                {n.frontmatter.one_liner && (
                  <p className="text-[12.5px] text-ink-600 leading-[1.65] line-clamp-3">
                    {n.frontmatter.one_liner}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

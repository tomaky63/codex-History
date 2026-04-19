/**
 * src/lib/notes.ts
 * パターン記事(Notes)の Markdown 読み込み・frontmatter パース。
 * 事例(Cases)とは独立したコンテンツ種別で、DB には入れず Markdown のみで完結する。
 * 事例を横断して現れる構造的パターンを独立した記事として扱う。
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const NOTES_DIR = path.join(process.cwd(), 'content', 'notes');

export interface NoteFrontmatter {
  slug: string;
  title: string;
  subtitle?: string;
  one_liner?: string;
  status: 'draft' | 'published';
  related_cases?: string[];
  related_themes?: string[];
  updated_at?: string;
}

export interface NoteContent {
  frontmatter: NoteFrontmatter;
  content: string;
}

export function getAllNoteSlugs(): string[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs
    .readdirSync(NOTES_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => f.replace(/\.md$/, ''));
}

function toDateString(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (v instanceof Date) {
    // YAML date (e.g. 2026-04-18) は Date になる。UTC 基準で YYYY-MM-DD を返す。
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, '0');
    const d = String(v.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(v);
}

export function getNoteContent(slug: string): NoteContent | null {
  const filePath = path.join(NOTES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;
  return {
    frontmatter: {
      slug: String(d.slug ?? slug),
      title: String(d.title ?? slug),
      subtitle: d.subtitle ? String(d.subtitle) : undefined,
      one_liner: d.one_liner ? String(d.one_liner) : undefined,
      status: (d.status === 'published' ? 'published' : 'draft'),
      related_cases: Array.isArray(d.related_cases) ? d.related_cases.map(String) : undefined,
      related_themes: Array.isArray(d.related_themes) ? d.related_themes.map(String) : undefined,
      updated_at: toDateString(d.updated_at),
    },
    content,
  };
}

export function getAllNotes(): NoteContent[] {
  return getAllNoteSlugs()
    .map(slug => getNoteContent(slug))
    .filter((n): n is NoteContent => n != null);
}

export function getPublishedNotes(): NoteContent[] {
  return getAllNotes().filter(n => n.frontmatter.status === 'published');
}

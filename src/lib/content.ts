/**
 * src/lib/content.ts
 * Markdown ファイルの読み込み・frontmatter パース
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CASES_DIR = path.join(process.cwd(), 'content', 'cases');

export interface CaseFrontmatter {
  slug: string;
  title: string;
  one_liner: string;
  summary: string;
  status: string;
  themes: string[];
  tags: string[];
  period_start?: number;
  period_end?: number;
}

export interface CaseContent {
  frontmatter: CaseFrontmatter;
  content: string; // Markdown 本文（frontmatter 除去済み）
}

/** slug 一覧を返す（_template は除外） */
export function getAllCaseSlugs(): string[] {
  if (!fs.existsSync(CASES_DIR)) return [];
  return fs
    .readdirSync(CASES_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => f.replace(/\.md$/, ''));
}

/** slug に対応する Markdown ファイルを読み込む */
export function getCaseContent(slug: string): CaseContent | null {
  const filePath = path.join(CASES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return {
    frontmatter: data as CaseFrontmatter,
    content,
  };
}

/** 全事例の frontmatter だけを一覧取得（一覧ページ用） */
export function getAllCaseFrontmatters(): CaseFrontmatter[] {
  return getAllCaseSlugs()
    .map(slug => getCaseContent(slug)?.frontmatter)
    .filter((fm): fm is CaseFrontmatter => fm != null);
}

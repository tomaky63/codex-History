/**
 * Build 時に Prisma から読み出し、`public/data/` に静的 JSON を書き出す。
 *
 *  - `search-index.json` … /cases のクライアントサイド検索・テーマ絞込用。
 *  - `cases-full.json`   … /compare で使う全事例の詳細データ。
 */
import { PrismaClient } from '@prisma/client';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(process.cwd(), 'public', 'data');

async function main() {
  const prisma = new PrismaClient();

  try {
    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

    const cases = await prisma.case.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ periodStart: 'asc' }, { title: 'asc' }],
      include: {
        themes:   { include: { theme: true } },
        tags:     { include: { tag: true } },
        events:   { orderBy: [{ year: 'asc' }, { displayOrder: 'asc' }] },
        entities: { include: { entity: true }, orderBy: { role: 'asc' } },
        lessons:  { orderBy: { displayOrder: 'asc' } },
      },
    });

    const searchIndex = cases.map(c => ({
      slug:        c.slug,
      title:       c.title,
      oneLiner:    c.oneLiner,
      summary:     c.summary,
      periodStart: c.periodStart,
      periodEnd:   c.periodEnd,
      themes:      c.themes.map(ct => ({ slug: ct.theme.slug, name: ct.theme.name })),
      tags:        c.tags.map(ct => ({ slug: ct.tag.slug, name: ct.tag.name })),
      turningPoints: c.events.filter(e => e.isTurningPoint).length,
    }));

    const casesFull = cases.map(c => ({
      slug:        c.slug,
      title:       c.title,
      oneLiner:    c.oneLiner,
      summary:     c.summary,
      periodStart: c.periodStart,
      periodEnd:   c.periodEnd,
      meta:        c.meta,
      themes: c.themes.map(ct => ({
        themeId: ct.themeId,
        theme: { slug: ct.theme.slug, name: ct.theme.name },
      })),
      tags: c.tags.map(ct => ({
        tagId: ct.tagId,
        tag: { slug: ct.tag.slug, name: ct.tag.name, category: ct.tag.category },
      })),
      events: c.events.map(e => ({
        id:             e.id,
        year:           e.year,
        month:          e.month,
        day:            e.day,
        title:          e.title,
        description:    e.description,
        eventType:      e.eventType,
        isTurningPoint: e.isTurningPoint,
        displayOrder:   e.displayOrder,
      })),
      entities: c.entities.map(ce => ({
        entityId: ce.entityId,
        role:     ce.role,
        notes:    ce.notes,
        entity: { slug: ce.entity.slug, name: ce.entity.name, kind: ce.entity.kind },
      })),
      lessons: c.lessons.map(l => ({
        id:           l.id,
        statement:    l.statement,
        kind:         l.kind,
        appliesTo:    l.appliesTo,
        displayOrder: l.displayOrder,
      })),
    }));

    writeFileSync(join(OUT_DIR, 'search-index.json'), JSON.stringify(searchIndex));
    writeFileSync(join(OUT_DIR, 'cases-full.json'),   JSON.stringify(casesFull));

    console.log(`[generate-static-data] ${cases.length} 件を書き出しました → public/data/`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error('[generate-static-data] 失敗:', err);
  process.exit(1);
});

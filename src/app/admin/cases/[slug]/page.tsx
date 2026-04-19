import { prisma } from '@/lib/db';
import { getCaseContent } from '@/lib/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: `Admin — ${params.slug}` };
}

export default async function AdminCaseDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const [c, md] = await Promise.all([
    prisma.case.findUnique({
      where: { slug },
      include: {
        themes:   { include: { theme: true } },
        tags:     { include: { tag: true } },
        events:   { orderBy: [{ year: 'asc' }, { displayOrder: 'asc' }] },
        lessons:  { orderBy: { displayOrder: 'asc' }, include: { tags: { include: { tag: true } } } },
        entities: { include: { entity: true }, orderBy: { role: 'asc' } },
        sources:  { include: { source: true } },
        relationsFrom: { include: { toCase: true } },
      },
    }),
    Promise.resolve(getCaseContent(slug)),
  ]);

  if (!c) notFound();

  return (
    <div>
      {/* ヘッダ */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-[22px] font-extrabold tracking-tight text-ink-900">{c.title}</h1>
          <p className="font-mono text-[11px] text-ink-400 mt-0.5">{c.slug}</p>
        </div>
        <div className="flex gap-3 text-[12px]">
          <Link href={`/cases/${slug}`} className="text-wine hover:text-wine-dark" target="_blank">
            公開ページ →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-[13px]">
        <Field label="Status">{c.status}</Field>
        <Field label="期間">
          {c.periodStart ?? '—'}
          {c.periodEnd && c.periodEnd !== c.periodStart ? ` – ${c.periodEnd}` : ''}
        </Field>
        <Field label="One Liner" className="col-span-2">{c.oneLiner || <Empty />}</Field>
        <Field label="Summary" className="col-span-2">
          <span className="whitespace-pre-wrap">{c.summary || <Empty />}</span>
        </Field>
        <Field label="Body Path">{c.bodyPath || <Empty />}</Field>
        <Field label="Body Version">{c.bodyVersion}</Field>
        <Field label="Themes">
          {c.themes.length === 0 ? <Empty /> : c.themes.map(t => t.theme.name).join(', ')}
        </Field>
        <Field label="Tags">
          {c.tags.length === 0 ? <Empty /> : c.tags.map(t => t.tag.slug).join(', ')}
        </Field>
      </div>

      <Section title={`Events (${c.events.length})`}>
        {c.events.length === 0 ? <Empty /> : (
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-cream-500 text-ink-500">
                <th className="text-left py-1 pr-3 font-medium">年月</th>
                <th className="text-left py-1 pr-3 font-medium">タイトル</th>
                <th className="text-left py-1 pr-3 font-medium">Type</th>
                <th className="text-left py-1 font-medium">TP</th>
              </tr>
            </thead>
            <tbody>
              {c.events.map(ev => (
                <tr key={ev.id} className="border-b border-cream-400">
                  <td className="py-1.5 pr-3 font-mono text-ink-700">
                    {ev.year}{ev.month ? `.${String(ev.month).padStart(2, '0')}` : ''}
                  </td>
                  <td className="py-1.5 pr-3 font-medium text-ink-900">
                    {ev.title}
                    {ev.description && (
                      <p className="font-normal text-ink-500 mt-0.5 whitespace-pre-wrap">{ev.description}</p>
                    )}
                  </td>
                  <td className="py-1.5 pr-3 text-ink-500">{ev.eventType}</td>
                  <td className="py-1.5">
                    {ev.isTurningPoint && <span className="text-wine font-bold">★</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title={`Entities (${c.entities.length})`}>
        {c.entities.length === 0 ? <Empty /> : (
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-cream-500 text-ink-500">
                <th className="text-left py-1 pr-3 font-medium">名前</th>
                <th className="text-left py-1 pr-3 font-medium">Kind</th>
                <th className="text-left py-1 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {c.entities.map(ce => (
                <tr key={`${ce.entityId}-${ce.role}`} className="border-b border-cream-400">
                  <td className="py-1.5 pr-3 font-medium text-ink-900">{ce.entity.name}</td>
                  <td className="py-1.5 pr-3 text-ink-500">{ce.entity.kind}</td>
                  <td className="py-1.5 text-ink-700">{ce.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title={`Lessons (${c.lessons.length})`}>
        {c.lessons.length === 0 ? <Empty /> : (
          <ul className="space-y-2">
            {c.lessons.map((l, i) => (
              <li key={l.id} className="border border-cream-500 rounded-lg bg-cream-50 p-3 text-[12px]">
                <div className="flex gap-2 mb-1">
                  <span className="bg-cream-400 text-wine rounded px-1.5 py-0.5 font-mono font-bold tracking-wider uppercase text-[10px]">
                    {l.kind}
                  </span>
                  <span className="text-ink-400 font-mono">#{i + 1}</span>
                </div>
                <p className="text-ink-900 leading-[1.7]">{l.statement}</p>
                {l.appliesTo && <p className="text-ink-500 mt-1">適用: {l.appliesTo}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Sources (${c.sources.length})`}>
        {c.sources.length === 0 ? <Empty /> : (
          <ul className="space-y-1 text-[12px]">
            {c.sources.map(cs => (
              <li key={cs.sourceId} className="flex gap-2 text-ink-700">
                <span className="text-ink-400 shrink-0 font-mono">[{cs.source.kind}]</span>
                <span>
                  {cs.source.title}
                  {cs.source.author && ` / ${cs.source.author}`}
                  {cs.source.year && ` (${cs.source.year})`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Relations (${c.relationsFrom.length})`}>
        {c.relationsFrom.length === 0 ? <Empty /> : (
          <ul className="space-y-1 text-[12px]">
            {c.relationsFrom.map(r => (
              <li key={r.id} className="flex gap-2">
                <span className="bg-cream-300 text-ink-600 rounded px-1.5 py-0.5 font-mono font-semibold tracking-wider uppercase text-[10px]">
                  {r.relationType}
                </span>
                <Link href={`/admin/cases/${r.toCase.slug}`} className="text-wine hover:text-wine-dark">
                  {r.toCase.title}
                </Link>
                {r.note && <span className="text-ink-500">— {r.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Markdown 本文">
        {md ? (
          <p className="text-[12px] text-wine">
            ✓ {c.bodyPath} が存在します ({md.content.length} 文字)
          </p>
        ) : (
          <p className="text-[12px] text-red-700">
            ✗ Markdown ファイルが見つかりません ({c.bodyPath})
          </p>
        )}
      </Section>
    </div>
  );
}

// ---- 小コンポーネント ----
function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-bold text-ink-500 tracking-[0.06em] uppercase mb-1">{label}</dt>
      <dd className="text-[14px] text-ink-900">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500 mb-3 border-b border-cream-400 pb-1.5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty() {
  return <span className="text-ink-400 italic">—</span>;
}

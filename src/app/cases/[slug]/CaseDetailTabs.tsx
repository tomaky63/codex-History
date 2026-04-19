'use client';

import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

export interface TabDef {
  id:      string;
  label:   string;
  count?:  number;
  content: ReactNode;
}

export default function CaseDetailTabs({
  tabs,
}: {
  tabs: TabDef[];
}) {
  const firstId = tabs[0]?.id ?? 'overview';
  const searchParams = useSearchParams();
  const requested = searchParams?.get('tab') ?? null;
  const initial = requested && tabs.some(t => t.id === requested) ? requested : firstId;
  const [active, setActive] = useState<string>(initial);

  return (
    <div>
      <div role="tablist" className="flex gap-0.5 border-b border-cream-500 mb-6 overflow-x-auto">
        {tabs.map(t => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActive(t.id)}
              className={[
                'px-3.5 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 -mb-px border-b-2',
                isActive
                  ? 'text-wine border-wine'
                  : 'text-ink-500 border-transparent hover:text-wine',
              ].join(' ')}
            >
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className="font-mono text-[10px] text-ink-400 bg-cream-400 rounded px-[5px] py-px">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tabs.map(t => (
        <div
          key={t.id}
          role="tabpanel"
          hidden={t.id !== active}
          aria-hidden={t.id !== active}
        >
          {t.id === active && t.content}
        </div>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

const DESKTOP_NAV = [
  { path: '/',        label: 'Home'    },
  { path: '/cases',   label: '事例'    },
  { path: '/themes',  label: 'テーマ'  },
  { path: '/notes',   label: 'パターン' },
  { path: '/compare', label: '比較'    },
];

const MOBILE_NAV = [
  { path: '/',       label: 'Home'    },
  { path: '/cases',  label: '事例'    },
  { path: '/themes', label: 'テーマ'  },
  { path: '/notes',  label: 'パターン' },
];

const ADMIN_HIDDEN = process.env.NEXT_PUBLIC_HIDE_ADMIN_LINKS === '1';

export default function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const router   = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ルート遷移時にドロワーを自動で閉じる
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Esc で閉じる
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  function isActive(path: string) {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  }

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get('q') ?? '').trim();
    router.push(q ? `/cases?q=${encodeURIComponent(q)}` : '/cases');
    setDrawerOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-cream-500 bg-cream-200/90 backdrop-blur supports-[backdrop-filter]:bg-cream-200/75">
      <div className="max-w-[1280px] mx-auto h-14 px-4 md:px-8 flex items-center justify-between gap-4 md:gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span
            className="w-[26px] h-[26px] rounded-md bg-wine text-cream-50 font-serif font-black text-[14px] grid place-items-center tracking-tight"
            aria-hidden
          >
            史
          </span>
          <span className="font-serif text-[18px] font-extrabold tracking-wide text-ink-900">
            ビジネス史
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-ink-500 ml-1">v1.0</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-[13px]">
          {DESKTOP_NAV.map(n => {
            const active = isActive(n.path);
            return (
              <Link
                key={n.path}
                href={n.path}
                className={[
                  'px-3.5 py-1.5 rounded-md transition-colors',
                  active
                    ? 'bg-cream-400 text-wine font-semibold'
                    : 'text-ink-700 font-medium hover:text-wine',
                ].join(' ')}
              >
                {n.label}
              </Link>
            );
          })}
          {!ADMIN_HIDDEN && (
            <Link
              href="/admin/cases"
              className={[
                'px-3.5 py-1.5 rounded-md transition-colors',
                isActive('/admin') ? 'bg-cream-400 text-wine font-semibold' : 'text-ink-400 hover:text-wine',
              ].join(' ')}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Search */}
        <form
          onSubmit={onSearch}
          className="hidden md:flex items-center gap-1.5 border border-cream-500 bg-cream-50 rounded-md px-2.5 py-[5px] w-[220px] text-[12px] text-ink-500 focus-within:border-wine focus-within:ring-1 focus-within:ring-wine/40"
        >
          <span aria-hidden className="text-ink-500">⌕</span>
          <input
            type="search"
            name="q"
            placeholder="事例・タグを検索"
            className="flex-1 bg-transparent outline-none text-ink-900 placeholder:text-ink-500"
          />
        </form>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="メニューを開く"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(v => !v)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-cream-500 bg-cream-50 text-ink-700 hover:text-wine"
        >
          <span className="sr-only">メニュー</span>
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            {drawerOpen ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-14 bg-ink-900/30 z-10"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="md:hidden absolute left-0 right-0 top-14 z-20 bg-cream-100 border-b border-cream-500 shadow-lg">
            <div className="max-w-[1280px] mx-auto px-4 py-4 flex flex-col gap-4">
              <form onSubmit={onSearch} className="flex items-center gap-1.5 border border-cream-500 bg-cream-50 rounded-md px-3 py-2">
                <span aria-hidden className="text-ink-500">⌕</span>
                <input
                  type="search"
                  name="q"
                  placeholder="事例・タグを検索"
                  autoFocus
                  className="flex-1 bg-transparent outline-none text-[14px] text-ink-900 placeholder:text-ink-500"
                />
                <button
                  type="submit"
                  className="text-[12px] text-wine font-medium px-2 py-0.5"
                >
                  検索
                </button>
              </form>

              <nav className="flex flex-col">
                {MOBILE_NAV.map(n => {
                  const active = isActive(n.path);
                  return (
                    <Link
                      key={n.path}
                      href={n.path}
                      className={[
                        'px-3 py-2.5 text-[15px] rounded-md transition-colors',
                        active
                          ? 'bg-cream-400 text-wine font-semibold'
                          : 'text-ink-700 font-medium hover:bg-cream-50',
                      ].join(' ')}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>

              <p className="text-[11.5px] text-ink-500 px-1">
                事例比較 (<span className="font-mono">/compare</span>) は情報量の都合で PC 向けです。
              </p>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

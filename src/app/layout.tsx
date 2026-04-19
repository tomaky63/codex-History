import type { Metadata } from 'next';
import { Noto_Serif_JP } from 'next/font/google';
import SiteHeader from './SiteHeader';
import './globals.css';

const notoSerifJp = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'ビジネス史', template: '%s | ビジネス史' },
  description: 'ビジネス史・産業史・構造変化の構造化学習データベース',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSerifJp.variable}>
      <body className="min-h-screen flex flex-col bg-cream-200 text-ink-900 antialiased">
        <SiteHeader />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-cream-500 mt-16 md:mt-24 py-6 md:py-7 bg-cream-300">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between text-[11.5px] md:text-[12px] text-ink-600">
            <div>© 2026 ビジネス史 · 個人学習データベース</div>
          </div>
        </footer>
      </body>
    </html>
  );
}

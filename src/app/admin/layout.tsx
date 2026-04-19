export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1280px] mx-auto px-8 py-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cream-500">
        <span className="font-mono text-[11px] bg-wine text-cream-50 rounded px-2 py-0.5 font-bold tracking-wider uppercase">
          Admin
        </span>
        <a href="/admin/cases" className="text-[13px] text-ink-700 hover:text-wine font-medium">
          事例管理
        </a>
        <span className="text-cream-600">|</span>
        <a href="/" className="text-[12px] text-ink-400 hover:text-ink-700">
          ← 公開サイト
        </a>
      </div>
      {children}
    </div>
  );
}

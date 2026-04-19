/**
 * basePath を手動で付けたいとき（`<Link>` / `<Image>` ではなく、
 * 生の `fetch` や `<a href>` でアセットを参照する場合）に使う。
 * Next.js の `<Link>` は自動で basePath が付くので、その場合は不要。
 */
export function withBase(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  if (!path.startsWith('/')) return path;
  return base + path;
}

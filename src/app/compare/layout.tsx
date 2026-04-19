import type { Metadata } from 'next';

export const metadata: Metadata = { title: '比較' };

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}

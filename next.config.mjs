/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig = {
  // build 時は Prisma Client を nodejs 側でのみ使う。(Next 14 系は experimental 配下)
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // GitHub Pages 等の純静的ホスティング向け書き出し。
  output: 'export',
  trailingSlash: true,

  // GH Pages では画像最適化エンドポイントが無い。
  images: { unoptimized: true },

  // repo 形式で置く場合 `/codex-history` 等を注入。カスタムドメインでは空。
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;

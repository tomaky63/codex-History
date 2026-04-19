# codex-history

ビジネス史・産業史・構造変化を「思考の道具」として蓄積する個人用学習データベース。
年表や社史アーカイブではなく、各事例を**構造**として保存し、横断的に比較・検索する。

---

## セットアップ手順（初回）

```bash
# 1. 依存パッケージのインストール
cd C:\Users\tomak\Documents\codex-history
npm install

# 2. SQLite DB を作成（data/ ディレクトリが自動作成される）
npx prisma migrate dev --name init

# 3. Themes / Tags の seed + drafts/*.yaml の取り込み
npm run db:seed

# 4. 開発サーバー起動
npm run dev
# → http://localhost:3000 で確認
```

**よく使うコマンド**

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run db:seed` | seed 再実行（upsert なので重複しない） |
| `npm run db:studio` | Prisma Studio で DB 内容を GUI 確認 |
| `npm run db:reset` | DB 完全リセット → seed 再実行 |
| `npx prisma migrate dev --name <name>` | スキーマ変更後のマイグレーション |

---

## 現在の状態

**Phase 1 実装済み**。Next.js + Prisma + SQLite の縦切り end-to-end が動く状態。

- **content/cases/*.md** — 1事例1ファイルの本文(俯瞰・構造分析・転換点の意味・反対と執念・考察)
- **drafts/*.yaml** — DB 取り込み用の構造データ下書き（seed スクリプトで自動取り込み）
- **docs/editorial-guide.md** — 事例を書くときの編集ルール v0

---

## ディレクトリ構成

```
codex-history/
├── README.md                       # このファイル
├── content/
│   └── cases/
│       ├── _template.md            # 新規事例の雛形
│       ├── tdl-founding.md
│       ├── tokaido-shinkansen.md
│       ├── containerization.md
│       ├── japan-shipping-foc.md
│       ├── subsea-cable.md
│       ├── famicom-platform.md
│       └── japan-steel-postwar.md
├── drafts/                         # 構造データの pre-admin-UI 下書き
│   ├── tdl-founding.yaml
│   ├── tokaido-shinkansen.yaml
│   ├── containerization.yaml
│   ├── japan-shipping-foc.yaml
│   ├── subsea-cable.yaml
│   ├── famicom-platform.yaml
│   └── japan-steel-postwar.yaml
└── docs/
    └── editorial-guide.md          # 執筆ガイド v0
```

**将来追加予定**(Phase 1 以降):

```
├── prisma/                         # Prisma schema & migrations
├── data/                           # SQLite 本体(.gitignore)
├── src/                            # Next.js App Router
└── scripts/                        # 取り込みスクリプト
```

---

## 現在入っている7件

| slug | タイトル | 期間 | Status | 主要テーマ |
|---|---|---|---|---|
| [tdl-founding](content/cases/tdl-founding.md) | 東京ディズニーランドの成立史 | 1960-1983 | published | アセットとオペレーションの分離 |
| [tokaido-shinkansen](content/cases/tokaido-shinkansen.md) | 東海道新幹線の成立史 | 1955-1964 | published | 不可逆化装置の連鎖 |
| [containerization](content/cases/containerization.md) | コンテナ化と世界海運の構造転換 | 1956-1985 | published | 規格化とネットワーク効果 |
| [japan-shipping-foc](content/cases/japan-shipping-foc.md) | 日本海運の便宜置籍船化 | 1970-1995 | published | 制度的裁定による産業空洞化 |
| [subsea-cable](content/cases/subsea-cable.md) | 海底ケーブルの支配構造 | 1956-2020 | published | 物理インフラへの垂直統合 |
| [famicom-platform](content/cases/famicom-platform.md) | ファミコン革命とプラットフォーム支配 | 1977-1996 | published | プラットフォームの開放・閉鎖ジレンマ |
| [japan-steel-postwar](content/cases/japan-steel-postwar.md) | 戦後日本鉄鋼業の奇跡と凋落 | 1945-1990 | published | 後発優位と産業政策 |

**最初の3件を貫く共通パターン**: 「退路を断った個人の執念」が巨大変化を起動する構造。

**4件目（日本海運）で加わる対比**: 個人の執念でなく **産業全体の囚人のジレンマ** が変化を起動するパターン。

**5件目（海底ケーブル）で加わる視点**: 最大の利用者がインフラ所有者になる **垂直統合の引力**。バブル崩壊が次の覇者の礎を作る逆説。

**6件目（ファミコン）で加わる視点**: 「開放しすぎると品質崩壊、閉じすぎると離反」という **プラットフォーム支配の本質的ジレンマ**。Atariの崩壊を反面教師に設計された任天堂の独占が、同じ論理で自滅した。

**7件目（日本鉄鋼）で加わる視点**: 廃墟が **後発優位** に転換されるメカニズムと、そのメカニズムが次の後発者に移転される **構造的宿命**。勝利の方程式を書いた者が同じ方程式で敗れるパターン。

---

## status の扱い（公開フィルター）

| status | 公開サイト | Admin |
|---|---|---|
| `draft` | **非表示**（一覧・詳細・関連事例すべて） | 表示 |
| `review` | **非表示**（公開側には出ない） | 表示 |
| `published` | **表示** | 表示 |

**ルール**:
- 新規事例は `status: draft` で始め、本文・events・lessons が揃ったら `review` に上げる
- `npm run db:seed` でDBに取り込んだ後、`http://localhost:3000/admin/cases/<slug>` で確認
- 問題なければ `.md` の frontmatter を `status: published` に変更 → `npm run db:seed` を再実行 → 公開される
- Admin (`/admin/cases`) では draft/review/published すべてが表示されるため、進行中の事例はそこで確認

---

## 新規事例を追加する手順（v1 運用フロー）

### 作成するファイル（2ファイル）

| ファイル | 内容 |
|---|---|
| `content/cases/<slug>.md` | 長文本文（Markdown）。俯瞰・構造分析・転換点の意味・反対と執念・考察・私見 の5セクション |
| `drafts/<slug>.yaml` | 構造データ（events/entities/lessons/sources/relations）。DB に取り込まれる正本 |

### 手順（順番通りに実施）

**1. slugを決める**（例: `japan-shipping-foc`）
- kebab-case 英語、3〜4語以内
- 一度決めたら変更しない（URLが壊れる）

**2. `content/cases/<slug>.md` を作成**
```bash
# _template.md をコピーして始める
cp content/cases/_template.md content/cases/<slug>.md
```
- frontmatter 9項目を記入（slug/title/one_liner/summary/status/themes/tags/period_start/period_end）
- 本文5セクションを記入
- `status: draft` で始め、一通り書けたら `review` に上げる

**3. `drafts/<slug>.yaml` を作成**
- 既存の `drafts/tdl-founding.yaml` などを参考に構造を書く
- `events`: 年・タイトル・event_type・is_turning_point を最低3件
- `entities`: 主要人物・組織・制度を role 付きで
- `lessons`: kind と statement を最低1件
- `sources`: 参照文献を少なくとも1件
- `relations`: 既存事例との関係を `to_case` で記述

**4. DB にインポート**

```bash
# 初回（DBが存在しない場合）
npx prisma migrate dev --name init

# 事例追加のたびに実行（upsertなので重複しない）
npm run db:seed

# DBをリセットして全件再投入したい場合
npm run db:reset
```

**5. 確認する画面**

| URL | 何を確認するか |
|---|---|
| `http://localhost:3000/admin/cases` | 一覧に新事例が出ているか |
| `http://localhost:3000/admin/cases/<slug>` | Events/Entities/Lessons/Sources が正しく入っているか |
| `http://localhost:3000/cases/<slug>` | 公開ページで見た目・タイムライン・本文が正しいか |
| `http://localhost:3000/cases` | テーマ・タグ・期間フィルターで正しく絞れるか |

### 最低限で公開（review）にする条件

- [ ] frontmatter 9項目が埋まっている
- [ ] 本文「俯瞰」が400字以上
- [ ] events が3件以上、うち1件以上が `is_turning_point: true`
- [ ] lessons が1件以上
- [ ] sources が1件以上

### よくある間違い

- **公開一覧に出ない**: frontmatter の `status` が `published` になっているか確認 → seed 再実行で反映される
- **tagが一覧に出ない**: seed.ts の `INITIAL_TAGS` にない slug を使うと name/category なしで作成される。重要なパターンタグは `INITIAL_TAGS` に追加すること
- **relationsが表示されない**: `to_case` の slug が実際に存在する case の slug と一致しているか確認。また関連先が `published` でないと公開ページには表示されない
- **本文が表示されない**: DB の `bodyPath` フィールドが `content/cases/<slug>.md` と一致しているか確認（seed.ts が自動設定）

### 将来(Phase 2 以降)

- Admin UI から直接 DB を編集できる編集フォームを追加予定
- `drafts/*.yaml` は admin UI 完成後にアーカイブへ移動（運用判断）

---

---

## 設計方針の要点

1. **Markdown と DB の分離**: Markdown は長文本文のみ、構造データは DB が正本
2. **frontmatter は最小限**: 9項目のみ(slug / title / one_liner / summary / status / themes / tags / period_start / period_end)
3. **事実と解釈の分離**: Event.description は事実、本文「転換点の意味」「考察・私見」は解釈
4. **Lesson は事例固有の感想ではなく、横展開可能な構造的示唆**として書く
5. **出典は Source テーブルで一元管理**、同じ本を複数事例で使う時は既存を参照

詳細は [docs/editorial-guide.md](docs/editorial-guide.md) を参照。

---

## 参照ドキュメント

- **執筆ガイド**: [docs/editorial-guide.md](docs/editorial-guide.md) — 事例を書くときのルール
- **初期設計プラン**: `C:\Users\tomak\.claude\plans\sleepy-riding-beacon.md` — アーキテクチャ・スキーマ・画面設計の全体像(実装前の設計フェーズ成果物)

---

## 事例一覧のフィルター（/cases）

3種類のフィルターが使えます。組み合わせ可能。

| フィルター | 操作 | 例 |
|---|---|---|
| **テーマ** | 左サイドバーのリンクをクリック | 「規制変更が転換点になった事例」など |
| **パターンタグ** | 左サイドバー「パターン」セクションをクリック | 「制度的裁定」「退路を断つ」など |
| **期間** | From/To 年を入力して「適用」 | 1970〜1995 など |

フィルター解除は各項目の「✕ 解除」リンク、またはテーマの「すべて」をクリック。

---

## 次のステップ(v0 完了後)

- **Phase 1**: Next.js + Prisma プロジェクト初期化、schema.prisma 実装、管理画面 MVP、3件の DB 投入
- **Phase 2**: 公開側 Web、フィルタ(Theme + Tag + 期間)、モバイル対応、追加事例
- **Phase 3**: 比較ビュー、全文検索、CaseRelation 活用
- **Phase 4**: PWA 化、公開・共有

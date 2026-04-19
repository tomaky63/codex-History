/**
 * prisma/seed.ts
 * 1. Themes / Tags の初期 seed
 * 2. drafts/*.yaml を読み込んで Case / Event / Entity / Lesson / Source / Relation を投入
 *
 * 実行: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const prisma = new PrismaClient();
const DRAFTS_DIR = path.join(process.cwd(), 'drafts');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'cases');

// =====================
// 型定義（YAML の形状）
// =====================
interface YamlCase {
  slug: string;
  title: string;
  period_start?: number;
  period_end?: number;
  primary_themes?: string[];
}

interface YamlEvent {
  id: string;
  year: number;
  month?: number;
  day?: number;
  title: string;
  description?: string;
  event_type: string;
  is_turning_point: boolean;
  display_order?: number;
  entity_refs?: string[];
  source_refs?: string[];
  note?: string;
}

interface YamlEntity {
  slug: string;
  name: string;
  kind: string;
  description?: string;
  roles_in_case: string[];
}

interface YamlLesson {
  id: string;
  statement: string;
  kind: string;
  applies_to?: string;
  tag_refs?: string[];
  source_refs?: string[];
}

interface YamlSource {
  source_key: string;
  kind: string;
  title: string;
  author?: string;
  publisher?: string;
  year?: number;
  url?: string;
  isbn?: string;
  notes?: string;
}

interface YamlRelation {
  to_case: string;
  relation_type: string;
  note?: string;
}

interface YamlDraft {
  case: YamlCase;
  events: YamlEvent[];
  entities: YamlEntity[];
  lessons: YamlLesson[];
  sources: YamlSource[];
  relations: YamlRelation[];
}

// =====================
// 初期 Themes
// =====================
const INITIAL_THEMES = [
  { slug: 'asset-operation-split',   name: 'アセットとオペレーションの分離', description: 'IPや物理資産の保有と実際の運営を分離するモデル', displayOrder: 1 },
  { slug: 'infrastructure-mega-project', name: 'インフラ巨大プロジェクト', description: '公共・民間の巨大インフラ建設の成立メカニズム', displayOrder: 2 },
  { slug: 'regulatory-turning-points', name: '規制変更が転換点になった事例', description: '制度変更・法改正が産業構造を変えた事例', displayOrder: 3 },
  { slug: 'standardization-wins',    name: '規格化・標準化の勝利', description: 'インタフェース標準化がネットワーク効果を起動した事例', displayOrder: 4 },
  { slug: 'vertical-restructuring',  name: '垂直統合と分離', description: 'サプライチェーンの垂直統合・分離・再統合の構造変化', displayOrder: 5 },
  { slug: 'bubble-and-crash',        name: 'バブルと崩壊', description: 'イノベーション熱狂から過熱・崩壊に至るサイクル', displayOrder: 6 },
];

// =====================
// 初期 Tags（よく使う tag の slug → 表示名マッピング）
// =====================
const INITIAL_TAGS: { slug: string; name: string; category: string }[] = [
  { slug: 'pattern/burn-the-boats',           name: '退路を断つ',              category: 'PATTERN' },
  { slug: 'pattern/license-royalty',           name: 'ライセンス・ロイヤリティ', category: 'PATTERN' },
  { slug: 'pattern/long-term-concession',      name: '長期コンセッション',       category: 'PATTERN' },
  { slug: 'pattern/founder-driven',            name: '創業者ドリブン',           category: 'PATTERN' },
  { slug: 'pattern/last-career-bet',           name: '最終ポストの賭け',         category: 'PATTERN' },
  { slug: 'pattern/deadline-forcing-function', name: 'デッドライン不可逆化',     category: 'PATTERN' },
  { slug: 'pattern/irreversibility-commitment','name': '不可逆化コミットメント',  category: 'PATTERN' },
  { slug: 'pattern/declining-industry-reinvention', name: '斜陽産業の再発明',   category: 'PATTERN' },
  { slug: 'pattern/standardization',          name: '標準化',                   category: 'PATTERN' },
  { slug: 'pattern/network-effect',            name: 'ネットワーク効果',         category: 'PATTERN' },
  { slug: 'pattern/outsider-innovation',       name: '外部者イノベーション',     category: 'PATTERN' },
  { slug: 'pattern/labor-displacement',        name: '労働置換',                 category: 'PATTERN' },
  { slug: 'pattern/customer-interface-winner', name: '顧客接点支配',             category: 'PATTERN' },
  { slug: 'pattern/regulatory-arbitrage',     name: '制度的裁定',               category: 'PATTERN' },
  { slug: 'pattern/cost-structure-shift',     name: 'コスト構造転換',           category: 'PATTERN' },
  { slug: 'pattern/asset-light',              name: 'アセットライト',            category: 'PATTERN' },
  { slug: 'industry/theme-park',               name: 'テーマパーク',             category: 'INDUSTRY' },
  { slug: 'industry/railway',                  name: '鉄道',                     category: 'INDUSTRY' },
  { slug: 'industry/shipping',                 name: '海運',                     category: 'INDUSTRY' },
  { slug: 'industry/port-logistics',           name: '港湾・物流',               category: 'INDUSTRY' },
  { slug: 'industry/telecom',                  name: '通信・インフラ',           category: 'INDUSTRY' },
  { slug: 'industry/entertainment',            name: 'エンタメ・ゲーム',         category: 'INDUSTRY' },
  { slug: 'industry/steel',                    name: '鉄鋼・素材',               category: 'INDUSTRY' },
  { slug: 'region/japan',                      name: '日本',                     category: 'REGION' },
  { slug: 'region/global',                     name: 'グローバル',               category: 'REGION' },
  { slug: 'era/postwar-showa',                 name: '戦後昭和',                 category: 'ERA' },
  { slug: 'era/postwar',                       name: '戦後',                     category: 'ERA' },
  { slug: 'mechanism/land-reclamation',        name: '埋立・土地造成',           category: 'MECHANISM' },
  { slug: 'mechanism/world-bank-loan',         name: '世銀借款',                 category: 'MECHANISM' },
  { slug: 'mechanism/network-effect',          name: 'ネットワーク効果の起動',   category: 'MECHANISM' },
  // 比較軸タグ（変化の起動因）
  { slug: 'driver/personal-obsession',         name: '個人の執念',               category: 'PATTERN' },
  { slug: 'driver/disruptive-entry',           name: '外部者による破壊的参入',   category: 'PATTERN' },
  { slug: 'driver/cost-pressure',              name: 'コスト圧力・競争劣位',     category: 'PATTERN' },
  { slug: 'driver/technology-shift',           name: '技術シフト',               category: 'PATTERN' },
  { slug: 'driver/latecomer-advantage',        name: '後発優位',                 category: 'PATTERN' },
  { slug: 'driver/speculative-investment',     name: '投機的過剰投資',           category: 'PATTERN' },
  { slug: 'driver/political-reform',          name: '政治主導の改革',           category: 'PATTERN' },
  // 比較軸タグ（変化の射程）
  { slug: 'scope/mega-project',                name: '巨大プロジェクト',         category: 'PATTERN' },
  { slug: 'scope/industry-restructuring',      name: '産業構造転換',             category: 'PATTERN' },
  { slug: 'scope/platform-ecosystem',          name: 'プラットフォーム・エコシステム', category: 'PATTERN' },
  // 追加 industry タグ
  { slug: 'industry/hospitality',              name: 'ホテル・ホスピタリティ',   category: 'INDUSTRY' },
  { slug: 'industry/semiconductor',            name: '半導体',                   category: 'INDUSTRY' },
  { slug: 'industry/electronics',              name: '電機・家電',               category: 'INDUSTRY' },
  { slug: 'industry/retail',                   name: '小売・流通',               category: 'INDUSTRY' },
  { slug: 'industry/gaming',                   name: 'ゲーム・コンシューマ',     category: 'INDUSTRY' },
  { slug: 'industry/energy',                   name: 'エネルギー・石油',         category: 'INDUSTRY' },
  { slug: 'industry/aviation',                 name: '航空・LCC',               category: 'INDUSTRY' },
  { slug: 'industry/telecoms',                 name: '通信・電話',               category: 'INDUSTRY' },
  { slug: 'industry/finance',                  name: '金融・決済',               category: 'INDUSTRY' },
  { slug: 'industry/internet',                 name: 'インターネット・クラウド', category: 'INDUSTRY' },
  // 追加 region タグ
  { slug: 'region/middle-east',                name: '中東',                     category: 'REGION' },
  { slug: 'region/us',                         name: '米国',                     category: 'REGION' },
  { slug: 'region/taiwan',                     name: '台湾',                     category: 'REGION' },
  { slug: 'region/europe',                     name: 'ヨーロッパ',               category: 'REGION' },
  { slug: 'region/uk',                         name: 'イギリス',                 category: 'REGION' },
  // 追加 pattern タグ
  { slug: 'pattern/vertical-integration',      name: '垂直統合',                 category: 'PATTERN' },
  { slug: 'pattern/securitization',            name: '証券化・流動化',           category: 'PATTERN' },
  // 追加 industry タグ（不動産）
  { slug: 'industry/real-estate',              name: '不動産・REIT',             category: 'INDUSTRY' },
  // 追加 industry タグ（物流）
  { slug: 'industry/logistics',                name: '物流・宅配・航空貨物',      category: 'INDUSTRY' },
  // 追加 industry タグ（ソフトウェア）
  { slug: 'industry/software',                 name: 'SaaS・エンタープライズソフト', category: 'INDUSTRY' },
  // 追加 pattern タグ（サブスクリプション）
  { slug: 'pattern/subscription-model',        name: 'サブスクリプション・定額課金', category: 'PATTERN' },
  // 追加 pattern タグ（PLG / Developer-first）
  { slug: 'pattern/product-led-growth',        name: 'プロダクト主導成長（PLG）',   category: 'PATTERN' },
  // 追加 industry タグ（FinTech）
  { slug: 'industry/fintech',                  name: 'FinTech・決済インフラ',       category: 'INDUSTRY' },
  // 追加 industry タグ（バイオ・製薬）
  { slug: 'industry/biotech',                  name: 'バイオテク・生命科学',      category: 'INDUSTRY' },
  { slug: 'industry/pharma',                   name: '製薬・医薬品',             category: 'INDUSTRY' },
  // 追加 pattern タグ（大学発）
  { slug: 'pattern/academic-spinout',          name: '大学発スピンアウト',       category: 'PATTERN' },
  // 追加 era タグ
  { slug: 'era/heisei',                        name: '平成',                     category: 'ERA' },
  { slug: 'era/cold-war',                      name: '冷戦期',                   category: 'ERA' },
  // 追加 mechanism タグ
  { slug: 'mechanism/regulatory-capture',      name: '規制の虜（レギュラトリーキャプチャー）', category: 'MECHANISM' },
  { slug: 'mechanism/cartel-pricing',          name: 'カルテル価格設定',         category: 'MECHANISM' },
  // Case 29 (Intel Inside)
  { slug: 'era/1990s',                         name: '1990年代',                 category: 'ERA' },
  { slug: 'pattern/ingredient-branding',       name: 'ingredient branding',      category: 'PATTERN' },
  { slug: 'pattern/b2b2c',                     name: 'B2B2Cモデル',              category: 'PATTERN' },
  { slug: 'mechanism/co-marketing',            name: 'Co-op広告・共同マーケティング', category: 'MECHANISM' },
  // Case 30 (Coca-Cola Bottler)
  { slug: 'industry/beverage',                 name: '飲料・食品消費財',         category: 'INDUSTRY' },
  { slug: 'pattern/franchise-model',           name: 'フランチャイズモデル',     category: 'PATTERN' },
  // Case 37 (Railway Mania)
  { slug: 'era/victorian',                     name: 'ヴィクトリア朝・19世紀',     category: 'ERA' },
  { slug: 'pattern/speculative-bubble',        name: '投機バブル・群衆心理',       category: 'PATTERN' },
  // Case 36 (Uber)
  { slug: 'industry/mobility',                 name: 'モビリティ・ライドシェア',   category: 'INDUSTRY' },
  { slug: 'pattern/blitzscaling',              name: 'ブリッツスケーリング',       category: 'PATTERN' },
  { slug: 'mechanism/cold-start',              name: 'コールドスタート問題の解決', category: 'MECHANISM' },
  { slug: 'pattern/gig-economy',               name: 'ギグエコノミー・業務委託モデル', category: 'PATTERN' },
  // Case 35 (Spotify)
  { slug: 'industry/music',                    name: '音楽・ストリーミング・メディア', category: 'INDUSTRY' },
  { slug: 'mechanism/content-licensing',       name: 'コンテンツライセンス交渉', category: 'MECHANISM' },
  { slug: 'pattern/gatekeeper-bypass',         name: 'ゲートキーパー迂回戦略',   category: 'PATTERN' },
  // Case 34 (Costco Membership)
  { slug: 'pattern/membership-model',          name: '会員制モデル',             category: 'PATTERN' },
  { slug: 'mechanism/loss-leader',             name: 'ロスリーダー・利益逆転構造', category: 'MECHANISM' },
  { slug: 'pattern/volume-discount',           name: '大量仕入れ・バルク価格戦略', category: 'PATTERN' },
  // Case 33 (Adobe Creative Cloud)
  { slug: 'era/2010s',                         name: '2010年代',                 category: 'ERA' },
  { slug: 'industry/creative',                 name: 'クリエイティブ・デザイン', category: 'INDUSTRY' },
  { slug: 'mechanism/switching-cost',          name: 'スイッチングコスト・ロックイン', category: 'MECHANISM' },
  { slug: 'pattern/perpetual-to-subscription', name: '買い切りからサブスクへの転換', category: 'PATTERN' },
  // Case 32 (Microsoft OEM)
  { slug: 'era/1980s',                         name: '1980年代',                 category: 'ERA' },
  { slug: 'pattern/oem-licensing',             name: 'OEMライセンス戦略',        category: 'PATTERN' },
  { slug: 'mechanism/bundling',                name: 'バンドリング・抱き合わせ', category: 'MECHANISM' },
  // Case 31 (Apple App Store)
  { slug: 'era/2000s',                         name: '2000年代',                 category: 'ERA' },
  { slug: 'industry/mobile',                   name: 'モバイル・スマートフォン', category: 'INDUSTRY' },
  { slug: 'pattern/two-sided-market',          name: '両面市場（Two-sided market）', category: 'PATTERN' },
  { slug: 'mechanism/platform-fee',            name: 'プラットフォーム手数料', category: 'MECHANISM' },
];

// =====================
// ユーティリティ
// =====================
const VALID_EVENT_TYPES = new Set(['FOUNDING','REGULATORY_CHANGE','CRISIS','BREAKTHROUGH','MERGER','RESTRUCTURING','BANKRUPTCY','PEAK','ENTRY','EXIT','BUBBLE','CRASH','POLICY_SHIFT','TECHNOLOGY_SHIFT','LEADERSHIP_CHANGE','OTHER']);
const VALID_ENTITY_KINDS = new Set(['PERSON','COMPANY','INSTITUTION','REGULATION','TECHNOLOGY','REGION','PRODUCT']);
const VALID_SOURCE_KINDS = new Set(['BOOK','ARTICLE','PAPER','WEBSITE','INTERVIEW','STATISTICS','PRIMARY_DOC','OTHER']);
const VALID_LESSON_KINDS = new Set(['PATTERN','ANTI_PATTERN','MECHANISM','FORECAST_METHOD','HEURISTIC']);
const VALID_RELATION_TYPES = new Set(['CONTRAST','PRECEDENT','DERIVATIVE','SIMILAR_MECHANISM','SAME_INDUSTRY','SAME_PATTERN']);
const VALID_ROLES = new Set(['PROTAGONIST','ANTAGONIST','ENABLER','DISRUPTOR','REGULATOR','CUSTOMER','SUPPLIER','PARTNER','OTHER']);

function toEventType(s: string): string { return VALID_EVENT_TYPES.has(s) ? s : 'OTHER'; }
function toEntityKind(s: string): string { return VALID_ENTITY_KINDS.has(s) ? s : 'COMPANY'; }
function toSourceKind(s: string): string { return VALID_SOURCE_KINDS.has(s) ? s : 'OTHER'; }
function toLessonKind(s: string): string { return VALID_LESSON_KINDS.has(s) ? s : 'PATTERN'; }
function toRelationType(s: string): string { return VALID_RELATION_TYPES.has(s) ? s : 'SAME_PATTERN'; }
function toRole(s: string): string { return VALID_ROLES.has(s) ? s : 'OTHER'; }

// =====================
// Main
// =====================
async function main() {
  console.log('🌱 Seeding...');

  // 1. Themes
  console.log('  → Themes');
  for (const t of INITIAL_THEMES) {
    await prisma.theme.upsert({
      where: { slug: t.slug },
      update: {},
      create: { slug: t.slug, name: t.name, description: t.description, displayOrder: t.displayOrder },
    });
  }

  // 2. Tags
  console.log('  → Tags');
  for (const t of INITIAL_TAGS) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: { slug: t.slug, name: t.name, category: t.category },
    });
  }

  // 3. YAML ファイルごとに取り込む
  const yamlFiles = fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.yaml'));
  for (const file of yamlFiles) {
    const draftPath = path.join(DRAFTS_DIR, file);
    const raw = yaml.load(fs.readFileSync(draftPath, 'utf8')) as YamlDraft;
    await importDraft(raw);
  }

  console.log('✅ Seed complete');
}

async function importDraft(draft: YamlDraft) {
  const { case: c, events = [], entities = [], lessons = [], sources = [], relations = [] } = draft;
  console.log(`  → Case: ${c.slug}`);

  // Markdown の frontmatter から summary / oneLiner を取得
  const mdPath = path.join(CONTENT_DIR, `${c.slug}.md`);
  let oneLiner = '';
  let summary = '';
  let statusStr = 'DRAFT';
  let themeSlugs: string[] = c.primary_themes ?? [];
  let tagSlugs: string[] = [];

  if (fs.existsSync(mdPath)) {
    // gray-matter を直接 require する（seed は Node.js 直接実行）
    const grayMatter = await import('gray-matter');
    const parsed = grayMatter.default(fs.readFileSync(mdPath, 'utf8'));
    const fm = parsed.data;
    oneLiner = String(fm.one_liner ?? '');
    summary = String(fm.summary ?? '');
    statusStr = String(fm.status ?? 'draft').toUpperCase();
    themeSlugs = (fm.themes as string[]) ?? c.primary_themes ?? [];
    tagSlugs = (fm.tags as string[]) ?? [];
  }

  // Case upsert
  const caseRecord = await prisma.case.upsert({
    where: { slug: c.slug },
    update: { title: c.title, oneLiner, summary, periodStart: c.period_start, periodEnd: c.period_end, status: statusStr, bodyPath: `content/cases/${c.slug}.md` },
    create: { slug: c.slug, title: c.title, oneLiner, summary, periodStart: c.period_start, periodEnd: c.period_end, status: statusStr, bodyPath: `content/cases/${c.slug}.md` },
  });

  // Themes
  for (const themeSlug of themeSlugs) {
    const theme = await prisma.theme.findUnique({ where: { slug: themeSlug } });
    if (theme) {
      await prisma.caseTheme.upsert({
        where: { caseId_themeId: { caseId: caseRecord.id, themeId: theme.id } },
        update: {},
        create: { caseId: caseRecord.id, themeId: theme.id },
      });
    }
  }

  // Tags — 存在しない tag は category なしで自動作成
  for (const tagSlug of tagSlugs) {
    let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { slug: tagSlug, name: tagSlug } });
    }
    await prisma.caseTag.upsert({
      where: { caseId_tagId: { caseId: caseRecord.id, tagId: tag.id } },
      update: {},
      create: { caseId: caseRecord.id, tagId: tag.id },
    });
  }

  // Sources — source_key → DB id のマップ（後で Event / Lesson が参照する）
  const sourceKeyMap = new Map<string, number>();
  for (const s of sources) {
    // isbn が空文字や undefined の場合は unique 制約を避けるため null にする
    const isbnVal = s.isbn && s.isbn.trim() !== '' ? s.isbn.trim() : null;
    let source = isbnVal ? await prisma.source.findUnique({ where: { isbn: isbnVal } }) : null;
    if (!source) {
      source = await prisma.source.findFirst({ where: { title: s.title, kind: toSourceKind(s.kind) } });
    }
    if (!source) {
      source = await prisma.source.create({
        data: {
          kind: toSourceKind(s.kind),
          title: s.title,
          author: s.author,
          publisher: s.publisher,
          year: s.year,
          url: s.url,
          isbn: isbnVal,
          notes: s.notes,
        },
      });
    }
    sourceKeyMap.set(s.source_key, source.id);
    await prisma.caseSource.upsert({
      where: { caseId_sourceId: { caseId: caseRecord.id, sourceId: source.id } },
      update: {},
      create: { caseId: caseRecord.id, sourceId: source.id },
    });
  }

  // Entities — slug → DB id のマップ
  const entitySlugMap = new Map<string, number>();
  for (const e of entities) {
    let entity = await prisma.entity.findUnique({ where: { slug: e.slug } });
    if (!entity) {
      entity = await prisma.entity.create({
        data: { slug: e.slug, name: e.name, kind: toEntityKind(e.kind), description: e.description },
      });
    }
    entitySlugMap.set(e.slug, entity.id);
    for (const roleStr of e.roles_in_case) {
      const role = toRole(roleStr);
      await prisma.caseEntity.upsert({
        where: { caseId_entityId_role: { caseId: caseRecord.id, entityId: entity.id, role } },
        update: {},
        create: { caseId: caseRecord.id, entityId: entity.id, role },
      });
    }
  }

  // Events
  for (const ev of events) {
    // 既存の同一 caseId + title + year があれば skip
    const existing = await prisma.event.findFirst({ where: { caseId: caseRecord.id, title: ev.title, year: ev.year } });
    if (!existing) {
      await prisma.event.create({
        data: {
          caseId: caseRecord.id,
          year: ev.year,
          month: ev.month,
          day: ev.day,
          title: ev.title,
          description: ev.description,
          eventType: toEventType(ev.event_type),
          isTurningPoint: ev.is_turning_point ?? false,
          displayOrder: ev.display_order ?? 0,
        },
      });
    }
  }

  // Lessons
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    const existing = await prisma.lesson.findFirst({ where: { caseId: caseRecord.id, statement: l.statement } });
    if (!existing) {
      const lesson = await prisma.lesson.create({
        data: {
          caseId: caseRecord.id,
          statement: l.statement,
          kind: toLessonKind(l.kind),
          appliesTo: l.applies_to,
          displayOrder: i,
        },
      });
      // Lesson Tags
      for (const tagSlug of l.tag_refs ?? []) {
        let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
        if (!tag) {
          // タグが pattern/ などで始まらない場合は pattern/xxx として扱う
          const fullSlug = tagSlug.includes('/') ? tagSlug : `pattern/${tagSlug}`;
          tag = await prisma.tag.findUnique({ where: { slug: fullSlug } });
          if (!tag) {
            tag = await prisma.tag.create({ data: { slug: fullSlug, name: fullSlug } });
          }
        }
        await prisma.lessonTag.upsert({
          where: { lessonId_tagId: { lessonId: lesson.id, tagId: tag.id } },
          update: {},
          create: { lessonId: lesson.id, tagId: tag.id },
        });
      }
    }
  }

  // CaseRelations は全 Case 投入後に行う必要があるため別パスで処理
  // relations は slug 形式で保存しておく
  if (relations.length > 0) {
    relationBuffer.push({ fromSlug: c.slug, relations });
  }
}

// relations の二段階処理バッファ
const relationBuffer: { fromSlug: string; relations: YamlRelation[] }[] = [];

async function processRelations() {
  for (const { fromSlug, relations } of relationBuffer) {
    const fromCase = await prisma.case.findUnique({ where: { slug: fromSlug } });
    if (!fromCase) continue;
    for (const r of relations) {
      const toCase = await prisma.case.findUnique({ where: { slug: r.to_case } });
      if (!toCase) continue;
      const relationType = toRelationType(r.relation_type);
      await prisma.caseRelation.upsert({
        where: { fromCaseId_toCaseId_relationType: { fromCaseId: fromCase.id, toCaseId: toCase.id, relationType } },
        update: {},
        create: { fromCaseId: fromCase.id, toCaseId: toCase.id, relationType, note: r.note },
      });
    }
  }
}

main()
  .then(() => processRelations())
  .catch(console.error)
  .finally(() => prisma.$disconnect());

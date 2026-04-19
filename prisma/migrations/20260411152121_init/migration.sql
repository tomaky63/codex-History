-- CreateTable
CREATE TABLE "Case" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "oneLiner" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "bodyPath" TEXT,
    "bodyVersion" INTEGER NOT NULL DEFAULT 1,
    "periodStart" INTEGER,
    "periodEnd" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "coverEssayPath" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Theme_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Theme" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseTheme" (
    "caseId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,

    PRIMARY KEY ("caseId", "themeId"),
    CONSTRAINT "CaseTheme_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "synonymOfTagId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_synonymOfTagId_fkey" FOREIGN KEY ("synonymOfTagId") REFERENCES "Tag" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseTag" (
    "caseId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("caseId", "tagId"),
    CONSTRAINT "CaseTag_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CaseEntity" (
    "caseId" INTEGER NOT NULL,
    "entityId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "notes" TEXT,

    PRIMARY KEY ("caseId", "entityId", "role"),
    CONSTRAINT "CaseEntity_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "day" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL DEFAULT 'OTHER',
    "isTurningPoint" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventEntity" (
    "eventId" INTEGER NOT NULL,
    "entityId" INTEGER NOT NULL,
    "note" TEXT,

    PRIMARY KEY ("eventId", "entityId"),
    CONSTRAINT "EventEntity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "publisher" TEXT,
    "year" INTEGER,
    "url" TEXT,
    "isbn" TEXT,
    "notes" TEXT,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CaseSource" (
    "caseId" INTEGER NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "locator" TEXT,
    "note" TEXT,

    PRIMARY KEY ("caseId", "sourceId"),
    CONSTRAINT "CaseSource_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER NOT NULL,
    "statement" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "appliesTo" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonTag" (
    "lessonId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("lessonId", "tagId"),
    CONSTRAINT "LessonTag_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseRelation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromCaseId" INTEGER NOT NULL,
    "toCaseId" INTEGER NOT NULL,
    "relationType" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseRelation_fromCaseId_fkey" FOREIGN KEY ("fromCaseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseRelation_toCaseId_fkey" FOREIGN KEY ("toCaseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Case_slug_key" ON "Case"("slug");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_periodStart_idx" ON "Case"("periodStart");

-- CreateIndex
CREATE INDEX "Case_updatedAt_idx" ON "Case"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_slug_key" ON "Theme"("slug");

-- CreateIndex
CREATE INDEX "Theme_parentId_idx" ON "Theme"("parentId");

-- CreateIndex
CREATE INDEX "CaseTheme_themeId_idx" ON "CaseTheme"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- CreateIndex
CREATE INDEX "CaseTag_tagId_idx" ON "CaseTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_slug_key" ON "Entity"("slug");

-- CreateIndex
CREATE INDEX "Entity_kind_idx" ON "Entity"("kind");

-- CreateIndex
CREATE INDEX "CaseEntity_entityId_idx" ON "CaseEntity"("entityId");

-- CreateIndex
CREATE INDEX "Event_caseId_year_displayOrder_idx" ON "Event"("caseId", "year", "displayOrder");

-- CreateIndex
CREATE INDEX "Event_isTurningPoint_idx" ON "Event"("isTurningPoint");

-- CreateIndex
CREATE UNIQUE INDEX "Source_isbn_key" ON "Source"("isbn");

-- CreateIndex
CREATE INDEX "Source_kind_idx" ON "Source"("kind");

-- CreateIndex
CREATE INDEX "Source_title_idx" ON "Source"("title");

-- CreateIndex
CREATE INDEX "CaseSource_sourceId_idx" ON "CaseSource"("sourceId");

-- CreateIndex
CREATE INDEX "Lesson_caseId_idx" ON "Lesson"("caseId");

-- CreateIndex
CREATE INDEX "Lesson_kind_idx" ON "Lesson"("kind");

-- CreateIndex
CREATE INDEX "LessonTag_tagId_idx" ON "LessonTag"("tagId");

-- CreateIndex
CREATE INDEX "CaseRelation_toCaseId_idx" ON "CaseRelation"("toCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseRelation_fromCaseId_toCaseId_relationType_key" ON "CaseRelation"("fromCaseId", "toCaseId", "relationType");

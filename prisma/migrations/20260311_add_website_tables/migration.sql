-- Migration: Add all website tables + extend existing tables for unified schema
-- From: Internal app only (projectfutur)
-- To: Unified schema (internal app + magicpostop.com website)

-- ============================================================
-- 1. New Enums
-- ============================================================

CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED');
CREATE TYPE "ServiceTab" AS ENUM ('POST_OP', 'WELLNESS', 'GIFT_CERTIFICATE', 'COURSE', 'OTHER');
CREATE TYPE "AddonType" AS ENUM ('GLOBAL', 'SPECIFIC');
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET');
CREATE TYPE "PartnerType" AS ENUM ('ESTABLISHMENT', 'DOCTOR');
CREATE TYPE "SessionBuildStatus" AS ENUM ('NEW', 'CONTACTED', 'BOOKED', 'CANCELLED');

-- ============================================================
-- 2. Extend NotificationType enum
-- ============================================================

ALTER TYPE "NotificationType" ADD VALUE 'CONTACT_MESSAGE';
ALTER TYPE "NotificationType" ADD VALUE 'NEWSLETTER_SIGNUP';
ALTER TYPE "NotificationType" ADD VALUE 'COURSE_REGISTRATION';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_BUILD';
ALTER TYPE "NotificationType" ADD VALUE 'BLOG_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'BLOG_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'BLOG_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'SERVICE_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'SERVICE_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'SERVICE_REJECTED';

-- ============================================================
-- 3. Alter existing tables
-- ============================================================

-- notifications: add link column
ALTER TABLE "notifications" ADD COLUMN "link" TEXT;

-- pricing_plans: add promo price
ALTER TABLE "pricing_plans" ADD COLUMN "promoPrice" DECIMAL(10,2);

-- service_categories: add website fields
-- slug is added as nullable first, then backfilled, then made NOT NULL
ALTER TABLE "service_categories" ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "body" TEXT,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "hasPromo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "image" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "serviceTab" "ServiceTab" NOT NULL DEFAULT 'OTHER',
ADD COLUMN "shortDesc" TEXT,
ADD COLUMN "slug" TEXT;

-- Backfill slugs for existing service_categories using lower(replace(name, ' ', '-'))
UPDATE "service_categories"
SET "slug" = lower(regexp_replace(replace("name", ' ', '-'), '[^a-z0-9\-]', '', 'g'))
WHERE "slug" IS NULL;

-- Ensure no empty slugs (fallback to id)
UPDATE "service_categories"
SET "slug" = 'svc-' || "id"
WHERE "slug" IS NULL OR "slug" = '';

-- Now make slug NOT NULL and add unique constraint
ALTER TABLE "service_categories" ALTER COLUMN "slug" SET NOT NULL;

-- staff_members: add public profile fields
ALTER TABLE "staff_members" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publicDescription" TEXT,
ADD COLUMN "publicPhoto" TEXT,
ADD COLUMN "publicTitle" TEXT;

-- ============================================================
-- 4. Create website tables
-- ============================================================

-- Blog Posts
CREATE TABLE "blog_posts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "thumbnail" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- Contact Messages
CREATE TABLE "contact_messages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "service" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- Newsletter Subscribers
CREATE TABLE "newsletter_subscribers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- Newsletter Campaigns
CREATE TABLE "newsletter_campaigns" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentBy" INTEGER NOT NULL,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- Course Registrations
CREATE TABLE "course_registrations" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "profession" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_registrations_pkey" PRIMARY KEY ("id")
);

-- Course Campaigns
CREATE TABLE "course_campaigns" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentBy" INTEGER,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_campaigns_pkey" PRIMARY KEY ("id")
);

-- Media Files
CREATE TABLE "media_files" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "original" TEXT NOT NULL DEFAULT '',
    "size" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL DEFAULT '',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- Site Settings (key-value store)
CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- Pageviews (raw analytics)
CREATE TABLE "pageviews" (
    "id" BIGSERIAL NOT NULL,
    "visitorHash" CHAR(64) NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT '',
    "deviceType" "DeviceType" NOT NULL DEFAULT 'DESKTOP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pageviews_pkey" PRIMARY KEY ("id")
);

-- Pageview Daily (rolled-up analytics)
CREATE TABLE "pageviews_daily" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "path" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "referrer" TEXT NOT NULL DEFAULT '',
    "deviceType" "DeviceType" NOT NULL DEFAULT 'DESKTOP',
    CONSTRAINT "pageviews_daily_pkey" PRIMARY KEY ("id")
);

-- Google Reviews
CREATE TABLE "google_reviews" (
    "id" SERIAL NOT NULL,
    "googleId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorUrl" TEXT NOT NULL DEFAULT '',
    "profilePhoto" TEXT NOT NULL DEFAULT '',
    "rating" SMALLINT NOT NULL,
    "relativeTime" TEXT NOT NULL DEFAULT '',
    "reviewText" TEXT,
    "publishTime" BIGINT NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "google_reviews_pkey" PRIMARY KEY ("id")
);

-- Partners (replaces both 'partners' and 'boutiques' from MySQL)
CREATE TABLE "partners" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "features" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "mapsUrl" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "type" "PartnerType" NOT NULL DEFAULT 'ESTABLISHMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- Session Builds (service estimate submissions)
CREATE TABLE "session_builds" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL DEFAULT '',
    "serviceName" TEXT NOT NULL DEFAULT '',
    "packageLabel" TEXT NOT NULL DEFAULT '',
    "packagePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "addonsJson" JSONB,
    "addonsTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" "SessionBuildStatus" NOT NULL DEFAULT 'NEW',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_builds_pkey" PRIMARY KEY ("id")
);

-- Addons
CREATE TABLE "addons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "duration" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "addonType" "AddonType" NOT NULL DEFAULT 'GLOBAL',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "addons_pkey" PRIMARY KEY ("id")
);

-- Addon Services (junction table)
CREATE TABLE "addon_services" (
    "addonId" INTEGER NOT NULL,
    "serviceId" TEXT NOT NULL,
    CONSTRAINT "addon_services_pkey" PRIMARY KEY ("addonId","serviceId")
);

-- ============================================================
-- 5. Indexes
-- ============================================================

-- Blog Posts
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");
CREATE INDEX "blog_posts_published_createdAt_idx" ON "blog_posts"("published", "createdAt" DESC);
CREATE INDEX "blog_posts_approvalStatus_idx" ON "blog_posts"("approvalStatus");
CREATE INDEX "blog_posts_createdAt_idx" ON "blog_posts"("createdAt" DESC);

-- Contact Messages
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt" DESC);
CREATE INDEX "contact_messages_isRead_idx" ON "contact_messages"("isRead");

-- Newsletter
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers"("email");
CREATE INDEX "newsletter_campaigns_createdAt_idx" ON "newsletter_campaigns"("createdAt" DESC);

-- Course
CREATE UNIQUE INDEX "course_registrations_email_key" ON "course_registrations"("email");
CREATE INDEX "course_registrations_email_idx" ON "course_registrations"("email");
CREATE INDEX "course_registrations_createdAt_idx" ON "course_registrations"("createdAt" DESC);
CREATE INDEX "course_campaigns_createdAt_idx" ON "course_campaigns"("createdAt" DESC);

-- Media Files
CREATE UNIQUE INDEX "media_files_filename_key" ON "media_files"("filename");
CREATE INDEX "media_files_filename_idx" ON "media_files"("filename");
CREATE INDEX "media_files_mimeType_idx" ON "media_files"("mimeType");

-- Pageviews
CREATE INDEX "pageviews_createdAt_idx" ON "pageviews"("createdAt");
CREATE INDEX "pageviews_createdAt_path_idx" ON "pageviews"("createdAt", "path");
CREATE INDEX "pageviews_visitorHash_createdAt_idx" ON "pageviews"("visitorHash", "createdAt");
CREATE INDEX "pageviews_daily_date_idx" ON "pageviews_daily"("date");
CREATE UNIQUE INDEX "uq_daily" ON "pageviews_daily"("date", "path", "referrer", "deviceType");

-- Google Reviews
CREATE UNIQUE INDEX "google_reviews_googleId_key" ON "google_reviews"("googleId");
CREATE INDEX "google_reviews_isVisible_rating_publishTime_idx" ON "google_reviews"("isVisible", "rating", "publishTime");
CREATE INDEX "google_reviews_isFeatured_publishTime_idx" ON "google_reviews"("isFeatured", "publishTime");

-- Partners
CREATE INDEX "partners_type_idx" ON "partners"("type");
CREATE INDEX "partners_sortOrder_idx" ON "partners"("sortOrder");

-- Session Builds
CREATE INDEX "session_builds_createdAt_idx" ON "session_builds"("createdAt" DESC);
CREATE INDEX "session_builds_status_isRead_idx" ON "session_builds"("status", "isRead");

-- Addons
CREATE UNIQUE INDEX "addons_slug_key" ON "addons"("slug");
CREATE INDEX "addons_slug_idx" ON "addons"("slug");
CREATE INDEX "addons_sortOrder_enabled_idx" ON "addons"("sortOrder", "enabled");
CREATE INDEX "addons_approvalStatus_enabled_idx" ON "addons"("approvalStatus", "enabled");
CREATE INDEX "addons_createdById_idx" ON "addons"("createdById");
CREATE INDEX "addon_services_serviceId_idx" ON "addon_services"("serviceId");

-- Service Categories (new indexes for website fields)
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");
CREATE INDEX "service_categories_slug_idx" ON "service_categories"("slug");
CREATE INDEX "service_categories_sortOrder_idx" ON "service_categories"("sortOrder");
CREATE INDEX "service_categories_enabled_idx" ON "service_categories"("enabled");
CREATE INDEX "service_categories_serviceTab_idx" ON "service_categories"("serviceTab");
CREATE INDEX "service_categories_approvalStatus_idx" ON "service_categories"("approvalStatus");

-- Staff Members (new index for website public profiles)
CREATE INDEX "staff_members_isPublic_idx" ON "staff_members"("isPublic");

-- ============================================================
-- 6. Foreign Keys
-- ============================================================

ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "addon_services" ADD CONSTRAINT "addon_services_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "addons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "addon_services" ADD CONSTRAINT "addon_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

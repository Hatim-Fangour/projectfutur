-- ============================================================
-- Row Level Security (RLS) Policies
-- Unified schema: Website (magicpostop.com) + Internal App (projectfutur)
-- ============================================================

-- Enable RLS on all website tables
ALTER TABLE "blog_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_registrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pageviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pageviews_daily" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "google_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "partners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session_builds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addon_services" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on shared tables
ALTER TABLE "service_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pricing_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ANON (public website visitors) - READ-ONLY on public data
-- ============================================================

-- Published blog posts
CREATE POLICY "anon_read_published_blogs" ON "blog_posts"
  FOR SELECT TO anon
  USING ("published" = true AND "approvalStatus" = 'PUBLISHED');

-- Active, enabled services
CREATE POLICY "anon_read_services" ON "service_categories"
  FOR SELECT TO anon
  USING ("isActive" = true AND "enabled" = true);

CREATE POLICY "anon_read_service_items" ON "service_items"
  FOR SELECT TO anon
  USING ("isActive" = true AND "isDeleted" = false);

CREATE POLICY "anon_read_pricing" ON "pricing_plans"
  FOR SELECT TO anon
  USING ("isActive" = true AND "isDeleted" = false);

-- Visible Google reviews
CREATE POLICY "anon_read_reviews" ON "google_reviews"
  FOR SELECT TO anon
  USING ("isVisible" = true);

-- Enabled addons
CREATE POLICY "anon_read_addons" ON "addons"
  FOR SELECT TO anon
  USING ("enabled" = true AND "approvalStatus" = 'PUBLISHED');

CREATE POLICY "anon_read_addon_services" ON "addon_services"
  FOR SELECT TO anon
  USING (true);

-- Public staff profiles
CREATE POLICY "anon_read_public_staff" ON "staff_members"
  FOR SELECT TO anon
  USING ("isPublic" = true AND "isDeleted" = false);

-- Partners
CREATE POLICY "anon_read_partners" ON "partners"
  FOR SELECT TO anon
  USING (true);

-- Site settings (read-only, for theme/social links/etc)
CREATE POLICY "anon_read_settings" ON "site_settings"
  FOR SELECT TO anon
  USING (true);

-- ============================================================
-- ANON - INSERT on lead capture tables (website forms)
-- ============================================================

CREATE POLICY "anon_insert_contact" ON "contact_messages"
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_newsletter" ON "newsletter_subscribers"
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_course" ON "course_registrations"
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_session_build" ON "session_builds"
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_pageview" ON "pageviews"
  FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================================
-- AUTHENTICATED (logged-in staff/admin) - Full CRUD
-- ============================================================

-- Blog posts - authenticated users can do everything
CREATE POLICY "auth_all_blogs" ON "blog_posts"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contact messages - read/update (mark as read)
CREATE POLICY "auth_all_contacts" ON "contact_messages"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Newsletter
CREATE POLICY "auth_all_newsletter_subs" ON "newsletter_subscribers"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_newsletter_camps" ON "newsletter_campaigns"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Courses
CREATE POLICY "auth_all_course_regs" ON "course_registrations"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_course_camps" ON "course_campaigns"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Media files
CREATE POLICY "auth_all_media" ON "media_files"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site settings
CREATE POLICY "auth_all_settings" ON "site_settings"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Pageviews - read for dashboard, insert for tracking
CREATE POLICY "auth_all_pageviews" ON "pageviews"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_pageviews_daily" ON "pageviews_daily"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Google reviews
CREATE POLICY "auth_all_reviews" ON "google_reviews"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Partners
CREATE POLICY "auth_all_partners" ON "partners"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Session builds
CREATE POLICY "auth_all_session_builds" ON "session_builds"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Addons
CREATE POLICY "auth_all_addons" ON "addons"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_addon_services" ON "addon_services"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Services (shared)
CREATE POLICY "auth_all_services" ON "service_categories"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_service_items" ON "service_items"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_all_pricing" ON "pricing_plans"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff members - authenticated can read all, write handled by app-level RBAC
CREATE POLICY "auth_all_staff" ON "staff_members"
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notifications - users see only their own
CREATE POLICY "auth_own_notifications" ON "notifications"
  FOR ALL TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- ============================================================
-- SERVICE ROLE bypasses RLS automatically (used by server-side API routes)
-- No explicit policies needed.
-- ============================================================

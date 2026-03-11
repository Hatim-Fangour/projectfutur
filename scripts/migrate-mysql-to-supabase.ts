/**
 * MySQL → Supabase Migration Script
 *
 * Migrates all data from the magicpostop.com MySQL database to the
 * centralized Supabase PostgreSQL database.
 *
 * Prerequisites:
 *   1. SSH tunnel to VPS MySQL: ssh -4 -L 3309:127.0.0.1:3306 myvps -N
 *   2. Prisma client generated: npx prisma generate
 *   3. Environment variables loaded from .env / .env.local
 *
 * Usage:
 *   npx tsx scripts/migrate-mysql-to-supabase.ts
 */

import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Supabase admin client for creating auth users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// MySQL connection config (via SSH tunnel on port 3309)
const MYSQL_CONFIG = {
  host: "127.0.0.1",
  port: 3309,
  database: "mpodb",
  user: "mpo_user",
  password: "Magicsuccess2024$$$",
  connectTimeout: 10_000,
};

// Helper: parse currency string like "$1,494" to number
function parseCurrency(s: string): number {
  if (!s) return 0;
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  return parseFloat(cleaned) || 0;
}

// Helper: generate slug from name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Map MySQL approval_status to Prisma enum
function mapApprovalStatus(
  status: string | null
): "DRAFT" | "PENDING" | "APPROVED" | "PUBLISHED" {
  const map: Record<string, "DRAFT" | "PENDING" | "APPROVED" | "PUBLISHED"> = {
    draft: "DRAFT",
    pending: "PENDING",
    approved: "APPROVED",
    published: "PUBLISHED",
  };
  return map[status ?? "draft"] ?? "DRAFT";
}

// Map MySQL service_tab to Prisma enum
function mapServiceTab(
  tab: string | null
): "POST_OP" | "WELLNESS" | "GIFT_CERTIFICATE" | "COURSE" | "OTHER" {
  const map: Record<
    string,
    "POST_OP" | "WELLNESS" | "GIFT_CERTIFICATE" | "COURSE" | "OTHER"
  > = {
    post_op: "POST_OP",
    wellness: "WELLNESS",
    gift_certificate: "GIFT_CERTIFICATE",
    course: "COURSE",
    other: "OTHER",
  };
  return map[tab ?? "other"] ?? "OTHER";
}

async function main() {
  console.log("=== MySQL → Supabase Migration ===\n");

  // Connect to MySQL
  console.log("Connecting to MySQL via SSH tunnel (port 3309)...");
  const pool = mysql.createPool(MYSQL_CONFIG);
  try {
    await pool.execute("SELECT 1");
    console.log("MySQL connection OK.\n");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Failed to connect to MySQL:", msg);
    console.error(
      "Make sure SSH tunnel is running: ssh -4 -L 3309:127.0.0.1:3306 myvps -N"
    );
    process.exit(1);
  }

  // ──────────────────────────────────────────────────────────
  // 1. SITE SETTINGS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating site_settings...");
  try {
    const [rows] = await pool.execute("SELECT * FROM site_settings");
    const settings = rows as { key: string; value: string | null }[];
    let count = 0;
    for (const s of settings) {
      await prisma.siteSetting.upsert({
        where: { key: s.key },
        create: { key: s.key, value: s.value },
        update: { value: s.value },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 2. SERVICE CATEGORIES + ServiceItems + PricingPlans
  // ──────────────────────────────────────────────────────────
  console.log("Migrating service_categories (+ items + pricing)...");
  try {
    const [rows] = await pool.execute("SELECT * FROM service_categories");
    const services = rows as Record<string, unknown>[];
    let count = 0;

    for (const svc of services) {
      const slug = (svc.slug as string) || slugify(svc.name as string);
      const approvalStatus = mapApprovalStatus(
        svc.approval_status as string | null
      );
      const serviceTab = mapServiceTab(svc.service_tab as string | null);

      // Check if a category with this slug already exists in Supabase
      const existing = await prisma.serviceCategory.findUnique({
        where: { slug },
      });

      let categoryId: string;
      if (existing) {
        // Update existing with website fields
        const updated = await prisma.serviceCategory.update({
          where: { slug },
          data: {
            shortDesc: (svc.short_desc as string) || null,
            image: (svc.image as string) || null,
            icon: (svc.icon as string) || null,
            body: (svc.body as string) || null,
            hasPromo: Boolean(svc.has_promo),
            notes: (svc.notes as string) || null,
            enabled: Boolean(svc.enabled),
            serviceTab,
            approvalStatus,
          },
        });
        categoryId = updated.id;
      } else {
        // Create new
        const created = await prisma.serviceCategory.create({
          data: {
            name: svc.name as string,
            slug,
            shortDesc: (svc.short_desc as string) || null,
            image: (svc.image as string) || null,
            icon: (svc.icon as string) || null,
            body: (svc.body as string) || null,
            sortOrder: (svc.sort_order as number) || 0,
            hasPromo: Boolean(svc.has_promo),
            notes: (svc.notes as string) || null,
            enabled: Boolean(svc.enabled),
            serviceTab,
            approvalStatus,
          },
        });
        categoryId = created.id;
      }

      // Parse pricing JSON and create ServiceItems + PricingPlans
      let pricingSections: {
        title: string;
        description?: string;
        rows: { label: string; regular: string; promo?: string }[];
      }[] = [];
      try {
        const raw = svc.pricing as string;
        if (raw && raw !== "[]") {
          pricingSections = JSON.parse(raw);
        }
      } catch {
        // Invalid JSON, skip pricing
      }

      for (const section of pricingSections) {
        // Create a ServiceItem for each pricing section
        const item = await prisma.serviceItem.create({
          data: {
            categoryId,
            title: section.title,
            description: section.description || null,
            isActive: true,
          },
        });

        // Create PricingPlans for each row
        for (const row of section.rows || []) {
          const regularPrice = parseCurrency(row.regular);
          const promoPrice = row.promo ? parseCurrency(row.promo) : null;

          // Determine billing type from label
          const label = row.label.toLowerCase();
          let billingType: "SINGLE" | "PACKAGE" | "SUBSCRIPTION" = "SINGLE";
          let sessionsIncluded: number | null = null;

          const packageMatch = label.match(/package\s+of\s+(\d+)/);
          if (packageMatch) {
            billingType = "PACKAGE";
            sessionsIncluded = parseInt(packageMatch[1], 10);
          }

          await prisma.pricingPlan.create({
            data: {
              serviceItemId: item.id,
              name: row.label,
              price: regularPrice,
              promoPrice: promoPrice,
              billingType,
              sessionsIncluded,
              isActive: true,
            },
          });
        }
      }

      count++;
    }
    console.log(`  ${count} categories (with items + pricing). Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 3. BLOG POSTS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating blog_posts...");
  try {
    const [rows] = await pool.execute("SELECT * FROM blog_posts");
    const posts = rows as Record<string, unknown>[];
    let count = 0;
    for (const p of posts) {
      await prisma.blogPost.create({
        data: {
          title: p.title as string,
          slug: p.slug as string,
          author: (p.author as string) || "",
          category: (p.category as string) || "",
          tags: (p.tags as string) || "",
          thumbnail: (p.thumbnail as string) || "",
          body: (p.body as string) || "",
          published: Boolean(p.published),
          approvalStatus: mapApprovalStatus(
            p.approval_status as string | null
          ),
          createdAt: p.created_at ? new Date(p.created_at as string) : undefined,
          updatedAt: p.updated_at ? new Date(p.updated_at as string) : undefined,
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 4. CONTACT MESSAGES
  // ──────────────────────────────────────────────────────────
  console.log("Migrating contact_messages...");
  try {
    const [rows] = await pool.execute("SELECT * FROM contact_messages");
    const msgs = rows as Record<string, unknown>[];
    let count = 0;
    for (const m of msgs) {
      await prisma.contactMessage.create({
        data: {
          name: (m.name as string) || "",
          email: (m.email as string) || "",
          phone: (m.phone as string) || "",
          service: (m.service as string) || "",
          message: (m.message as string) || "",
          isRead: Boolean(m.is_read),
          createdAt: m.created_at ? new Date(m.created_at as string) : undefined,
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 5. NEWSLETTER SUBSCRIBERS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating newsletter_subscribers...");
  try {
    const [rows] = await pool.execute("SELECT * FROM newsletter_subscribers");
    const subs = rows as Record<string, unknown>[];
    let count = 0;
    for (const s of subs) {
      await prisma.newsletterSubscriber.upsert({
        where: { email: s.email as string },
        create: {
          name: s.name as string,
          email: s.email as string,
          createdAt: s.created_at ? new Date(s.created_at as string) : undefined,
        },
        update: {},
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 6. NEWSLETTER CAMPAIGNS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating newsletter_campaigns...");
  try {
    const [rows] = await pool.execute("SELECT * FROM newsletter_campaigns");
    const camps = rows as Record<string, unknown>[];
    let count = 0;
    for (const c of camps) {
      await prisma.newsletterCampaign.create({
        data: {
          subject: c.subject as string,
          body: c.body as string,
          sentBy: (c.sent_by as number) || 0,
          recipientCount: (c.recipient_count as number) || 0,
          createdAt: c.created_at ? new Date(c.created_at as string) : undefined,
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 7. COURSE REGISTRATIONS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating course_registrations...");
  try {
    const [rows] = await pool.execute("SELECT * FROM course_registrations");
    const regs = rows as Record<string, unknown>[];
    let count = 0;
    for (const r of regs) {
      await prisma.courseRegistration.upsert({
        where: { email: r.email as string },
        create: {
          fullName: (r.full_name as string) || "",
          email: r.email as string,
          phone: (r.phone as string) || "",
          profession: (r.profession as string) || "",
          createdAt: r.created_at ? new Date(r.created_at as string) : undefined,
        },
        update: {},
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 8. COURSE CAMPAIGNS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating course_campaigns...");
  try {
    const [rows] = await pool.execute("SELECT * FROM course_campaigns");
    const camps = rows as Record<string, unknown>[];
    let count = 0;
    for (const c of camps) {
      await prisma.courseCampaign.create({
        data: {
          subject: c.subject as string,
          body: c.body as string,
          sentBy: (c.sent_by as number) || null,
          recipientCount: (c.recipient_count as number) || 0,
          createdAt: c.created_at ? new Date(c.created_at as string) : undefined,
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 9. MEDIA FILES
  // ──────────────────────────────────────────────────────────
  console.log("Migrating media_files...");
  try {
    const [rows] = await pool.execute("SELECT * FROM media_files");
    const files = rows as Record<string, unknown>[];
    let count = 0;
    for (const f of files) {
      await prisma.mediaFile.upsert({
        where: { filename: f.filename as string },
        create: {
          filename: f.filename as string,
          original: (f.original as string) || "",
          size: (f.size as number) || 0,
          mimeType: (f.mime_type as string) || "",
          createdAt: f.created_at ? new Date(f.created_at as string) : undefined,
        },
        update: {},
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 10. GOOGLE REVIEWS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating google_reviews...");
  try {
    const [rows] = await pool.execute("SELECT * FROM google_reviews");
    const reviews = rows as Record<string, unknown>[];
    let count = 0;
    for (const r of reviews) {
      await prisma.googleReview.upsert({
        where: { googleId: r.google_id as string },
        create: {
          googleId: r.google_id as string,
          authorName: r.author_name as string,
          authorUrl: (r.author_url as string) || "",
          profilePhoto: (r.profile_photo as string) || "",
          rating: (r.rating as number) || 0,
          relativeTime: (r.relative_time as string) || "",
          reviewText: (r.review_text as string) || null,
          publishTime: BigInt((r.publish_time as number) || 0),
          isVisible: r.is_visible !== 0,
          isFeatured: Boolean(r.is_featured),
          syncedAt: r.synced_at ? new Date(r.synced_at as string) : undefined,
          createdAt: r.created_at ? new Date(r.created_at as string) : undefined,
        },
        update: {},
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 11. PARTNERS (from boutiques table)
  // ──────────────────────────────────────────────────────────
  console.log("Migrating partners (from boutiques)...");
  try {
    const [rows] = await pool.execute("SELECT * FROM boutiques");
    const boutiques = rows as Record<string, unknown>[];
    let count = 0;
    for (const b of boutiques) {
      await prisma.partner.create({
        data: {
          name: b.name as string,
          organization: (b.organization as string) || "",
          description: (b.description as string) || null,
          features: (b.features as string) || null,
          address: (b.address as string) || null,
          city: (b.city as string) || "",
          phone: (b.phone as string) || "",
          website: (b.website as string) || "",
          mapsUrl: (b.maps_url as string) || "",
          image: (b.image as string) || "",
          tags: (b.tags as string) || "",
          sortOrder: (b.sort_order as number) || 0,
          type:
            (b.type as string) === "doctor" ? "DOCTOR" : "ESTABLISHMENT",
          createdAt: b.created_at ? new Date(b.created_at as string) : undefined,
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // Also migrate from `partners` table (separate from boutiques)
  console.log("Migrating partners (from partners table)...");
  try {
    const [rows] = await pool.execute("SELECT * FROM partners");
    const partners = rows as Record<string, unknown>[];
    let count = 0;
    for (const p of partners) {
      await prisma.partner.create({
        data: {
          name: p.name as string,
          organization: (p.organization as string) || "",
          description: (p.description as string) || null,
          address: (p.address as string) || null,
          image: (p.image as string) || "",
          tags: (p.tags as string) || "",
          website: (p.website as string) || "",
          type: "ESTABLISHMENT",
          createdAt: p.created_at ? new Date(p.created_at as string) : undefined,
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 12. TEAM MEMBERS → StaffMembers (public profiles)
  // ──────────────────────────────────────────────────────────
  console.log("Migrating team_members → staff_members (public profiles)...");
  try {
    const [rows] = await pool.execute("SELECT * FROM team_members");
    const members = rows as Record<string, unknown>[];
    let count = 0;
    for (const m of members) {
      // Check if a staff member with this name already exists
      const existing = await prisma.staffMember.findFirst({
        where: { fullName: m.name as string },
      });
      if (existing) {
        // Update with public profile data
        await prisma.staffMember.update({
          where: { id: existing.id },
          data: {
            isPublic: true,
            publicTitle: (m.title as string) || null,
            publicDescription: (m.description as string) || null,
            publicPhoto: (m.photo as string) || null,
          },
        });
      } else {
        // Create new staff member with public profile
        await prisma.staffMember.create({
          data: {
            fullName: m.name as string,
            email: `team-${slugify(m.name as string)}@magicpostop.com`,
            isPublic: true,
            publicTitle: (m.title as string) || null,
            publicDescription: (m.description as string) || null,
            publicPhoto: (m.photo as string) || null,
            role: "THERAPIST",
            status: "ACTIVE",
          },
        });
      }
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 13. PAGEVIEWS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating pageviews...");
  try {
    const [rows] = await pool.execute("SELECT * FROM pageviews");
    const views = rows as Record<string, unknown>[];
    let count = 0;
    for (const v of views) {
      const deviceType =
        (v.device_type as string)?.toUpperCase() === "MOBILE"
          ? "MOBILE"
          : (v.device_type as string)?.toUpperCase() === "TABLET"
            ? "TABLET"
            : "DESKTOP";
      await prisma.pageview.create({
        data: {
          visitorHash: v.visitor_hash as string,
          path: v.path as string,
          referrer: (v.referrer as string) || "",
          deviceType: deviceType as "DESKTOP" | "MOBILE" | "TABLET",
          createdAt: v.created_at ? new Date(v.created_at as string) : undefined,
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 14. PAGEVIEWS DAILY
  // ──────────────────────────────────────────────────────────
  console.log("Migrating pageviews_daily...");
  try {
    const [rows] = await pool.execute("SELECT * FROM pageviews_daily");
    const daily = rows as Record<string, unknown>[];
    let count = 0;
    for (const d of daily) {
      const deviceType =
        (d.device_type as string)?.toUpperCase() === "MOBILE"
          ? "MOBILE"
          : (d.device_type as string)?.toUpperCase() === "TABLET"
            ? "TABLET"
            : "DESKTOP";
      await prisma.pageviewDaily.create({
        data: {
          date: new Date(d.date as string),
          path: d.path as string,
          views: (d.views as number) || 0,
          visitors: (d.visitors as number) || 0,
          referrer: (d.referrer as string) || "",
          deviceType: deviceType as "DESKTOP" | "MOBILE" | "TABLET",
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 15. SESSION BUILDS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating session_builds...");
  try {
    const [rows] = await pool.execute("SELECT * FROM session_builds");
    const builds = rows as Record<string, unknown>[];
    let count = 0;
    for (const b of builds) {
      const statusMap: Record<string, "NEW" | "CONTACTED" | "BOOKED" | "CANCELLED"> = {
        new: "NEW",
        contacted: "CONTACTED",
        booked: "BOOKED",
        cancelled: "CANCELLED",
      };
      await prisma.sessionBuild.create({
        data: {
          clientName: b.client_name as string,
          clientEmail: b.client_email as string,
          clientPhone: (b.client_phone as string) || "",
          serviceName: (b.service_name as string) || "",
          packageLabel: (b.package_label as string) || "",
          packagePrice: Number(b.package_price) || 0,
          quantity: (b.quantity as number) || 1,
          addonsJson: b.addons_json ? b.addons_json : undefined,
          addonsTotal: Number(b.addons_total) || 0,
          total: Number(b.total) || 0,
          notes: (b.notes as string) || null,
          status: statusMap[(b.status as string) || "new"] || "NEW",
          isRead: Boolean(b.is_read),
          createdAt: b.created_at ? new Date(b.created_at as string) : undefined,
          updatedAt: b.updated_at ? new Date(b.updated_at as string) : undefined,
        },
      });
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 16. ADDONS
  // ──────────────────────────────────────────────────────────
  console.log("Migrating addons...");
  const addonIdMap = new Map<number, number>(); // MySQL id → Supabase id
  try {
    const [rows] = await pool.execute("SELECT * FROM addons");
    const addons = rows as Record<string, unknown>[];
    let count = 0;
    for (const a of addons) {
      const created = await prisma.addon.create({
        data: {
          name: a.name as string,
          slug: a.slug as string,
          description: (a.description as string) || null,
          price: Number(a.price) || 0,
          duration: (a.duration as string) || "",
          image: (a.image as string) || "",
          icon: (a.icon as string) || "",
          addonType: (a.addon_type as string) === "specific" ? "SPECIFIC" : "GLOBAL",
          enabled: Boolean(a.enabled),
          sortOrder: (a.sort_order as number) || 0,
          approvalStatus: mapApprovalStatus(a.approval_status as string | null),
          createdAt: a.created_at ? new Date(a.created_at as string) : undefined,
          updatedAt: a.updated_at ? new Date(a.updated_at as string) : undefined,
        },
      });
      addonIdMap.set(a.id as number, created.id);
      count++;
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 17. ADDON_SERVICES (junction)
  // ──────────────────────────────────────────────────────────
  console.log("Migrating addon_services...");
  try {
    const [rows] = await pool.execute("SELECT * FROM addon_services");
    const links = rows as { addon_id: number; service_id: number }[];
    let count = 0;

    // We need to map MySQL service_id (int) to Supabase service_category id (cuid)
    // First, get the MySQL service_categories to build a slug map
    const [mysqlSvcs] = await pool.execute(
      "SELECT id, slug, name FROM service_categories"
    );
    const mysqlSvcMap = new Map<number, string>();
    for (const s of mysqlSvcs as { id: number; slug: string; name: string }[]) {
      const slug = s.slug || slugify(s.name);
      const supa = await prisma.serviceCategory.findUnique({ where: { slug } });
      if (supa) {
        mysqlSvcMap.set(s.id, supa.id);
      }
    }

    for (const link of links) {
      const newAddonId = addonIdMap.get(link.addon_id);
      const newServiceId = mysqlSvcMap.get(link.service_id);
      if (newAddonId && newServiceId) {
        try {
          await prisma.addonService.create({
            data: { addonId: newAddonId, serviceId: newServiceId },
          });
          count++;
        } catch {
          // Might already exist, skip
        }
      }
    }
    console.log(`  ${count} rows. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 18. ADMIN USERS → Supabase Auth + StaffMembers
  // ──────────────────────────────────────────────────────────
  console.log("Migrating admin_users → Supabase Auth...");
  try {
    const [rows] = await pool.execute("SELECT * FROM admin_users");
    const admins = rows as Record<string, unknown>[];
    let count = 0;
    for (const a of admins) {
      const email = a.email as string;
      const username = a.username as string;
      const role = (a.role as string) === "admin" ? "OWNER" : "STAFF";
      const firstName = (a.first_name as string) || "";
      const lastName = (a.last_name as string) || "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || username;

      // Check if user already exists in Supabase Auth
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === email);

      let authUserId: string;
      if (existingUser) {
        authUserId = existingUser.id;
        console.log(`  Auth user ${email} already exists (${authUserId})`);
      } else {
        // Create Supabase Auth user with a temporary password
        // They will need to reset their password on first login
        const { data: newUser, error } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password: `TempMigration_${Date.now()}!`,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              username,
              migrated_from: "mysql",
            },
            app_metadata: {
              role,
              app_role: "website_admin",
            },
          });
        if (error) {
          console.error(`  Failed to create auth user ${email}:`, error.message);
          continue;
        }
        authUserId = newUser.user.id;
        console.log(`  Created auth user ${email} (${authUserId})`);
      }

      // Link to StaffMember (upsert by email)
      const existingStaff = await prisma.staffMember.findUnique({
        where: { email },
      });
      if (existingStaff) {
        await prisma.staffMember.update({
          where: { email },
          data: { authUserId, role: role as "OWNER" | "STAFF" },
        });
      } else {
        await prisma.staffMember.create({
          data: {
            fullName,
            email,
            authUserId,
            role: role as "OWNER" | "STAFF",
            status: "ACTIVE",
          },
        });
      }
      count++;
    }
    console.log(`  ${count} admin users migrated. Done.\n`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // 19. NOTIFICATIONS (website → Supabase)
  // ──────────────────────────────────────────────────────────
  console.log("Migrating notifications...");
  try {
    const [rows] = await pool.execute("SELECT * FROM notifications");
    const notifs = rows as Record<string, unknown>[];
    let count = 0;
    // We skip these since the user_id references MySQL admin_users.id (int)
    // and the Supabase notifications use Supabase auth user IDs (uuid).
    // Old notifications are not worth migrating — they're transient.
    console.log(
      `  ${notifs.length} rows found but skipped (transient data, IDs incompatible).\n`
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("  Error:", msg, "\n");
  }

  // ──────────────────────────────────────────────────────────
  // DONE
  // ──────────────────────────────────────────────────────────
  console.log("=== Migration Complete ===");

  await pool.end();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

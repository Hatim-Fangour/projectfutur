/**
 * Complete remaining migration items: addons + admin_users -> Supabase Auth
 */
import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    port: 3309,
    database: "mpodb",
    user: "mpo_user",
    password: "Magicsuccess2024$$$",
  });
  await pool.execute("SELECT 1");
  console.log("MySQL OK.\n");

  // 1. Addons
  console.log("Migrating addons...");
  const [addons] = await pool.execute("SELECT * FROM addons");
  const addonRows = addons as Record<string, unknown>[];
  for (const a of addonRows) {
    try {
      await prisma.addon.upsert({
        where: { slug: a.slug as string },
        create: {
          name: a.name as string,
          slug: a.slug as string,
          description: (a.description as string) || null,
          price: Number(a.price) || 0,
          duration: (a.duration as string) || "",
          image: (a.image as string) || "",
          icon: (a.icon as string) || "",
          addonType:
            (a.addon_type as string) === "specific" ? "SPECIFIC" : "GLOBAL",
          enabled: Boolean(a.enabled),
          sortOrder: (a.sort_order as number) || 0,
          approvalStatus: ((a.approval_status as string) || "draft").toUpperCase() as
            | "DRAFT"
            | "PENDING"
            | "APPROVED"
            | "PUBLISHED",
        },
        update: {},
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log("  skip:", a.slug, msg.slice(0, 80));
    }
  }
  const addonCount = await prisma.addon.count();
  console.log(`  addons in Supabase: ${addonCount}\n`);

  // 2. Admin users -> Supabase Auth + StaffMembers
  console.log("Migrating admin_users...");
  const [admins] = await pool.execute("SELECT * FROM admin_users");
  const adminRows = admins as Record<string, unknown>[];

  for (const a of adminRows) {
    const email = a.email as string;
    const username = a.username as string;
    const role = (a.role as string) === "admin" ? "OWNER" : "STAFF";
    const firstName = (a.first_name as string) || "";
    const lastName = (a.last_name as string) || "";
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") || username;

    // Check if user already exists in Supabase Auth
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);

    let authUserId: string;
    if (existing) {
      authUserId = existing.id;
      console.log(`  Auth exists: ${email} (${authUserId})`);
    } else {
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
          app_metadata: { role, app_role: "website_admin" },
        });
      if (error) {
        console.error(`  Failed to create: ${email}: ${error.message}`);
        continue;
      }
      authUserId = newUser.user.id;
      console.log(`  Created: ${email} (${authUserId})`);
    }

    // Link to StaffMember
    const existingStaff = await prisma.staffMember.findUnique({
      where: { email },
    });
    if (existingStaff) {
      if (!existingStaff.authUserId) {
        await prisma.staffMember.update({
          where: { email },
          data: { authUserId, role: role as "OWNER" | "STAFF" },
        });
      }
    } else {
      try {
        await prisma.staffMember.create({
          data: { fullName, email, authUserId, role: role as "OWNER" | "STAFF", status: "ACTIVE" },
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log(`  Staff skip: ${email}: ${msg.slice(0, 100)}`);
      }
    }
  }

  const staffCount = await prisma.staffMember.count();
  console.log(`  staff_members in Supabase: ${staffCount}\n`);

  // 3. Pageviews daily (check if already migrated)
  const pvdCount = await prisma.pageviewDaily.count();
  if (pvdCount === 0) {
    console.log("Migrating pageviews_daily...");
    const [daily] = await pool.execute("SELECT * FROM pageviews_daily");
    const dailyRows = daily as Record<string, unknown>[];
    if (dailyRows.length > 0) {
      await prisma.pageviewDaily.createMany({
        data: dailyRows.map((d) => ({
          date: new Date(d.date as string),
          path: d.path as string,
          views: (d.views as number) || 0,
          visitors: (d.visitors as number) || 0,
          referrer: (d.referrer as string) || "",
          deviceType: (
            (d.device_type as string)?.toUpperCase() === "MOBILE"
              ? "MOBILE"
              : (d.device_type as string)?.toUpperCase() === "TABLET"
                ? "TABLET"
                : "DESKTOP"
          ) as "DESKTOP" | "MOBILE" | "TABLET",
        })),
        skipDuplicates: true,
      });
    }
    console.log(`  ${dailyRows.length} rows. Done.\n`);
  }

  await pool.end();
  await prisma.$disconnect();
  console.log("=== Remaining Migration Complete ===");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

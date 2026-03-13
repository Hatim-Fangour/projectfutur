/**
 * Data migration script: copies all rows from old Supabase DB to new one.
 * Run with: node scripts/migrate-data.mjs
 */

import { PrismaClient } from '@prisma/client'

// Old database (source)
const OLD_DIRECT_URL = 'postgresql://postgres.qekukwyglnjmkediuctk:123ewqHat99%40%40@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

// New database (target) — uses the .env DIRECT_URL
const NEW_DIRECT_URL = 'postgresql://postgres.dhuqnusamdjicjfbaxmg:123ewqHat99%40%40@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'

const oldDb = new PrismaClient({ datasources: { db: { url: OLD_DIRECT_URL } } })
const newDb = new PrismaClient({ datasources: { db: { url: NEW_DIRECT_URL } } })

// Models in dependency order (parents before children)
const MODELS = [
  'customer',
  'staffMember',
  'staffSchedule',
  'serviceCategory',
  'serviceItem',
  'pricingPlan',
  'appointment',
  'customerNote',
  'customerService',
  'progressSession',
  'transaction',
  'budget',
  'savingsGoal',
  'notification',
  'inventoryItem',
]

async function migrateModel(modelName) {
  try {
    const rows = await oldDb[modelName].findMany()
    if (rows.length === 0) {
      console.log(`  ${modelName}: 0 rows (skipped)`)
      return 0
    }

    // Use createMany with skipDuplicates to be safe
    const result = await newDb[modelName].createMany({
      data: rows,
      skipDuplicates: true,
    })

    console.log(`  ${modelName}: ${result.count} rows migrated`)
    return result.count
  } catch (err) {
    console.error(`  ${modelName}: ERROR - ${err.message}`)
    return 0
  }
}

async function main() {
  console.log('Starting data migration from old DB to new DB...\n')

  let totalRows = 0

  for (const model of MODELS) {
    totalRows += await migrateModel(model)
  }

  console.log(`\nDone! Total rows migrated: ${totalRows}`)

  await oldDb.$disconnect()
  await newDb.$disconnect()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})

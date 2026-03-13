#!/usr/bin/env node

/**
 * Deploy email templates to Supabase.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=<token> SUPABASE_PROJECT_REF=<ref> node scripts/deploy-email-templates.mjs
 *
 * Get your access token from: https://supabase.com/dashboard/account/tokens
 * Get your project ref from the URL: https://supabase.com/dashboard/project/<ref>
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const emailsDir = resolve(__dirname, '..', 'emails')

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF

if (!ACCESS_TOKEN || !PROJECT_REF) {
  console.error('Missing required environment variables:')
  console.error('  SUPABASE_ACCESS_TOKEN - from https://supabase.com/dashboard/account/tokens')
  console.error('  SUPABASE_PROJECT_REF  - from your project URL')
  process.exit(1)
}

function loadTemplate(filename) {
  return readFileSync(resolve(emailsDir, filename), 'utf-8')
}

const templates = {
  // OTP verification (used by signInWithOtp)
  mailer_templates_confirmation_content: loadTemplate('otp.html'),
  mailer_subjects_confirmation: 'Your ProjectFutur verification code',

  // Password reset
  mailer_templates_recovery_content: loadTemplate('reset-password.html'),
  mailer_subjects_recovery: 'Reset your ProjectFutur password',

  // Magic link
  mailer_templates_magic_link_content: loadTemplate('magic-link.html'),
  mailer_subjects_magic_link: 'Your ProjectFutur sign-in link',

  // Email change
  mailer_templates_email_change_content: loadTemplate('change-email.html'),
  mailer_subjects_email_change: 'Confirm your new email for ProjectFutur',

  // Invite
  mailer_templates_invite_content: loadTemplate('invite.html'),
  mailer_subjects_invite: "You're invited to ProjectFutur",
}

async function deploy() {
  console.log('Deploying email templates to Supabase...\n')

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templates),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error(`Failed (${res.status}):`, text)
    process.exit(1)
  }

  console.log('All 5 email templates deployed successfully:')
  console.log('  - OTP / Confirmation')
  console.log('  - Password Reset')
  console.log('  - Magic Link')
  console.log('  - Email Change')
  console.log('  - Invite')
}

deploy()

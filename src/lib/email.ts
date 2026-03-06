import nodemailer from 'nodemailer'

/**
 * Gmail SMTP transporter.
 * All credentials stay server-side in env vars — never exposed to the client.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // SSL on port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM_EMAIL = process.env.EMAIL_FROM || `Magic Post Op <${process.env.SMTP_USER}>`

/**
 * Sends an email via Gmail SMTP.
 * This is the single entry point for all outgoing emails — keeps SMTP credentials
 * isolated to this server-only module.
 */
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    await transporter.sendMail({ from: FROM_EMAIL, to, subject, html })
    return true
  } catch (err) {
    console.error('Email send error:', err)
    return false
  }
}

/**
 * Generates the HTML email body for an OTP.
 * Matches the luxury brand design.
 */
function buildOtpEmailHtml(otp: string, heading: string, subtitle: string, disclaimer: string): string {
  const digits = otp.split('').map(
    (d) =>
      `<td style="width:44px;height:52px;text-align:center;font-size:28px;font-weight:700;color:#C9A84C;font-family:'Courier New',Courier,monospace;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.18);border-radius:8px;">${d}</td>`
  )

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Brand -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:28px;font-weight:700;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;">
                    MAGIC POST OP
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <div style="width:40px;height:1px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));border:1px solid rgba(201,168,76,0.12);border-radius:16px;padding:48px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Icon -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="width:56px;height:56px;border-radius:50%;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);line-height:56px;text-align:center;font-size:24px;">
                      &#128274;
                    </div>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;color:#f0ece4;letter-spacing:-0.3px;">
                      ${heading}
                    </h1>
                  </td>
                </tr>

                <!-- Subtitle -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:rgba(240,236,228,0.45);line-height:1.6;">
                      ${subtitle}
                    </p>
                  </td>
                </tr>

                <!-- OTP Digits -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <table role="presentation" cellpadding="0" cellspacing="6" style="display:inline-table;">
                      <tr>
                        ${digits.join('\n                        ')}
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Expiry note -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <p style="margin:0;font-size:13px;color:rgba(240,236,228,0.35);line-height:1.5;">
                      This code expires in <strong style="color:rgba(201,168,76,0.7);">10 minutes</strong>.
                    </p>
                    <p style="margin:8px 0 0;font-size:12px;color:rgba(240,236,228,0.25);line-height:1.5;">
                      ${disclaimer}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding:32px 0 24px;">
              <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <p style="margin:0;font-size:11px;color:rgba(240,236,228,0.2);line-height:1.6;letter-spacing:0.5px;">
                &copy; Magic Post Op &middot; All rights reserved
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:rgba(240,236,228,0.15);line-height:1.6;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Sends a password reset OTP email.
 */
export async function sendPasswordResetOtpEmail(to: string, otp: string): Promise<boolean> {
  return sendEmail(
    to,
    'Your Password Reset Code - Magic Post Op',
    buildOtpEmailHtml(
      otp,
      'Password Reset Code',
      'Use this code to reset your password. Do not share it with anyone.',
      'If you didn&rsquo;t request a password reset, you can safely ignore this email.'
    )
  )
}

/**
 * Sends a registration verification OTP email.
 */
export async function sendRegistrationOtpEmail(to: string, otp: string): Promise<boolean> {
  return sendEmail(
    to,
    'Verify Your Email - Magic Post Op',
    buildOtpEmailHtml(
      otp,
      'Email Verification Code',
      'Use this code to verify your email and complete your registration.',
      'If you didn&rsquo;t create an account, you can safely ignore this email.'
    )
  )
}

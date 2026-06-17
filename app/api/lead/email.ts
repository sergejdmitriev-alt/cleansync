import { Resend } from 'resend'

const resend   = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cleansync.at'

export async function sendLeadConfirmation(name: string, email: string, lang: 'de' | 'en' = 'de') {
  const guideUrl = `${BASE_URL}/api/guide/turnover?lang=${lang}`

  const subject = lang === 'en'
    ? 'Your guide: The Perfect Guest Turnover in 7 Steps'
    : 'Ihr Leitfaden: Der perfekte Gästewechsel in 7 Schritten'

  const html = lang === 'en' ? htmlEn(name, guideUrl) : htmlDe(name, guideUrl)

  await resend.emails.send({
    from: 'CleanSync <noreply@cleansync.at>',
    to:   email,
    subject,
    html,
  })
}

// ── DE template ───────────────────────────────────────────────────
function htmlDe(name: string, guideUrl: string) {
  return `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
      <div style="margin-bottom:32px;">
        <span style="font-size:20px;font-weight:800;">✦ CleanSync</span>
      </div>
      <h1 style="font-size:24px;font-weight:800;margin:0 0 16px;">Ihr Gratis-Leitfaden ist bereit, ${name}.</h1>
      <p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 24px;">
        Inklusive druckbarer Reinigungs-Checkliste — zum Ausdrucken und direkt an Ihre Reinigungskraft weitergeben.
      </p>
      <div style="text-align:center;margin:0 0 32px;">
        <a href="${guideUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">
          ↓ Leitfaden herunterladen (PDF)
        </a>
      </div>
      <div style="background:#f4f4f2;border-radius:12px;padding:20px 24px;margin-bottom:32px;">
        <p style="font-size:13px;font-weight:600;color:#888;margin:0 0 12px;text-transform:uppercase;">Im Leitfaden</p>
        <p style="font-size:14px;color:#444;margin:0 0 8px;">⏱ Schritt 1–2: Zeitplanung &amp; Checkliste</p>
        <p style="font-size:14px;color:#444;margin:0 0 8px;">📦 Schritt 3–4: Material &amp; Kommunikation</p>
        <p style="font-size:14px;color:#444;margin:0 0 8px;">📸 Schritt 5–6: Foto-Nachweis &amp; Notfallplan</p>
        <p style="font-size:14px;color:#444;margin:0;">⚡ Schritt 7: Automatisieren statt koordinieren</p>
      </div>
      <p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 32px;">
        Wir melden uns auch persönlich innerhalb von <strong>24 Stunden</strong>, um zu zeigen, wie CleanSync Ihren Ablauf automatisiert.
      </p>
      <p style="font-size:13px;color:#999;border-top:1px solid #eee;padding-top:24px;margin:0;">
        CleanSync · Wien, Österreich
      </p>
    </div>
  `
}

// ── EN template ───────────────────────────────────────────────────
function htmlEn(name: string, guideUrl: string) {
  return `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
      <div style="margin-bottom:32px;">
        <span style="font-size:20px;font-weight:800;">✦ CleanSync</span>
      </div>
      <h1 style="font-size:24px;font-weight:800;margin:0 0 16px;">Hi ${name}, your free guide is ready.</h1>
      <p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 24px;">
        Includes a printable cleaning checklist you can hand straight to your cleaner.
      </p>
      <div style="text-align:center;margin:0 0 32px;">
        <a href="${guideUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">
          ↓ Download the guide (PDF)
        </a>
      </div>
      <div style="background:#f4f4f2;border-radius:12px;padding:20px 24px;margin-bottom:32px;">
        <p style="font-size:13px;font-weight:600;color:#888;margin:0 0 12px;text-transform:uppercase;">Inside the guide</p>
        <p style="font-size:14px;color:#444;margin:0 0 8px;">⏱ Steps 1–2: Timing &amp; checklist</p>
        <p style="font-size:14px;color:#444;margin:0 0 8px;">📦 Steps 3–4: Supplies &amp; communication</p>
        <p style="font-size:14px;color:#444;margin:0 0 8px;">📸 Steps 5–6: Photo proof &amp; backup plan</p>
        <p style="font-size:14px;color:#444;margin:0;">⚡ Step 7: Automate instead of coordinate</p>
      </div>
      <p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 32px;">
        No sales pitch — just what works. If you'd like to see how CleanSync automates this for your properties,
        just reply to this email or visit <a href="https://cleansync.at" style="color:#1d4ed8;">cleansync.at</a>.
      </p>
      <p style="font-size:13px;color:#999;border-top:1px solid #eee;padding-top:24px;margin:0;">
        CleanSync · Vienna, Austria
      </p>
    </div>
  `
}

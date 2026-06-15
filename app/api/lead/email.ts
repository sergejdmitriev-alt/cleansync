import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const GUIDE_URL = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://cleansync.at'}/api/guide/turnover`

export async function sendLeadConfirmation(name: string, email: string) {
  await resend.emails.send({
    from: 'CleanSync <noreply@cleansync.at>',
    to: email,
    subject: 'Ihr Leitfaden: Der perfekte Gästewechsel in 7 Schritten',
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 800;">✦ CleanSync</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 16px;">Ihr Gratis-Leitfaden ist bereit, ${name}.</h1>
        <p style="font-size: 15px; line-height: 1.7; color: #444; margin: 0 0 24px;">
          Inklusive druckbarer Reinigungs-Checkliste, die Sie Ihrer Reinigungskraft direkt mitgeben können.
        </p>
        <div style="text-align: center; margin: 0 0 32px;">
          <a href="${GUIDE_URL}" style="display: inline-block; background: #1d4ed8; color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
            ↓ Leitfaden herunterladen (PDF)
          </a>
        </div>
        <div style="background: #f4f4f2; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;">
          <p style="font-size: 13px; font-weight: 600; color: #888; margin: 0 0 12px; text-transform: uppercase;">Im Leitfaden</p>
          <p style="font-size: 14px; color: #444; margin: 0 0 8px;">⏱ Schritt 1–2: Zeitplanung & Checkliste</p>
          <p style="font-size: 14px; color: #444; margin: 0 0 8px;">📦 Schritt 3–4: Material & Kommunikation</p>
          <p style="font-size: 14px; color: #444; margin: 0 0 8px;">📸 Schritt 5–6: Foto-Nachweis & Notfallplan</p>
          <p style="font-size: 14px; color: #444; margin: 0;">⚡ Schritt 7: Automatisieren statt koordinieren</p>
        </div>
        <p style="font-size: 15px; line-height: 1.7; color: #444; margin: 0 0 32px;">
          Wir melden uns auch persönlich innerhalb von <strong>24 Stunden</strong>, um zu zeigen, wie CleanSync Ihren Ablauf automatisiert.
        </p>
        <p style="font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 24px; margin: 0;">
          CleanSync · Wien, Österreich
        </p>
      </div>
    `,
  });
}

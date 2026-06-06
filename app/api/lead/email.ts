import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadConfirmation(name: string, email: string) {
  await resend.emails.send({
    from: 'CleanSync <noreply@cleansync.at>',
    to: email,
    subject: 'Ihre Demo-Anfrage bei CleanSync',
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 800;">✦ CleanSync</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 16px;">Danke, ${name}!</h1>
        <p style="font-size: 15px; line-height: 1.7; color: #444; margin: 0 0 16px;">
          Wir haben Ihre Demo-Anfrage erhalten und melden uns innerhalb von <strong>24 Stunden</strong> persönlich bei Ihnen.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #444; margin: 0 0 32px;">
          CleanSync automatisiert Ihre Reinigungsabläufe — von der iCal-Synchronisation mit Airbnb bis zur Fotobestätigung durch die Reinigungskraft.
        </p>
        <div style="background: #f4f4f2; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;">
          <p style="font-size: 13px; font-weight: 600; color: #888; margin: 0 0 12px; text-transform: uppercase;">Was Sie erwartet</p>
          <p style="font-size: 14px; color: #444; margin: 0 0 8px;">🗓 iCal-Sync mit Airbnb — keine manuelle Eingabe mehr</p>
          <p style="font-size: 14px; color: #444; margin: 0 0 8px;">📸 Foto-Nachweis jeder Reinigung</p>
          <p style="font-size: 14px; color: #444; margin: 0;">💬 Telegram-Bot für Ihre Reinigungskräfte</p>
        </div>
        <p style="font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 24px; margin: 0;">
          CleanSync · Wien, Österreich
        </p>
      </div>
    `,
  });
}

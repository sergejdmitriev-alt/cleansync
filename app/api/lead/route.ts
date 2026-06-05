import { NextRequest, NextResponse } from 'next/server';
import { appendLeadToSheet, type Lead } from '@/lib/google-sheets';
import { verifyTurnstile } from '@/lib/turnstile';

export const runtime = 'nodejs';

const BIG_LEAD_VALUES = new Set(['6-10', '10+']);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, properties, message, turnstileToken } = body as Partial<Lead> & { turnstileToken?: string };

    const isHuman = await verifyTurnstile(turnstileToken ?? '');
    if (!isHuman) {
      return NextResponse.json({ error: 'Bot detected' }, { status: 403 });
    }

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !properties) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: 'Ungültige E-Mail' }, { status: 400 });
    }

    const lead: Lead = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      properties,
      message: message?.trim() || undefined,
    };

    await appendLeadToSheet(lead);
    await sendTelegramNotification(lead);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[lead] error:', err);
    console.error('[lead] full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

async function sendTelegramNotification(lead: Lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.HOST_TELEGRAM_CHAT_ID ?? '451676731';

  if (!token) return;

  const isBig = BIG_LEAD_VALUES.has(lead.properties);
  const headline = isBig ? '🔥 *Grosser Lead — CleanSync*' : '🔔 *Neuer Lead — CleanSync*';

  const timestamp = new Date().toLocaleString('de-AT', {
    timeZone: 'Europe/Vienna',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines = [
    headline, '',
    `👤 *Name:* ${lead.name}`,
    `📧 *E-Mail:* ${lead.email}`,
    `📱 *Telefon:* ${lead.phone}`,
    `🏠 *Objekte:* ${lead.properties}`,
    lead.message ? `💬 *Nachricht:* ${lead.message}` : null,
    '', `⏰ ${timestamp}`,
  ].filter(Boolean).join('\n');

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'Markdown' }),
  });
}

import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { notifyHost } from '@/lib/notifications/host'
import {
  removeKeyboard, sendMessage, sendErledigtButton,
  getResponseMessages, sendHostNotification, getPhotoMessages, sendAgencyNotification,
} from '@/lib/telegram'
import { getHostTelegramIdForUser } from '@/lib/profile'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FERTIG_BUTTON: Record<string, string> = {
  de: '✅ Reinigung abgeschlossen',
  ru: '✅ Завершить уборку',
  uk: '✅ Завершити прибирання',
  ro: '✅ Finalizează curățenia',
  pl: '✅ Zakończ sprzątanie',
}

const WELCOME: Record<string, string> = {
  ru: '👋 Привет! Ты подключён к CleanSync.\n\nЗдесь ты будешь получать задания на уборку. Жди уведомлений! 🧹',
  uk: '👋 Привіт! Ти підключений до CleanSync.\n\nТут ти будеш отримувати завдання на прибирання. Чекай сповіщень! 🧹',
  ro: '👋 Bună! Ești conectat la CleanSync.\n\nAici vei primi sarcini de curățenie. Așteaptă notificările! 🧹',
  pl: '👋 Cześć! Jesteś połączony z CleanSync.\n\nTutaj będziesz otrzymywać zlecenia sprzątania. Czekaj na powiadomienia! 🧹',
}

async function getCleanerLang(supabase: any, chatId: string) {
  const { data } = await supabase
    .from('cleaners')
    .select('language, name')
    .eq('telegram_chat_id', chatId)
    .single()
  return {
    lang: data?.language ?? 'de',
    name: data?.name ?? '',
  }
}

async function savePhoto(
  supabase: any,
  chatId: string,
  message: any,
  taskId: string,
  mode: 'completion_photos' | 'problem',
) {
  const { bot } = await import('@/lib/telegram')
  const largest  = message.photo[message.photo.length - 1]
  const file     = await bot.getFile(largest.file_id)
  const fileUrl  = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`
  const res      = await fetch(fileUrl)
  const buffer   = await res.arrayBuffer()

  const photoType   = mode === 'problem' ? 'problem' : 'completion'
  const storagePath = `${taskId}/${photoType}/${Date.now()}.jpg`

  await supabase.storage
    .from('task-photos')
    .upload(storagePath, buffer, { contentType: 'image/jpeg' })

  await supabase.from('task_photos').insert({
    task_id:      taskId,
    storage_path: storagePath,
    photo_type:   photoType,
    caption:      message.caption ?? null,
  })

  return { largest, storagePath }
}

export async function POST(req: NextRequest) {
  const supabase = createServiceSupabaseClient()

  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body    = await req.json()
  const message = body?.message

  // ── /start TOKEN — deeplink хоста для подключения Telegram ──
  if (message?.text?.startsWith('/start ')) {
    const chatId = String(message.from.id)
    const token  = message.text.split(' ')[1]?.trim()
    if (token) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('connect_token', token)
        .gt('connect_token_exp', new Date().toISOString())
        .maybeSingle()

      const { bot } = await import('@/lib/telegram')
      if (profile) {
        await supabase.from('profiles').update({
          telegram_chat_id:  Number(chatId),
          connect_token:     null,
          connect_token_exp: null,
        }).eq('id', profile.id)
        await bot.sendMessage(chatId, '✅ Telegram erfolgreich verbunden!\n\nSie erhalten ab jetzt Benachrichtigungen zu Ihren Aufträgen.')
      } else {
        await bot.sendMessage(chatId, '⚠️ Der Link ist abgelaufen oder ungültig.\n\nBitte generieren Sie einen neuen Link unter cleansync.at/connect-telegram.')
      }
    }
    return NextResponse.json({ ok: true })
  }

  // ── /start ──────────────────────────────────────────────
  if (message?.text === '/start') {
    const chatId = String(message.from.id)
    const { bot } = await import('@/lib/telegram')
    await bot.sendMessage(chatId,
      '👋 Willkommen bei CleanSync!\n\nBitte wähle deine Sprache / Выбери язык / Вибери мову / Alege limba / Wybierz język:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }, { text: '🇺🇦 Українська', callback_data: 'lang_uk' }],
            [{ text: '🇷🇴 Română',  callback_data: 'lang_ro' }, { text: '🇵🇱 Polski',     callback_data: 'lang_pl' }],
          ],
        },
      }
    )
    return NextResponse.json({ ok: true })
  }

  // ── /fertig — завершить загрузку фото ───────────────────
  if (message?.text === '/fertig') {
    const chatId = String(message.from.id)
    const { data: session } = await supabase
      .from('bot_sessions')
      .select('task_id, mode, photo_count')
      .eq('chat_id', Number(chatId))
      .single()

    if (!session) return NextResponse.json({ ok: true })

    const { lang } = await getCleanerLang(supabase, chatId)
    const pm       = getPhotoMessages(lang)

    await supabase.from('bot_sessions').delete().eq('chat_id', Number(chatId))
    await sendMessage(chatId, pm.completionDone)
    if (session.mode === 'completion_photos') {
      await notifyHost(session.task_id, 'done')
    }
    return NextResponse.json({ ok: true })
  }

  // ── Входящее фото ────────────────────────────────────────
  if (message?.photo) {
    const chatId = String(message.from.id)

    const { data: session } = await supabase
      .from('bot_sessions')
      .select('task_id, mode, photo_count')
      .eq('chat_id', Number(chatId))
      .single()

    if (!session) return NextResponse.json({ ok: true })

    const { lang, name: cleanerName } = await getCleanerLang(supabase, chatId)
    const pm = getPhotoMessages(lang)

    // Лимит 10 фото для completion
    if (session.mode === 'completion_photos' && session.photo_count >= 10) {
      await sendMessage(chatId, pm.limitReached)
      return NextResponse.json({ ok: true })
    }

    const { largest } = await savePhoto(supabase, chatId, message, session.task_id, session.mode)

    // Problem mode: уведомить хоста фото + закрыть сессию
    if (session.mode === 'problem') {
      const { data: task } = await supabase
        .from('tasks')
        .select('user_id, properties(name)')
        .eq('id', session.task_id)
        .single()
      const propertyName = (task?.properties as any)?.name ?? 'Wohnung'
      const caption      = message.caption ? `\n📝 ${message.caption}` : ''
      const { bot }      = await import('@/lib/telegram')
      const hostChatId   = task?.user_id
        ? await getHostTelegramIdForUser(task.user_id)
        : '451676731'

      await bot.sendPhoto(
        hostChatId,
        largest.file_id,
        { caption: `⚠️ Problem gemeldet — ${propertyName} (${cleanerName})${caption}` }
      )
      await sendMessage(chatId, pm.problemSaved)
      await supabase.from('bot_sessions').delete().eq('chat_id', Number(chatId))
      return NextResponse.json({ ok: true })
    }

    // Completion mode: сохранить, обновить счётчик
    const newCount = session.photo_count + 1
    await supabase
      .from('bot_sessions')
      .update({ photo_count: newCount })
      .eq('chat_id', Number(chatId))

    if (newCount >= 10) {
      await supabase.from('bot_sessions').delete().eq('chat_id', Number(chatId))
      await sendMessage(chatId, pm.completionDone)
      await notifyHost(session.task_id, 'done')
    } else {
      await sendMessage(chatId, `${pm.photoSaved} (${newCount}/10). ${pm.fertigHint}`)
    }

    return NextResponse.json({ ok: true })
  }

  // ── Callback query ───────────────────────────────────────
  const callback = body?.callback_query
  if (!callback) return NextResponse.json({ ok: true })

  const data   = callback.data as string
  const chatId = String(callback.from.id)
  const msgId  = String(callback.message?.message_id)

  // lang_*
  if (data.startsWith('lang_')) {
    const lang    = data.slice(5)
    const { bot } = await import('@/lib/telegram')

    await supabase
      .from('cleaners')
      .update({ language: lang })
      .eq('telegram_chat_id', Number(chatId))

    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: Number(msgId) }
    )
    await sendMessage(chatId, WELCOME[lang])
    return NextResponse.json({ ok: true })
  }

  // problem_*
  if (data.startsWith('problem_')) {
    const taskId   = data.slice(8)
    const { lang } = await getCleanerLang(supabase, chatId)
    const pm       = getPhotoMessages(lang)

    await supabase.from('bot_sessions').upsert({
      chat_id:     Number(chatId),
      task_id:     taskId,
      mode:        'problem',
      photo_count: 0,
    })

    await sendMessage(chatId, pm.problemPrompt)
    return NextResponse.json({ ok: true })
  }

  // ── escalate_ — хост вручную отправляет в Reinraum ──────────────────
  if (data.startsWith('escalate_')) {
    const taskId    = data.slice(9)
    const { bot: _bot } = await import('@/lib/telegram')
    try { await _bot.answerCallbackQuery(callback.id) } catch (_) {}

    const { data: updated } = await supabase
      .from('tasks')
      .update({ status: 'reinraum_pending', send_to_agency: true, escalated_at: new Date().toISOString() })
      .in('status', ['open', 'sent', 'declined'])
      .eq('id', taskId)
      .select('id')

    if (!updated || updated.length === 0) {
      return NextResponse.json({ ok: true })
    }

    const { data: task } = await supabase
      .from('tasks')
      .select('id, checkout_time, checkin_time, properties(name, address), cleaners(name, telegram_chat_id, language)')
      .eq('id', taskId)
      .single()

    if (task) {
      await sendAgencyNotification(task, undefined).catch(e =>
        console.error('[webhook] escalate sendAgencyNotification failed:', e)
      )
    }

    const propName = (task?.properties as any)?.name ?? 'Wohnung'
    await _bot.editMessageText(
      `✅ <b>An Reinraum übergeben</b>\n\n🏠 ${propName}\n\nReinraum wurde benachrichtigt und wird sich darum kümmern.`,
      { chat_id: Number(chatId), message_id: Number(msgId), parse_mode: 'HTML' }
    ).catch(() => {})

    return NextResponse.json({ ok: true })
  }

  // ── rr_confirm / rr_decline (Reinraum host confirmation) ─────────────
  if (data.startsWith('rr_confirm_') || data.startsWith('rr_decline_')) {
    const isConfirm = data.startsWith('rr_confirm_')
    const taskId    = data.slice(11) // 'rr_confirm_' и 'rr_decline_' = 11 символов
    const { bot }   = await import('@/lib/telegram')

    const { data: task } = await supabase
      .from('tasks')
      .select('properties(name)')
      .eq('id', taskId)
      .single()

    const propertyName = (task?.properties as any)?.name ?? 'Wohnung'

    if (isConfirm) {
      await supabase
        .from('tasks')
        .update({ status: 'reinraum_confirmed' })
        .eq('id', taskId)

      await notifyHost(taskId, 'reinraum_confirmed')

      await bot.editMessageText(
        `✅ <b>Reinraum-Auftrag bestätigt</b>\n\n🏠 ${propertyName}\n\n✨ Danke, dass Sie Reinraum wählen! Wir kümmern uns darum.`,
        { chat_id: Number(chatId), message_id: Number(msgId), parse_mode: 'HTML' }
      )
    } else {
      await supabase
        .from('tasks')
        .update({ status: 'reinraum_declined' })
        .eq('id', taskId)

      await bot.editMessageText(
        `❌ <b>Reinraum-Auftrag abgelehnt</b>\n\n🏠 ${propertyName}`,
        { chat_id: Number(chatId), message_id: Number(msgId), parse_mode: 'HTML' }
      )
    }

    await bot.answerCallbackQuery(callback.id)
    return NextResponse.json({ ok: true })
  }

  // fertig_{taskId} — уборщик завершил через кнопку
  if (data.startsWith('fertig_')) {
    const taskId = data.slice(7)
    const { bot } = await import('@/lib/telegram')
    await bot.answerCallbackQuery(callback.id)

    const { data: session } = await supabase
      .from('bot_sessions')
      .select('task_id, mode')
      .eq('chat_id', Number(chatId))
      .single()

    if (!session) return NextResponse.json({ ok: true })

    const { lang } = await getCleanerLang(supabase, chatId)
    const pm       = getPhotoMessages(lang)

    await supabase.from('bot_sessions').delete().eq('chat_id', Number(chatId))
    await sendMessage(chatId, pm.completionDone)
    if (session.mode === 'completion_photos') {
      await notifyHost(taskId, 'done')
    }
    return NextResponse.json({ ok: true })
  }

  // accept / decline / done
  const underscoreIndex = data.indexOf('_')
  const action          = data.slice(0, underscoreIndex)
  const taskId          = data.slice(underscoreIndex + 1)

  if (!['accept', 'decline', 'done'].includes(action) || !taskId) {
    return NextResponse.json({ ok: true })
  }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, user_id, cleaners(telegram_chat_id, language, name), properties(name)')
    .eq('id', taskId)
    .single()

  if (!task) return NextResponse.json({ ok: true })

  const lang         = (task.cleaners as any)?.language ?? 'de'
  const resp         = getResponseMessages(lang)
  const pm           = getPhotoMessages(lang)
  const { bot: _bot } = await import('@/lib/telegram')

  if (action === 'accept') {
    const { data: updated } = await supabase
      .from('tasks')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .in('status', ['open', 'sent'])
      .eq('id', taskId)
      .select('id')

    if (!updated || updated.length === 0) {
      try { await _bot.answerCallbackQuery(callback.id) } catch (_) {}
      return NextResponse.json({ ok: true })
    }

    await removeKeyboard(chatId, msgId)
    try { await _bot.answerCallbackQuery(callback.id, { text: resp.accepted }) } catch (_) {}
    await notifyHost(taskId, 'accepted')

  } else if (action === 'decline') {
    const { data: updated } = await supabase
      .from('tasks')
      .update({ status: 'declined' })
      .in('status', ['open', 'sent'])
      .eq('id', taskId)
      .select('id')

    if (!updated || updated.length === 0) {
      try { await _bot.answerCallbackQuery(callback.id) } catch (_) {}
      return NextResponse.json({ ok: true })
    }

    await removeKeyboard(chatId, msgId)
    try { await _bot.answerCallbackQuery(callback.id) } catch (_) {}
    await sendMessage(chatId, resp.declined)
    await notifyHost(taskId, 'declined')

  } else if (action === 'done') {
    const { data: updated } = await supabase
      .from('tasks')
      .update({ status: 'done', done_at: new Date().toISOString() })
      .eq('status', 'accepted')
      .eq('id', taskId)
      .select('id')

    if (!updated || updated.length === 0) {
      try { await _bot.answerCallbackQuery(callback.id) } catch (_) {}
      return NextResponse.json({ ok: true })
    }

    await removeKeyboard(chatId, msgId)
    try { await _bot.answerCallbackQuery(callback.id) } catch (_) {}
    await sendMessage(chatId, resp.done)

    await supabase.from('bot_sessions').upsert({
      chat_id:     Number(chatId),
      task_id:     taskId,
      mode:        'completion_photos',
      photo_count: 0,
    })
    await _bot.sendMessage(chatId, pm.completionPrompt, {
      reply_markup: {
        inline_keyboard: [[{
          text:          FERTIG_BUTTON[lang] ?? FERTIG_BUTTON['de'],
          callback_data: `fertig_${taskId}`,
        }]],
      },
    })
  }

  return NextResponse.json({ ok: true })
}

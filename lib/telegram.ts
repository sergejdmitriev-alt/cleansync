import TelegramBot from 'node-telegram-bot-api'

const token = process.env.TELEGRAM_BOT_TOKEN!
const bot = new TelegramBot(token)

const REINRAUM_CHAT_ID = '451676731'

export interface TaskForTelegram {
  id: string
  checkout_time: string
  checkin_time: string
  notes?: string | null
  properties: { name: string; address: string } | null
  cleaners: { name: string; telegram_chat_id: string; language?: string | null } | null
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const MESSAGES: Record<string, {
  title: string
  hello: string
  address: string
  checkout: string
  checkin: string
  notes: string
  accept: string
  decline: string
}> = {
  ru: {
    title:    '🧹 *Новое задание на уборку!*',
    hello:    'Привет,',
    address:  '📍 *Адрес:*',
    checkout: '🟥 *Выезд гостей:*',
    checkin:  '🔑 *Заезд следующих:*',
    notes:    '📝 *Заметки:*',
    accept:   '✅ Принять',
    decline:  '❌ Не могу',
  },
  uk: {
    title:    '🧹 *Нове завдання на прибирання!*',
    hello:    'Привіт,',
    address:  '📍 *Адреса:*',
    checkout: '🟥 *Виїзд гостей:*',
    checkin:  '🔑 *Заїзд наступних:*',
    notes:    '📝 *Нотатки:*',
    accept:   '✅ Прийняти',
    decline:  '❌ Не можу',
  },
  ro: {
    title:    '🧹 *Sarcină nouă de curățenie!*',
    hello:    'Salut,',
    address:  '📍 *Adresă:*',
    checkout: '🟥 *Plecare oaspeți:*',
    checkin:  '🔑 *Sosire următori:*',
    notes:    '📝 *Notițe:*',
    accept:   '✅ Accept',
    decline:  '❌ Nu pot',
  },
  pl: {
    title:    '🧹 *Nowe zlecenie sprzątania!*',
    hello:    'Cześć,',
    address:  '📍 *Adres:*',
    checkout: '🟥 *Wyjazd gości:*',
    checkin:  '🔑 *Przyjazd kolejnych:*',
    notes:    '📝 *Notatki:*',
    accept:   '✅ Przyjmuję',
    decline:  '❌ Nie mogę',
  },
  de: {
    title:    '🧹 *Neuer Reinigungsauftrag!*',
    hello:    'Hallo,',
    address:  '📍 *Adresse:*',
    checkout: '🟥 *Abreise:*',
    checkin:  '🔑 *Nächste Anreise:*',
    notes:    '📝 *Notizen:*',
    accept:   '✅ Übernehmen',
    decline:  '❌ Nicht möglich',
  },
}

const DONE_MESSAGES: Record<string, { prompt: string; button: string }> = {
  ru: { prompt: '🧹 Уборка начата. Нажми когда завершишь:', button: '✅ Готово' },
  uk: { prompt: '🧹 Прибирання розпочато. Натисни коли завершиш:', button: '✅ Готово' },
  ro: { prompt: '🧹 Curățenia a început. Apasă când termini:', button: '✅ Gata' },
  pl: { prompt: '🧹 Sprzątanie rozpoczęte. Naciśnij gdy skończysz:', button: '✅ Gotowe' },
  de: { prompt: '🧹 Reinigung gestartet. Bitte bestätige wenn fertig:', button: '✅ Erledigt' },
}

const PHOTO_MESSAGES: Record<string, {
  problemButton:    string
  problemPrompt:    string
  problemSaved:     string
  completionPrompt: string
  photoSaved:       string
  completionDone:   string
  limitReached:     string
  fertigHint:       string
}> = {
  ru: {
    problemButton:    '⚠️ Проблема',
    problemPrompt:    '📸 Отправь фото проблемы. Можешь добавить описание.',
    problemSaved:     '✅ Проблема зафиксирована. Хозяин уведомлён.',
    completionPrompt: '📸 Отправь до 10 фото убранной квартиры. Напиши /fertig когда закончишь.',
    photoSaved:       '✅ Фото сохранено',
    completionDone:   '🎉 Все фото сохранены. Спасибо!',
    limitReached:     '⚠️ Максимум 10 фото. Напиши /fertig чтобы завершить.',
    fertigHint:       'Напиши /fertig чтобы завершить.',
  },
  uk: {
    problemButton:    '⚠️ Проблема',
    problemPrompt:    '📸 Надішли фото проблеми. Можеш додати опис.',
    problemSaved:     '✅ Проблему зафіксовано. Господаря повідомлено.',
    completionPrompt: '📸 Надішли до 10 фото прибраної квартири. Напиши /fertig коли закінчиш.',
    photoSaved:       '✅ Фото збережено',
    completionDone:   '🎉 Усі фото збережено. Дякую!',
    limitReached:     '⚠️ Максимум 10 фото. Напиши /fertig щоб завершити.',
    fertigHint:       'Напиши /fertig щоб завершити.',
  },
  ro: {
    problemButton:    '⚠️ Problemă',
    problemPrompt:    '📸 Trimite o poză cu problema. Poți adăuga o descriere.',
    problemSaved:     '✅ Problema a fost înregistrată. Proprietarul a fost notificat.',
    completionPrompt: '📸 Trimite până la 10 poze. Scrie /fertig când ai terminat.',
    photoSaved:       '✅ Poză salvată',
    completionDone:   '🎉 Toate pozele au fost salvate. Mulțumesc!',
    limitReached:     '⚠️ Maximum 10 poze. Scrie /fertig pentru a termina.',
    fertigHint:       'Scrie /fertig pentru a termina.',
  },
  pl: {
    problemButton:    '⚠️ Problem',
    problemPrompt:    '📸 Wyślij zdjęcie problemu. Możesz dodać opis.',
    problemSaved:     '✅ Problem został zarejestrowany. Właściciel został powiadomiony.',
    completionPrompt: '📸 Wyślij do 10 zdjęć. Napisz /fertig gdy skończysz.',
    photoSaved:       '✅ Zdjęcie zapisane',
    completionDone:   '🎉 Wszystkie zdjęcia zapisane. Dziękuję!',
    limitReached:     '⚠️ Maksimum 10 zdjęć. Napisz /fertig aby zakończyć.',
    fertigHint:       'Napisz /fertig aby zakończyć.',
  },
  de: {
    problemButton:    '⚠️ Problem melden',
    problemPrompt:    '📸 Sende ein Foto des Problems. Du kannst eine Beschreibung hinzufügen.',
    problemSaved:     '✅ Problem wurde gespeichert. Der Auftraggeber wurde benachrichtigt.',
    completionPrompt: '📸 Sende bis zu 10 Fotos der gereinigten Wohnung. Schreibe /fertig wenn du fertig bist.',
    photoSaved:       '✅ Foto gespeichert',
    completionDone:   '🎉 Alle Fotos gespeichert. Danke!',
    limitReached:     '⚠️ Maximum 10 Fotos. Schreibe /fertig um abzuschließen.',
    fertigHint:       'Schreibe /fertig wenn du fertig bist.',
  },
}

export function getPhotoMessages(lang?: string | null) {
  return PHOTO_MESSAGES[lang ?? 'de'] ?? PHOTO_MESSAGES.de
}

const RESPONSE_MESSAGES: Record<string, { accepted: string; declined: string; done: string }> = {
  ru: {
    accepted: '✅ Задание принято! Удачи с уборкой! 🧹',
    declined: '👌 Понял. Заказчик уведомлён.',
    done:     '🎉 Отлично! Уборка завершена. Спасибо!',
  },
  uk: {
    accepted: '✅ Завдання прийнято! Успіхів з прибиранням! 🧹',
    declined: '👌 Зрозумів. Замовника повідомлено.',
    done:     '🎉 Чудово! Прибирання завершено. Дякую!',
  },
  ro: {
    accepted: '✅ Sarcină acceptată! Succes la curățenie! 🧹',
    declined: '👌 Înțeles. Clientul a fost notificat.',
    done:     '🎉 Super! Curățenia finalizată. Mulțumesc!',
  },
  pl: {
    accepted: '✅ Zlecenie przyjęte! Powodzenia ze sprzątaniem! 🧹',
    declined: '👌 Rozumiem. Zleceniodawca został powiadomiony.',
    done:     '🎉 Super! Sprzątanie zakończone. Dziękuję!',
  },
  de: {
    accepted: '✅ Auftrag angenommen! Viel Erfolg bei der Reinigung! 🧹',
    declined: '👌 Verstanden. Der Auftraggeber wurde benachrichtigt.',
    done:     '🎉 Super! Reinigung abgeschlossen. Danke!',
  },
}

export function getResponseMessages(lang?: string | null) {
  return RESPONSE_MESSAGES[lang ?? 'de'] ?? RESPONSE_MESSAGES.de
}

export const REJECT_TOO_LATE: Record<string, string> = {
  de: '⏰ Eine Absage ist jetzt nicht mehr möglich (weniger als 4 Stunden bis zur Reinigung). Bitte kontaktiere den Auftraggeber direkt.',
  ru: '⏰ Отказаться уже нельзя (до уборки менее 4 часов). Пожалуйста, свяжись напрямую с хостом.',
  uk: '⏰ Відмовитись вже не можна (до прибирання менше 4 годин). Будь ласка, зв\'яжись напряму з господарем.',
  ro: '⏰ Anularea nu mai este posibilă (mai puțin de 4 ore până la curățenie). Te rugăm să contactezi direct proprietarul.',
  pl: '⏰ Anulowanie nie jest już możliwe (mniej niż 4 godziny do sprzątania). Skontaktuj się bezpośrednio ze zleceniodawcą.',
}

export const REJECT_BUTTON: Record<string, string> = {
  de: '↩ Absagen',
  ru: '↩ Отказаться',
  uk: '↩ Відмовитись',
  ro: '↩ Anulează',
  pl: '↩ Anuluj',
}

export const REJECT_DONE: Record<string, string> = {
  de: '↩ Auftrag abgesagt. Der Auftraggeber wurde informiert.',
  ru: '↩ Заказ отменён. Хост уведомлён.',
  uk: '↩ Замовлення скасовано. Господаря повідомлено.',
  ro: '↩ Comandă anulată. Proprietarul a fost informat.',
  pl: '↩ Zlecenie anulowane. Zleceniodawca został poinformowany.',
}

export function getStartNoTokenMessage(chatId: string): string {
  return (
    `📲 Deine Telegram-ID / Твой ID / Твій ID / ID-ul tău / Twoje ID:\n\n` +
    `<b>${chatId}</b>\n\n` +
    `🇩🇪 Sende diese ID an deinen Auftraggeber, um mit der Arbeit zu beginnen.\n` +
    `🇷🇺 Отправь этот ID своему хосту или менеджеру, чтобы начать работу.\n` +
    `🇺🇦 Надішли цей ID своєму господарю або менеджеру, щоб почати роботу.\n` +
    `🇷🇴 Trimite acest ID proprietarului sau managerului tău pentru a începe.\n` +
    `🇵🇱 Wyślij ten ID swojemu zleceniodawcy lub menedżerowi, aby rozpocząć pracę.`
  )
}

const CANCEL_MESSAGES: Record<string, string> = {
  ru: '⚠️ Твоя уборка отменена — бронирование было снято хозяином. Свяжись с заказчиком для уточнений.',
  uk: '⚠️ Твоє прибирання скасовано — бронювання знято господарем. Зв\'яжись із замовником для уточнень.',
  ro: '⚠️ Curățenia ta a fost anulată — rezervarea a fost retrasă de proprietar. Contactează clientul pentru detalii.',
  pl: '⚠️ Twoje sprzątanie zostało anulowane — rezerwacja została odwołana przez właściciela. Skontaktuj się ze zleceniodawcą.',
  de: '⚠️ Dein Reinigungsauftrag wurde storniert — die Buchung wurde vom Auftraggeber zurückgezogen. Bitte wende dich an den Auftraggeber.',
}

const RESCHEDULE_MESSAGES: Record<string, string> = {
  ru: '📅 Даты твоей уборки изменились. Уточни новое время у хозяина.',
  uk: '📅 Дати твого прибирання змінились. Уточни новий час у господаря.',
  ro: '📅 Datele curățeniei tale s-au schimbat. Verifică noul program cu proprietarul.',
  pl: '📅 Terminy twojego sprzątania zostały zmienione. Sprawdź nowy termin u zleceniodawcy.',
  de: '📅 Der Termin deines Reinigungsauftrags hat sich geändert. Bitte prüfe die neuen Zeiten beim Auftraggeber.',
}

export function getCancelMessage(lang?: string | null): string {
  return CANCEL_MESSAGES[lang ?? 'de'] ?? CANCEL_MESSAGES.de
}

export function getRescheduleMessage(lang?: string | null): string {
  return RESCHEDULE_MESSAGES[lang ?? 'de'] ?? RESCHEDULE_MESSAGES.de
}

export async function sendTaskNotification(task: TaskForTelegram): Promise<string> {
  const chatId = task.cleaners?.telegram_chat_id
  if (!chatId) throw new Error('Kein Telegram Chat ID für diese Reinigungskraft')

  const lang = task.cleaners?.language ?? 'de'
  const m = MESSAGES[lang] ?? MESSAGES.de

  const name     = task.cleaners?.name ?? 'Team'
  const address  = task.properties?.address ?? '—'
  const checkout = formatDate(task.checkout_time)
  const checkin  = formatDate(task.checkin_time)

  const text = [
    m.title,
    ``,
    `${m.hello} ${name}!`,
    ``,
    `${m.address} ${address}`,
    `${m.checkout} ${checkout}`,
    `${m.checkin} ${checkin}`,
    task.notes ? `${m.notes} ${task.notes}` : null,
  ].filter(Boolean).join('\n')

  const message = await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: m.accept,  callback_data: `accept_${task.id}` },
        { text: m.decline, callback_data: `decline_${task.id}` },
      ]],
    },
  })
  return String(message.message_id)
}

export async function sendErledigtButton(chatId: string, taskId: string, lang?: string | null): Promise<void> {
  const d      = DONE_MESSAGES[lang ?? 'de']  ?? DONE_MESSAGES.de
  const pm     = PHOTO_MESSAGES[lang ?? 'de'] ?? PHOTO_MESSAGES.de
  const reject = REJECT_BUTTON[lang ?? 'de']  ?? REJECT_BUTTON.de
  await bot.sendMessage(chatId, d.prompt, {
    reply_markup: {
      inline_keyboard: [
        [{ text: d.button,         callback_data: `done_${taskId}` }],
        [{ text: pm.problemButton, callback_data: `problem_${taskId}` }],
        [{ text: reject,           callback_data: `reject_${taskId}` }],
      ],
    },
  })
}

export async function removeKeyboard(chatId: string, messageId: string): Promise<void> {
  try {
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: Number(messageId) }
    )
  } catch {}
}

export async function sendMessage(chatId: string, text: string): Promise<void> {
  await bot.sendMessage(chatId, text)
}

export async function sendHostNotification(text: string, hostChatId = '451676731'): Promise<void> {
  await bot.sendMessage(hostChatId, text)
}

export async function sendAgencyNotification(task: any, hostChatId?: string): Promise<number | null> {
  const propertyName = task.properties?.name ?? 'Wohnung'
  const checkout = task.checkout_time
    ? new Date(task.checkout_time).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })
    : '—'
  const checkin = task.checkin_time
    ? new Date(task.checkin_time).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })
    : '—'
  const notes = task.notes ? `\n📝 ${task.notes}` : ''

  const reinraumText =
    `🏢 <b>Neue Reinraum-Anfrage</b>\n\n` +
    `🏠 Objekt: <b>${propertyName}</b>\n` +
    `🚪 Abreise: ${checkout}\n` +
    `🔑 Anreise: ${checkin}` +
    `${notes}\n\n` +
    `Bitte bestätigen oder ablehnen:`

  try {
    // Сообщение хосту — без кнопок, только информация
    if (hostChatId && hostChatId !== REINRAUM_CHAT_ID) {
      await bot.sendMessage(hostChatId,
        `📋 Auftrag wurde an Reinraum weitergeleitet\n\n🏠 ${propertyName}\n🚪 Abreise: ${checkout}\n🔑 Anreise: ${checkin}`,
        { parse_mode: 'HTML' }
      )
    }

    // Сообщение владельцу Reinraum — с кнопками
    const res = await bot.sendMessage(REINRAUM_CHAT_ID, reinraumText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Bestätigen', callback_data: `rr_confirm_${task.id}` },
          { text: '❌ Ablehnen',   callback_data: `rr_decline_${task.id}` },
        ]],
      },
    })
    return res.message_id
  } catch (e) {
    console.error('sendAgencyNotification error:', e)
    return null
  }
}

export { bot }

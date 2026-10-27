/* Telegram alert for new quote requests. Plain text, never throws. */
export async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        // Telegram caps a message at 4096 characters
        text: text.length > 4000 ? text.slice(0, 3990) + '…' : text,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Optional Telegram notifications. Telegram bots can only message users who started the bot,
 * so customer messages need their chat id; by default we notify the admin chat about new orders.
 */
export async function sendTelegram(chatId: string | undefined, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function notifyAdmin(text: string) {
  return sendTelegram(process.env.TELEGRAM_ADMIN_CHAT_ID, text);
}

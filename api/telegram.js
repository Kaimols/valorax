export async function POST(req) {
  try {
    const { name, message } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return Response.json({ error: "Message required" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return Response.json({ error: "Server not configured" }, { status: 500 });
    }

    const safeName = (name ?? "Web").toString().slice(0, 80);
    const safeMessage = message.toString().slice(0, 3500);

    const text = safeMessage;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const data = await tgRes.json().catch(() => null);

    if (!tgRes.ok || !data?.ok) {
      return Response.json(
        { error: "Telegram error", details: data ?? "Bad response" },
        { status: 502 }
      );
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
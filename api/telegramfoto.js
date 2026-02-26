export async function POST(req) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return Response.json({ error: "Server not configured" }, { status: 500 });
    }

    // FormData vom Browser lesen
    const form = await req.formData();
    const photo = form.get("photo"); // muss exakt "photo" heißen
    const name = (form.get("name") ?? "Web").toString().slice(0, 80);
    const message = (form.get("message") ?? "").toString().slice(0, 1000);

    if (!photo || typeof photo === "string") {
      return Response.json({ error: "Photo required" }, { status: 400 });
    }

    // IP + User-Agent optional dazu
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "Unbekannt";
    const userAgent = req.headers.get("user-agent") || "Unbekannt";

    const caption =
      `👤 Name: ${name}\n` +
      `🌍 IP: ${ip}\n` +
      `🖥️ UA: ${userAgent}\n` +
      (message ? `\n💬 ${message}` : "");

    // Telegram erwartet multipart/form-data -> wir bauen FormData neu
    const tgForm = new FormData();
    tgForm.append("chat_id", chatId);
    tgForm.append("caption", caption);
    tgForm.append("disable_web_page_preview", "true");

    // photo ist ein File (Blob) aus req.formData()
    tgForm.append("photo", photo, photo.name || "photo.jpg");

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      body: tgForm,
    });

    const data = await tgRes.json().catch(() => null);

    if (!tgRes.ok || !data?.ok) {
      return Response.json(
        { error: "Telegram error", details: data ?? "Bad response" },
        { status: 502 }
      );
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
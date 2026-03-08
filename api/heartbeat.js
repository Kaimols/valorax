import { redis, sessionKey } from "../lib/redis.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId, page, ref, ts } = req.body || {};

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  const key = sessionKey(sessionId);

  const existing = await redis.get(key);

  const payload = {
    sessionId,
    page: page || existing?.page || "loading5.html",
    ref: ref || existing?.ref || null,
    lastSeen: ts || Date.now(),
    nextPage: existing?.nextPage || null
  };

  await redis.set(key, payload, { ex: 60 });

  await redis.sadd("sessions:active", sessionId);

  res.status(200).json({ ok: true });
}
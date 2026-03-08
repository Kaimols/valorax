import { redis, sessionKey } from "../lib/redis.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId, page, ts, ref, ua, platform } = req.body || {};

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  const key = sessionKey(sessionId);

  const existing = (await redis.get(key)) || {};

  const session = {
    ...existing,
    sessionId,
    page,
    ref,
    ua,
    platform,
    lastSeen: ts || Date.now(),
    nextPage: existing.nextPage || null
  };

  await redis.set(key, session, { ex: 60 });

  return res.status(200).json({ ok: true });
}
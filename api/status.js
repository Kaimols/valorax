import { redis, sessionKey } from "../lib/redis.js";

export default async function handler(req, res) {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  const key = sessionKey(sessionId);
  const session = await redis.get(key);

  if (!session) {
    return res.status(200).json({ nextPage: null });
  }

  const nextPage = session.nextPage || null;

  if (nextPage) {
    session.nextPage = null;
    await redis.set(key, session, { ex: 60 });
  }

  return res.status(200).json({ nextPage });
}
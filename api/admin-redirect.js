import { redis, sessionKey } from "../lib/redis.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId, nextPage } = req.body || {};

  if (!sessionId || !nextPage) {
    return res.status(400).json({
      error: "sessionId and nextPage required"
    });
  }

  const key = sessionKey(sessionId);
  const session = await redis.get(key);

  if (!session) {
    return res.status(404).json({
      error: "Session not found"
    });
  }
/*test*/
  session.nextPage = nextPage;

  await redis.set(key, session, { ex: 60 });


  res.status(200).json({ ok: true });
} 
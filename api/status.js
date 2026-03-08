import { redis, sessionKey } from "../lib/redis.js";

export default async function handler(req, res) {

  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  const session = await redis.get(sessionKey(sessionId));

  res.status(200).json({
    nextPage: session?.nextPage || null
  });

}
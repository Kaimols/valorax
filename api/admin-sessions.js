import { redis, sessionKey } from "../lib/redis.js";

export default async function handler(req, res) {

  const ids = await redis.smembers("sessions:active") || [];

  const now = Date.now();
  const sessions = [];

  for (const id of ids) {

    const data = await redis.get(sessionKey(id));

    if (!data) {
      await redis.srem("sessions:active", id);
      continue;
    }

    if (now - Number(data.lastSeen) < 15000) {
      sessions.push(data);
    }

  }

  sessions.sort((a, b) => Number(b.lastSeen) - Number(a.lastSeen));

  res.status(200).json(sessions);

}
import { redis, sessionKey } from "../lib/redis.js";

export default async function handler(req, res) {
  const ids = (await redis.smembers("sessions:active")) || [];
  const now = Date.now();
  const sessions = [];

  for (const id of ids) {

  const raw = await redis.get(sessionKey(id));

  // 👉 HIER EINFÜGEN
  console.log("SESSION ID:", id);
  console.log("raw session:", raw);
  console.log("type:", typeof raw);

  if (!raw) {
    await redis.srem("sessions:active", id);
    continue;
  }

  let data;
  try {
    data = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error("JSON parse Fehler:", err);
    continue;
  }

  if (now - Number(data.lastSeen) < 15000) {
    sessions.push(data);
  }
}
}
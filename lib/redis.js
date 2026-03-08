import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export function sessionKey(sessionId) {
  return `session:${sessionId}`;
}
import { Redis } from "@upstash/redis";

export default async function handler(req, res) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    const redis = new Redis({ url, token });

    const pong = await redis.ping();

    return res.status(200).json({
      ok: true,
      pong,
      urlExists: !!url,
      tokenExists: !!token,
      urlStartsWithHttps: typeof url === "string" ? url.startsWith("https://") : false,
      urlPreview: url ? url.slice(0, 35) : null,
    });
  } catch (err) {
    console.error("REDIS TEST ERROR:", err);
    console.error("CAUSE:", err?.cause);

    return res.status(500).json({
      ok: false,
      message: err?.message || String(err),
      cause: err?.cause ? String(err.cause) : null,
      urlExists: !!process.env.UPSTASH_REDIS_REST_URL,
      tokenExists: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      urlStartsWithHttps:
        typeof process.env.UPSTASH_REDIS_REST_URL === "string"
          ? process.env.UPSTASH_REDIS_REST_URL.startsWith("https://")
          : false,
      urlPreview: process.env.UPSTASH_REDIS_REST_URL
        ? process.env.UPSTASH_REDIS_REST_URL.slice(0, 35)
        : null,
    });
  }
}
import Redis from "ioredis";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.UPSTASH_REDIS_URL) {
  throw new Error("Missing UPSTASH_REDIS_URL in environment variables");
}

// Initialize Redis client
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// Connection event handlers for better debugging
redis.on("connect", () => {
  console.log("Redis client connected successfully.");
});

redis.on("ready", () => {
  console.log("Redis client is ready to use.");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("close", () => {
  console.warn("Redis connection closed.");
});

redis.on("reconnecting", () => {
  console.info("Redis client reconnecting...");
});

redis.on("end", () => {
  console.warn("Redis connection has ended.");
});

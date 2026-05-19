const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    console.log("Redis reconnect error:", err.message);
    return true;
  },
});

redis.on("connect", () => console.log("✅ Redis Connected"));
redis.on("error", (err) => console.error("❌ Redis Error:", err.message));
redis.on("reconnecting", () => console.log("🔄 Redis Reconnecting..."));

module.exports = redis;

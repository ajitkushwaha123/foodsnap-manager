import Redis from "ioredis";

console.log(
    "redis URL:", process.env.REDIS_URL
)

const redis = new Redis(process.env.REDIS_URL);

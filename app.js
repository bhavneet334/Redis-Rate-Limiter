const express = require("express");
const { createClient } = require("redis");
const app = express();

const redisClient = createClient();

redisClient.connect();
redisClient.on("error", (err) => console.log("Redis error", err));

const RATE_LIMIT = 5;
const WINDOW_SECONDS = 60;

async function rateLimiter(req, res, next) {
  const ip = req.ip;
  const key = `rate_limit:${ip}`;

  const currentCount = await redisClient.incr(key);
  if (currentCount === 1) {
    await redisClient.expire(key, WINDOW_SECONDS);
  }

  if (currentCount > RATE_LIMIT) {
    return res.status(429).json({
      message: "You have hit the rate limit. Please try again later.",
    });
  }
  next();
}

app.get("/test", rateLimiter, (req, res) => {
  return res.send("Request successful");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

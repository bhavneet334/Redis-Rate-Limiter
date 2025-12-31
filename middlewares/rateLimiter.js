function rateLimiter(redisClient) {
  const RATE_LIMIT = 5;
  const WINDOW_SECONDS = 60;

  return async function (req, res, next) {
    const ip = req.ip;
    const key = `rate_limit:${ip}`;

    try {
      const currentCount = await redisClient.incr(key);
      if (currentCount === 1) {
        await redisClient.expire(key, WINDOW_SECONDS);
      }

      const ttl = await redisClient.ttl(key);
      const remaining = Math.max(RATE_LIMIT - currentCount, 0);

      res.set({
        "X-RateLimit-Limit": RATE_LIMIT,
        "X-RateLimit-Remaining": remaining,
        "X-RateLimit-Reset": ttl,
      });

      if (currentCount > RATE_LIMIT) {
        return res.status(429).json({
          message: "You have hit the rate limit. Please try again later.",
        });
      }
      next();
    } catch (err) {
      console.error("Rate limiter error", err);
      next();
    }
  };
}

module.exports.rateLimiter = rateLimiter;

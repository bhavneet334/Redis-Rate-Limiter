const express = require("express");
const { createClient } = require("redis");
const { rateLimiter } = require("./middlewares/rateLimiter");

const app = express();

const redisClient = createClient();

redisClient.connect();
redisClient.on("error", (err) => {
  console.error("Redis error", err);
});

app.get("/test", rateLimiter(redisClient), (req, res) => {
  return res.send("Request successful");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

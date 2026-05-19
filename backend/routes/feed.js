const express = require("express");
const router = express.Router();
const Feed = require("../models/Feed");
const redis = require("../config/redis");

const CACHE_KEY = "feeds:all";
const CACHE_TTL = 60; // 60 seconds


router.get("/", async (req, res) => {
  try {
    // 1. Redis cache check
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache", 
        data: JSON.parse(cached),
      });
    }

  
    const feeds = await Feed.find().sort({ createdAt: -1 }).lean();

    
    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(feeds));

    return res.status(200).json({
      success: true,
      source: "database",
      data: feeds,
    });
  } catch (error) {
    console.error("GET /feed error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

// ─── POST /feed ──────────────────────────────────────────────────────────────
// Validate → Save → Cache invalidate → Socket emit
router.post("/", async (req, res) => {
  try {
    const { title, content, author, category } = req.body;

    // Basic validation
    if (!title || !content || !author) {
      return res.status(400).json({
        success: false,
        message: "Title, content and author are required ",
      });
    }

    // DB mein save
    const feed = await Feed.create({ title, content, author, category });

    // Cache invalidate (naya data aaya toh purana cache hatao)
    await redis.del(CACHE_KEY);

    // Socket.IO se realtime broadcast
    req.io.emit("new_feed", feed);

    return res.status(201).json({
      success: true,
      message: "Feed successfully added!",
      data: feed,
    });
  } catch (error) {
    console.error("POST /feed error:", error.message);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
});

module.exports = router;

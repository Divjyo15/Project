const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["motivation", "tip", "announcement", "general"],
      default: "general",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto add hoga
  }
);

// Index for faster queries
feedSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Feed", feedSchema);

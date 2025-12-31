const mongoose = require("mongoose");
const { deflate } = require("zlib");

const pasteSchema = new mongoose.Schema(
  {
    // Short unique link ID
    pasteId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // Paste content
    content: {
      type: String,
      required: true
    },

    // Destruction mode selected by user
    destroyMode: {
      type: String,
      enum: ["READ", "TIME"],
      default: "TIME"
    },

    // Used only when destroyMode = READ
    hasBeenRead: {
      type: Boolean,
      default: false
    },

    // Expiry time (default = now + 5 days)
    expiresAt: {
      type: Date,
      default: () => Date.now() + 60*60*1000
    }
  },
  {
    timestamps: true
  }
);

// TTL index (automatic deletion)
pasteSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("Paste", pasteSchema);

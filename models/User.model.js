const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      default: "Unknown",
    },
    lastName: {
      type: String,
      default: "Unknown",
    },
    isPlayer: {
      type: Boolean,
      default: true,
    },
    isGameMaster: {
      type: Boolean,
      default: false,
    },
    birthDate: {
      type: Date,
    },
    status: {
      type: String,
      default: "Hey Fellows, ready to dive in?",
    },
    avatar: {
      type: String,
    },
    playerExp: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    gameMasterExp: {
      type: String,
      enum: ["none", "low", "medium", "high"],
      default: "none",
    },
    characters: {
      type: [Schema.Types.ObjectId],
      ref: "Character",
    },
    adventures: {
      type: [Schema.Types.ObjectId],
      ref: "Adventure",
    },
    location: {
      type: String,
      default: "Unknown",
    },
    languages: {
      type: [String],
      default: ["Unknown"],
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;

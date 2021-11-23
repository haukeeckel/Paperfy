const { Schema, model } = require("mongoose");

const AdventureSchema = new Schema(
  {
    adventureName: {
      type: String,
      required: true,
    },
    gameMasterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participantIds: {
      type: [Schema.Types.ObjectId],
      ref: "Character",
    },
    applicantsIds: {
      type: [Schema.Types.ObjectId],
      ref: "Character",
    },
    userIds: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    portrait: {
      type: String,
      // required: true,
    },
    gameSystem: {
      type: String,
      required: true,
      default: "How to be a Hero",
    },
    startDate: {
      type: Date,
      required: true,
    },
    groupSize: {
      type: Number,
      required: true,
    },
    plattform: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    expierience: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },
    estimatedTime: {
      type: Number,
      required: true,
    },
    communication: {
      type: String,
      enum: ["VOICE", "CAM AND VOICE"],
      required: true,
    },
    minAge: Number,
    plot: {
      type: String,
      required: true,
      maxLength: 280,
    },
  },
  {
    timestamps: true,
  }
);

const Adventure = model("Adventure", AdventureSchema);

module.exports = Adventure;

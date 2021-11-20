const { Schema, model } = require("mongoose");

const CharacterSchema = new Schema(
  {
    characterName: {
      type: String,
      required: true,
    },
    portrait: {
      type: String,
      required: true,
    },
    adventureId: {
      type: Schema.Types.ObjectId,
      ref: "Adventure",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    healthPoints: {
      type: Number,
      required: true,
    },
    figure: String,
    religion: String,
    profession: {
      type: String,
      required: true,
    },
    maritalStatus: {
      type: String,
      required: true,
    },
    physicalGlobal: [String],
    physical: [Object],
    knowledgeGlobal: [String],
    knowledge: [Object],
    socialGlobal: [String],
    social: [Object],
    inventory: [String],
    notes: [String],
    state: {
      type: String,
      enum: [
        "pre-saved",
        "saved",
        "pending-applied",
        "confirmed",
        "in-adventure",
        "finished",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CharacterModel = model("Character", CharacterSchema);

module.exports = CharacterModel;

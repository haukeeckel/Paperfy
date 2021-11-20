const { Schema, model } = require("mongoose");

const globalsSchema = new Schema(
  {
    gameSystems: {
      type: [String],
    },
    languages: {
      type: [String],
    },
    Locations: {
      type: [String],
    },
    Settings: {
      type: [String],
    },
    actionSkills: {
      type: [String],
    },
    knowledgeSkills: {
      type: [String],
    },
    socialSkills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Globals = model("Global", globalsSchema);

module.exports = Globals;

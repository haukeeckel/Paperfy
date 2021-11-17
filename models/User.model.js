const { Schema, model } = require('mongoose');

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
    firstName: String,
    lastName: String,
    isGameMaster: {
      type: Boolean,
      required: true,
    },
    birthDate: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      default: 'Hey Fellows, ready to dive in?',
    },
    avatar: {
      type: String,
      required: true,
    },
    playerExp: {
      type: String,
      enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH'],
    },
    gameMasterExp: {
      type: String,
      enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH'],
    },
    characters: {
      type: [Schema.Types.ObjectId],
      ref: 'Character',
    },
    location: {
      type: String,
    },
    languages: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = model('User', userSchema);

module.exports = User;

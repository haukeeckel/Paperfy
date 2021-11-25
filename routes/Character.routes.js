const router = require("express").Router();
const Character = require("../models/Character.model");
const User = require("../models/User.model");
const Adventure = require("../models/Adventure.model");

const loggedIn = (req, res, next) => {
  if (req.session.keks) {
    next();
  } else {
    res.status(400).redirect("/signup");
  }
};

/* ------ Authorization ------ */

/* ------ Browse ------ */
router.get("/character/:characterId", async (req, res, next) => {
  const loggedIn = !!req.session.keks;
  const { characterId } = req.params;

  try {
    const character = await Character.findById({ _id: characterId }).populate(
      "userId"
    );

    const { userId: user } = character;

    res.render("character/profileInfo", { character, loggedIn, user });
  } catch (err) {
    next(err);
  }
});

router.get("/character/:characterId/adventure", async (req, res, next) => {
  const loggedIn = !!req.session.keks;
  const { characterId } = req.params;

  try {
    const character = await Character.findById(characterId).populate("userId");
    const user = character.userId;
    const adventure = await Adventure.findOne({
      participantIds: characterId,
    })
      .populate("userIds")
      .populate("gameMasterId");

    res.render("character/profileAdventure", {
      character,
      adventure,
      user,
      loggedIn,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/character/:characterId/member", async (req, res, next) => {
  const loggedIn = !!req.session.keks;
  const { characterId } = req.params;

  try {
    const character = await Character.findById(characterId).populate("userId");
    const user = character.userId;
    const adventure = await Adventure.findOne({
      participantIds: characterId,
    })
      .populate("participantIds")
      .populate("gameMasterId");
    res.render("character/profileMember", {
      character,
      adventure,
      user,
      loggedIn,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me/character/create", loggedIn, async (req, res, next) => {
  const { _id } = req.session.keks;
  const loggedIn = !!req.session.keks;

  try {
    const user = await User.findById(_id);
    res.render("character/create.hbs", { loggedIn, user });
  } catch (err) {
    next(err);
  }
});

router.post("/me/character/create", loggedIn, async (req, res) => {
  const { _id: userId } = req.session.keks;
  const {
    characterName,
    gender,
    figure,
    profession,
    age,
    healthPoints,
    religion,
    maritalStatus,
    ...rest
  } = req.body;

  const portrait = `https://avatars.dicebear.com/api/croodles-neutral/${characterName}.svg`;
  const physical = {};
  const knowledge = {};
  const social = {};

  const skills = Object.values(rest);

  for (let i = 0; i <= skills.length; i = i + 2) {
    if (skills[i] != "") {
      if (i <= 10) {
        physical[skills[i]] = skills[i + 1];
      } else if (i <= 20) {
        knowledge[skills[i]] = skills[i + 1];
      } else {
        social[skills[i]] = skills[i + 1];
      }
    }
  }

  try {
    const character = await Character.create({
      characterName,
      gender,
      figure,
      profession,
      age,
      healthPoints,
      religion,
      maritalStatus,
      physical,
      knowledge,
      social,
      portrait,
      state: "saved",
      userId,
    });
    const user = await User.findById(userId);
    user.characters.push(character._id);
    await user.save();

    res.redirect("/me");
  } catch (err) {
    const user = await User.findById(userId);

    res.render("character/create", {
      user,
      characterName,
      gender,
      figure,
      profession,
      age,
      healthPoints,
      religion,
      maritalStatus,
      loggedIn: true,
    });
  }
});

module.exports = router;

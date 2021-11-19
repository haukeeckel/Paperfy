const router = require("express").Router();
const Character = require("../models/Character.model");
const User = require("../models/User.model");
// const Adventure = require("../models/Adventure.model");

/* ------ Authorization ------ */
const isPlayer = (req, res, next) => {
  if (req.session.keks.isPlayer) {
    next();
  } else {
    res.status(400).redirect("/signin");
  }
};

/* ------ Create ------ */
// get Form create Character
router.get("/me/character/create", isPlayer, (_, res) => {
  res.render("character/create.hbs");
});

// post Form create Character
router.post("/me/character/create", isPlayer, async (req, res, next) => {
  const { _id: userId } = req.session.keks;
  let {
    characterName,
    portrait,
    gender,
    age,
    healthPoints,
    figure,
    religion,
    profession,
    maritalStatus,
    physical,
    knowledge,
    social,
    inventory,
    notes,
  } = req.body;

  if (!portrait) {
    portrait = `https://avatars.dicebear.com/api/croodles-neutral/${characterName
      .split(" ")
      .join("")}.svg`;
  }

  try {
    const character = await Character.create({
      userId,
      characterName,
      portrait,
      gender,
      age,
      healthPoints,
      figure,
      religion,
      profession,
      maritalStatus,
      physical,
      knowledge,
      social,
      inventory,
      notes,
      state: "saved",
    });

    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { characters: character } }
    );
    req.session.keks.characters.push(character._id);

    res.status(200).json(character);
  } catch (err) {
    next(err);
  }
});

/* ------ Browse ------ */

module.exports = router;

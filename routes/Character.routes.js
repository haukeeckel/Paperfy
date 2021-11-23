const router = require("express").Router();
const Character = require("../models/Character.model");
// const User = require("../models/User.model");
const Adventure = require("../models/Adventure.model");

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

module.exports = router;

const router = require("express").Router();
const Character = require("../models/Character.model");
// const User = require("../models/User.model");
// const Adventure = require("../models/Adventure.model");

/* ------ Authorization ------ */

/* ------ Browse ------ */
router.get("/character/:characterId", async (req, res, next) => {
  let loggedIn = false;
  if (req.session.keks) {
    loggedIn = true;
  }
  const { characterId } = req.params;

  try {
    const character = await Character.findById({ _id: characterId }).populate(
      "userId"
    );
    const { userId: user } = character;
    res.render("character/adventureDetails", { character, loggedIn, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

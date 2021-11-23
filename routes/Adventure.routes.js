const router = require("express").Router();
const Adventure = require("../models/Adventure.model");

/* ------ Authorization ------ */

/* ------ Join ------ */
router.get("/adventure/apply", async (req, res) => {
  const { id } = req.params;

  try {
    const adventure = await Adventure.findById(id);
    if (adventure) {
      res.status(200).json(adventure);
    } else {
      // adventure._id == null => correct ObjectId format but not found
      res.sendStatus(400);
    }
  } catch (err) {
    // wrong ObjectId format
    res.sendStatus(400);
  }
});

router.post("/adventure/apply", async (req, res) => {
  const { id } = req.params;

  try {
    const adventure = await Adventure.findById(id);
    if (adventure) {
      res.status(200).json(adventure);
    } else {
      // adventure._id == null => correct ObjectId format but not found
      res.sendStatus(400);
    }
  } catch (err) {
    // wrong ObjectId format
    res.sendStatus(400);
  }
});

/* ------ Browse ------ */
router.get("/adventure/:id", async (req, res) => {
  const { id } = req.params;
  const loggedIn = !!req.session.keks;
  let isApplied = false;
  let _id;

  try {
    let adventure = await Adventure.findById(id).populate("gameMasterId");
    if (req.session.keks) {
      _id = req.session.keks;
      isApplied = adventure.userIds.includes(_id);
    }
    adventure.created = adventure.createdAt.toISOString().slice(0, 10);
    adventure.start = adventure.startDate.toISOString().slice(0, 10);
    adventure.time = adventure.startDate.toISOString().slice(11, 16);

    if (adventure) {
      res.render("adventure/profil", { loggedIn, adventure, isApplied });
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    res.sendStatus(400);
  }
});

router.get("/adventure/:id/characters", async (req, res) => {
  const { id } = req.params;
  const loggedIn = !!req.session.keks;
  let isApplied = false;
  let _id;

  try {
    let adventure = await Adventure.findById(id)
      .populate("gameMasterId")
      .populate("participantIds");
    if (req.session.keks) {
      _id = req.session.keks;
      isApplied = adventure.userIds.includes(_id);
    }
    adventure.created = adventure.createdAt.toISOString().slice(0, 10);

    if (adventure) {
      res.render("adventure/character", { loggedIn, adventure, isApplied });
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    res.sendStatus(400);
  }
});

module.exports = router;

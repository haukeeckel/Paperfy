const router = require("express").Router();
const Adventure = require("../models/Adventure.model");
const User = require("../models/User.model");

/* ------ Authorization ------ */

/* ------ Join ------ */
router.get("/adventure/:id/apply", async (req, res) => {
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
    res.render("adventure/apply", { loggedIn, adventure, isApplied });
  } catch (err) {
    // wrong ObjectId format
    res.sendStatus(400);
  }
});

router.post("/adventure/:id/apply", async (req, res) => {
  const { adventureId, message, characterId } = req.params;
  const { _id } = req.session.keks;

  try {
    const user = await User.findById(_id);
    const adventure = await Adventure.findById(adventureId);
    const applicant = {
      user: user._id,
      message,
      characterId,
    };

    if (user.playerExp == "high") {
      adventure.applicantsIds.push(applicant);
    } else if (adventure.expierience != "low" && user.playerExp == "medium") {
      adventure.applicants.push(applicant);
    } else if (adventure.expierience == "low") {
      adventure.applicants.push(applicant);
    }
  } catch (err) {
    res.sendStatus(400);
  }
});

/* ------ Applicants ------ */
router.get("/adventure/:id/applicants", async (req, res) => {
  const { id } = req.params;
  let isMyGame = false;
  let isApplied = false;
  const loggedIn = !!req.session.keks;
  let _id;

  try {
    const adventure = await Adventure.findById(id)
      .populate("applicants.userId")
      .populate("applicants.characterId")
      .populate("gameMasterId");
    if (req.session.keks) {
      _id = req.session.keks._id;
      isApplied =
        adventure.userIds.includes(_id) || adventure.gameMasterId._id == _id;
      isMyGame = adventure.gameMasterId._id == _id;
    }

    adventure.created = adventure.createdAt.toISOString().slice(0, 10);
    adventure.start = adventure.startDate.toISOString().slice(0, 10);
    adventure.time = adventure.startDate.toISOString().slice(11, 16);

    res.render("adventure/applicants", {
      adventure,
      loggedIn,
      isApplied,
      isMyGame,
    });
    // res.render("adventure/applicants", { adventure });
  } catch (err) {
    res.sendStatus(400);
  }
});

/* ------ Browse ------ */
router.get("/adventure/:id", async (req, res) => {
  const { id } = req.params;
  const loggedIn = !!req.session.keks;
  let isApplied = false;
  let isMyGame = false;
  let _id;

  try {
    let adventure = await Adventure.findById(id).populate("gameMasterId");
    if (req.session.keks) {
      _id = req.session.keks._id;
      isApplied =
        adventure.userIds.includes(_id) || adventure.gameMasterId._id == _id;

      if (!isApplied) {
        adventure.applicants.forEach((elem) => {
          if (elem.userId == _id) {
            isApplied = true;
          }
        });
      }

      isMyGame = adventure.gameMasterId._id == _id;
    }

    adventure.created = adventure.createdAt.toISOString().slice(0, 10);
    adventure.start = adventure.startDate.toISOString().slice(0, 10);
    adventure.time = adventure.startDate.toISOString().slice(11, 16);

    if (adventure) {
      res.render("adventure/profil", {
        loggedIn,
        adventure,
        isApplied,
        isMyGame,
      });
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
  let isMyGame = false;
  let _id;

  try {
    let adventure = await Adventure.findById(id)
      .populate("gameMasterId")
      .populate("participantIds");
    if (req.session.keks) {
      _id = req.session.keks._id;
      isApplied =
        adventure.userIds.includes(_id) || adventure.gameMasterId._id == _id;
      if (!isApplied) {
        adventure.applicants.forEach((elem) => {
          if (elem.userId == _id) {
            isApplied = true;
          }
        });
      }

      isMyGame = adventure.gameMasterId._id == _id;
    }
    adventure.created = adventure.createdAt.toISOString().slice(0, 10);
    if (adventure) {
      res.render("adventure/character", {
        loggedIn,
        adventure,
        isApplied,
        isMyGame,
      });
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    res.sendStatus(400);
  }
});

module.exports = router;

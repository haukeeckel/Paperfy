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
  let user;
  try {
    let adventure = await Adventure.findById(id).populate("gameMasterId");
    if (req.session.keks) {
      _id = req.session.keks;
      isApplied = adventure.userIds.includes(_id);
      user = await User.findById(_id).populate("characters");
    }
    adventure.created = adventure.createdAt.toISOString().slice(0, 10);
    res.render("adventure/apply", { loggedIn, adventure, isApplied, user });
  } catch (err) {
    // wrong ObjectId format
    res.sendStatus(400);
  }
});

router.post("/adventure/:id/apply", async (req, res) => {
  const { message, characterId } = req.body;
  const { _id } = req.session.keks;
  const { id } = req.params;

  try {
    const user = await User.findById(_id);
    const adventure = await Adventure.findById(id);
    const applicant = {
      userId: user._id,
      message,
      characterId,
    };

    if (user.playerExp == "high") {
      adventure.applicants.push(applicant);
      await adventure.save();
    } else if (adventure.expierience != "low" && user.playerExp == "medium") {
      adventure.applicants.push(applicant);
      await adventure.save();
    } else if (adventure.expierience == "low") {
      adventure.applicants.push(applicant);
      await adventure.save();
    }
    res.redirect(`/adventure/${id}`);
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

router.post("/adventure/:id/applicants/accept", async (req, res, next) => {
  const { id } = req.params;
  const { applicantsId } = req.body;

  try {
    const adventure = await Adventure.findById(id);
    let applicant = adventure.applicants.filter((applicant) => {
      return applicant._id == applicantsId;
    });

    adventure.participantIds.push(applicant[0].characterId);
    adventure.userIds.push(applicant[0].userId);

    await adventure.applicants.pull({ _id: applicantsId });
    await adventure.save();

    res.redirect(`/adventure/${id}/applicants`);
  } catch (err) {
    next(err);
  }
});

router.post("/adventure/:id/applicants/reject", async (req, res, next) => {
  const { id } = req.params;
  const { applicantsId } = req.body;

  try {
    const adventure = await Adventure.findById(id);
    await adventure.applicants.pull({ _id: applicantsId });
    await adventure.save();
    res.redirect(`/adventure/${id}/applicants`);
  } catch (err) {
    next(err);
  }
});

/* ------ Browse ------ */
router.get("/adventure/:id", async (req, res) => {
  const { id } = req.params;
  const loggedIn = !!req.session.keks;
  let isApplied = false;
  let isMyGame = false;
  let camCommun = false;
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
    camCommun = adventure.communication == "Voice and Camera";
    adventure.created = adventure.createdAt.toISOString().slice(0, 10);
    adventure.start = adventure.startDate.toISOString().slice(0, 10);
    adventure.time = adventure.startDate.toISOString().slice(11, 16);

    if (adventure) {
      res.render("adventure/profil", {
        loggedIn,
        adventure,
        isApplied,
        isMyGame,
        camCommun,
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

const router = require("express").Router();
const Adventure = require("../models/Adventure.model");
const User = require("../models/User.model");
const Character = require("../models/Character.model");

/* ------ Authorization ------ */

const isGameMaster = (req, res, next) => {
  if (req.session.keks.isGameMaster) {
    next();
  } else {
    res.status(400).redirect("/signin");
  }
};

/* ------ Join ------ */
router.get("/adventure/:id/apply", async (req, res) => {
  const { id } = req.params;
  const loggedIn = !!req.session.keks;
  let isApplied = false;
  let _id;
  let user;

  if (!req.session.keks) {
    res.redirect("/signup");
  }

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
    const loggedIn = !!req.session.keks;
    const adventure = await Adventure.findById(id).populate("gameMasterId");
    adventure.created = adventure.createdAt.toISOString().slice(0, 10);
    let isApplied = false;
    const user = await User.findById(_id).populate("characters");

    res.render("adventure/apply", { loggedIn, adventure, isApplied, user });
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

    await Character.findByIdAndUpdate(applicant[0].characterId, {
      adventureId: adventure._id,
    });
    await User.findByIdAndUpdate(applicant[0].userId, {
      $push: { adventures: adventure._id },
    });

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

router.post("/adventure/:id/applicants/close", async (req, res, next) => {
  const { id } = req.params;
  try {
    await Adventure.findByIdAndUpdate(id, { isActive: false });
    res.redirect(`/adventure/${id}`);
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

router.get("/me/adventure/create", isGameMaster, async (req, res, next) => {
  const loggedIn = !!req.session.keks;
  const { _id } = req.session.keks;
  try {
    const user = await User.findById(_id);
    res.render("adventure/create", { loggedIn, user });
  } catch (err) {
    next(err);
  }
});

router.post("/me/adventure/create", isGameMaster, async (req, res) => {
  const { _id: gameMasterId } = req.session.keks;

  const startDateInput = `${req.body.startDate}T${req.body.startTime}:00`;
  const startDate = new Date(startDateInput);

  const {
    adventureName,
    gameSystem,
    groupSize,
    plattform,
    language,
    expierience,
    estimatedTime,
    communication,
    plot,
    startTime,
    connection,
    startDate: prevInputDate,
  } = req.body;

  const portrait = `https://avatars.dicebear.com/api/identicon/${adventureName}.svg`;

  try {
    const adventure = await Adventure.create({
      gameMasterId,
      adventureName,
      gameSystem,
      groupSize,
      plattform,
      language,
      expierience,
      estimatedTime,
      communication,
      plot,
      connection,
      startDate,
      portrait,
    });

    await User.findByIdAndUpdate(gameMasterId, {
      $push: { adventures: adventure._id },
    });
    res.redirect("/me");
  } catch (err) {
    const user = await User.findById(gameMasterId);

    res.render("adventure/create", {
      user,
      adventureName,
      gameSystem,
      groupSize,
      plattform,
      language,
      expierience,
      estimatedTime,
      communication,
      plot,
      prevInputDate,
      loggedIn: true,
      connection,
      startTime,
    });
  }
});

router.get("me/adventure/edit/:_id", isGameMaster, async (req, res, next) => {
  const { _id } = req.params;

  try {
    const adventure = await Adventure.findById(_id);
    res.render("adventure/edit", adventure);
  } catch (err) {
    next(err);
  }
});

router.post("me/adventure/edit/:_id", isGameMaster, async (req, res, next) => {
  const { _id } = req.params;
  const {
    gameMasterId,
    adventureName,
    gameSystem,
    startDate,
    groupSize,
    plattform,
    language,
    expierience,
    estimatedTime,
    communication,
    minAge,
    plot,
  } = req.body;

  try {
    const adventure = await Adventure.findByIdAndUpdate(
      { _id },
      {
        gameMasterId,
        adventureName,
        gameSystem,
        startDate,
        groupSize,
        plattform,
        language,
        expierience,
        estimatedTime,
        communication,
        minAge,
        plot,
      }
    );
    res.status(200).json(adventure);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

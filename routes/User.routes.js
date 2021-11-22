const router = require("express").Router();
const User = require("../models/User.model");
const Adventure = require("../models/Adventure.model");
const Character = require("../models/Character.model");
const bcrypt = require("bcryptjs");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../utilities/validators");

const loggedIn = (req, res, next) => {
  if (req.session.keks) {
    next();
  } else {
    res.status(400).redirect("/signup");
  }
};

const isGameMaster = (req, res, next) => {
  if (req.session.keks.isGameMaster) {
    next();
  } else {
    res.status(400).redirect("/signin");
  }
};

const isItMe = (_id, cookie) => {
  if (_id === cookie) {
    return true;
  } else {
    return false;
  }
};
/* ------ Signup✅ ------ */
router.get("/signup", (_, res) => {
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  const { notValid, errors } = validateRegisterInput(
    username,
    email,
    password,
    confirmPassword
  );

  if (notValid) {
    res.render("auth/signup", { errors });
    return;
  }

  const avatar = `https://avatars.dicebear.com/api/croodles-neutral/${username}.svg`;

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(password, salt);

  try {
    const user = await User.create({ username, email, password: hash, avatar });
    delete user._doc.email;
    delete user._doc.password;
    delete user._doc.createdAt;
    delete user._doc.updatedAt;
    delete user._doc.__v;

    req.session.keks = user;
    res.redirect("signup/info");
  } catch (err) {
    if (err.code == 11000) {
      errors.username = "Username is already taken.";
      res.render("auth/signup", { errors });
      return;
    }
    next(err);
  }
});

/* ------ INFO ------ */

router.get("/signup/info", (req, res) => {
  const loggedIn = !!req.session.keks;

  res.render("auth/info", { loggedIn });
});

router.post("/signup/info", async (req, res, next) => {
  const { _id } = req.session.keks;
  const { birthDate, location, playerExp, gameMasterExp } = req.body;
  try {
    await User.findByIdAndUpdate(_id, {
      birthDate,
      location,
      playerExp,
      gameMasterExp,
    });
    res.redirect("/me");
  } catch (err) {
    next(err);
  }
});

/* ------ Signin✅ ------ */
router.get("/signin", (_, res) => {
  res.render("auth/signin");
});

router.post("/signin", async (req, res, next) => {
  const { userInput, password } = req.body;

  const { notValid, errors } = validateLoginInput(userInput, password);

  if (notValid) {
    res.render("auth/signin", { errors });
    return;
  }

  try {
    const user = await User.findOne({
      $or: [{ username: userInput }, { email: userInput }],
    });

    if (!user) {
      errors.username = "User not found";
      res.render("auth/signin", { errors });
      return;
    }

    const checkPW = bcrypt.compareSync(password, user.password);

    if (checkPW) {
      delete user._doc.email;
      delete user._doc.password;
      delete user._doc.createdAt;
      delete user._doc.updatedAt;
      delete user._doc.__v;

      req.session.keks = user;

      res.redirect("/me");
    } else {
      errors.password = "You entered a wrong Password";
      res.render("auth/signin", { errors });
      return;
    }
  } catch (err) {
    next(err);
  }
});

/* ------ Logout✅ ------ */
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).redirect("/");
});

/* ------ my Profile✅ ------ */
router.get("/me", async (req, res, next) => {
  const { _id } = req.session.keks;
  const loggedIn = !!req.session.keks;

  try {
    const user = await User.findById({ _id }).populate("adventures");

    if (user.adventures.length >= 3) {
      user.adventures = user.adventures.slice(0, user.adventures.length - 2);
    }

    res.render("user/profile", { user, loggedIn });
  } catch (err) {
    next(err);
  }
});

/* ------ every Profile✅ ------ */
router.get("/user/:_id", async (req, res, next) => {
  const { _id } = req.params;
  const loggedIn = !!req.session.keks;
  const isMe = isItMe(_id, req.session.keks);

  try {
    const user = await User.findById({ _id }).populate("adventures");

    if (user.adventures.length >= 3) {
      user.adventures = user.adventures.slice(0, user.adventures.length - 2);
    }

    res.render("user/profile", { user, loggedIn, isMe });
  } catch (err) {
    next(err);
  }
});

// User Profile - Character Submenu ✅
router.get("/user/:_id/character", async (req, res) => {
  const { _id } = req.params;
  const loggedIn = !!req.session.keks;
  const isMe = isItMe(_id, req.session.keks._id);

  try {
    const user = await User.findById(_id, {
      characters: { $slice: 5 },
    }).populate("characters");

    res.render("user/profileCharacters", { user, loggedIn, isMe });
  } catch (err) {
    res.sendStatus(400);
  }
});

// User Profile - Adventure Submenu ✅
router.get("/user/:_id/adventure", async (req, res) => {
  const { _id } = req.params;
  const loggedIn = !!req.session.keks;
  const isMe = isItMe(_id, req.session.keks._id);

  try {
    const user = await User.findById(_id, {
      adventures: { $slice: 5 },
    }).populate("adventures");

    user.adventures = user.adventures.filter((adventure) => {
      if (adventure.gameMasterId.toString() == _id) {
        return adventure;
      }
    });

    await user.populate("adventures");

    res.render("user/profileAdventures", { user, loggedIn, isMe });
  } catch (err) {
    res.sendStatus(400);
  }
});

/* ------ Edit⚠️ ------ */
router.get("/me/edit", async (req, res, next) => {
  const { _id } = req.session.keks;
  const loggedIn = true;

  try {
    const user = await User.findById({ _id });

    res.render("user/editProfile", { user, loggedIn });
  } catch (err) {
    next(err);
  }
});

router.post("/me/edit", async (req, res, next) => {
  const { _id } = req.session.keks;
  const {
    username,
    email,
    firstName,
    lastName,
    isPlayer,
    isGameMaster,
    status,
    avatar,
    playerExp,
    gameMasterExp,
    location,
    lanugages,
  } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      { _id },
      {
        username,
        email,
        firstName,
        lastName,
        isPlayer,
        isGameMaster,
        status,
        avatar,
        playerExp,
        gameMasterExp,
        location,
        lanugages,
      }
    );
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

/* ------ Delete⚠️ ------ */
// TODO Delete all Characters and set Adventure-Links to ['DELETED]'
router.get("/me/delete", (req, res) => {
  res.render("user/profile");
});

router.post("/me/delete", async (req, res, next) => {
  const { password } = req.body;
  const { _id } = req.session.keks;

  try {
    const user = await User.findById(_id);

    const checkPW = bcrypt.compareSync(password, user.password);

    if (checkPW) {
      await User.findByIdAndDelete(_id);
      req.session.destroy();
      res.status(200).redirect("/");
    } else {
      const errors = { password: "You entered a wrong Password" };
      res.status(400).json(errors);
      throw new Error("incorrect input");
    }
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------
// to sort:
router.get("/me/character/create", loggedIn, (_, res) => {
  res.render("character/create.hbs");
});

router.post("/me/character/create", async (req, res, next) => {
  // const { _id: userId } = req.session.keks;
  let {
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
      { userId },
      { $push: { characters: character } }
    );
    req.session.keks.characters.push(character._id);

    res.status(200).json(character);
  } catch (err) {
    next(err);
  }
});

router.get("/me/adventure/create", isGameMaster, (_, res) => {
  res.render("adventure/create");
});

router.post("/me/adventure/create", isGameMaster, async (req, res, next) => {
  const {
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

  const { _id } = req.session.keks;

  try {
    const adventure = await Adventure.create({
      gameMasterId: _id,
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
    });

    await User.findOneAndUpdate({ _id }, { $push: { adventures: adventure } });
    req.session.keks.adventures.push(adventure._id);
    res.status(200).json(adventure);
  } catch (err) {
    next(err);
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

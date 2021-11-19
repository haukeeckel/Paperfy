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
    res.status(400).redirect("/signin");
  }
};

const isGameMaster = (req, res, next) => {
  if (req.session.keks.isGameMaster) {
    next();
  } else {
    res.status(400).redirect("/signin");
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
    res.status(400).json(errors);
    throw new Error("User Inpupt Error: 400");
  }

  const avatar = `https://avatars.dicebear.com/api/croodles-neutral/${username}.svg`;

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(password, salt);

  try {
    const user = await User.create({ username, email, password: hash, avatar });
    res.json(user);
  } catch (err) {
    if (err.code == 11000) {
      res.status(400).send({ username: "Username is already taken." });
      return;
    }
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
    res.status(400).json(errors);
    throw new Error("User Inpupt Error: 400");
  }

  try {
    const user = await User.findOne({
      $or: [{ username: userInput }, { email: userInput }],
    });

    if (!user) {
      errors.username = "User not found";
      res.status(400).json(errors);
      throw new Error("incorrect input");
    }

    const checkPW = bcrypt.compareSync(password, user.password);

    if (checkPW) {
      delete user._doc.email;
      delete user._doc.password;
      delete user._doc.createdAt;
      delete user._doc.updatedAt;
      delete user._doc.__v;

      req.session.keks = user;

      res.status(200).json(user);
    } else {
      errors.password = "You entered a wrong Password";
      res.status(400).json(errors);
      throw new Error("incorrect input");
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

/* ------ Profile ------ */
router.get("/me", loggedIn, async (req, res, next) => {
  const adventuresIds = req.session.keks.adventures;
  const response = {
    user: req.session.keks,
  };
  try {
    const adventures = await Adventure.find({
      _id: { $in: [adventuresIds] },
    }).limit(2);

    response.adventures = adventures;

    res.status(200).json(response);
  } catch (err) {
    next();
  }
});

/* ------ Edit⚠️ ------ */
router.get("/me/edit", loggedIn, async (req, res, next) => {
  const { _id } = req.session.keks;

  try {
    const user = await User.findById(_id);
    res.status(200).json(user);
    // res.render("user/editProfile");
  } catch (err) {
    next(err);
  }
});

router.post("/me/edit", loggedIn, async (req, res, next) => {
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
router.get("/me/delete", loggedIn, (req, res) => {
  res.render("user/profile");
});

router.post("/me/delete", loggedIn, async (req, res, next) => {
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

// User Profile - my Click on Character Submenu
router.get("/me/character", loggedIn, async (req, res) => {
  const { _id } = req.session.keks;

  try {
    if (req.session.keks.characters.length) {
      const characters = await User.findById(_id)
        .populate("characters")
        .limit(6);
      res.status(200).json(characters);
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    res.sendStatus(400);
  }
});

// User Profile - my Click on one Character
router.get("/me/character/:_id", loggedIn, async (req, res, next) => {
  const { _id } = req.params;

  try {
    const character = await Character.findById(_id);
    res.status(200).json(character);
  } catch (err) {
    next(err);
  }
});

router.get("me/adventure/create", isGameMaster, (_, res) => {
  res.render("adventure/create");
});

router.post("me/adventure/create", isGameMaster, async (req, res, next) => {
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

router.get("/me/adventures", loggedIn, async (req, res) => {
  const { _id } = req.session.keks;

  try {
    if (req.session.keks.adventures.length) {
      const adventures = await User.findById(_id)
        .populate("adventures")
        .limit(6);
      res.status(200).json(adventures);
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    res.sendStatus(400);
  }
});

module.exports = router;

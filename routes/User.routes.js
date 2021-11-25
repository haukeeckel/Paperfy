const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const {
  validateRegisterInput,
  validateLoginInput,
  validateEditInput,
} = require("../utilities/validators");

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

router.get("/signup/info", async (req, res, next) => {
  const loggedIn = !!req.session.keks;
  const { _id } = req.session.keks;
  try {
    let user = await User.findById({ _id });
    res.render("auth/info", { loggedIn, user });
  } catch (err) {
    next(err);
  }
});

router.post("/signup/info", async (req, res, next) => {
  const { _id } = req.session.keks;
  let {
    birthDate,
    location,
    playerExp,
    gameMasterExp,
    isGameMaster,
    inputLanguages,
  } = req.body;
  let languages = [];
  if (isGameMaster == "on") {
    isGameMaster = true;
  }

  if (typeof inputLanguages == "string") {
    languages.push(inputLanguages);
  } else {
    languages = inputLanguages;
  }

  try {
    const user = await User.findByIdAndUpdate(_id, {
      birthDate,
      location,
      playerExp,
      gameMasterExp,
      isGameMaster,
      languages,
    });

    req.session.regenerate(() => {
      req.session.keks = user;
      res.redirect("/me");
    });
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

  let atHome = true;
  try {
    const user = await User.findById({ _id }).populate("adventures");

    user.adventures = await user.adventures
      .filter((adventure) => {
        return adventure.isActive == false;
      })
      .sort((a, b) => {
        if (a.startDate < b.startDate) {
          return -1;
        }
        if (a.startDate > b.startDate) {
          return 1;
        } else {
          return 0;
        }
      });

    if (user.adventures.length >= 3) {
      user.adventures = user.adventures.slice(0, user.adventures.length - 2);
    }

    await user.populate("adventures");

    res.render("user/profile", { user, loggedIn, atHome });
  } catch (err) {
    next(err);
  }
});

/* ------ every Profile✅ ------ */
router.get("/user/:_id", async (req, res, next) => {
  const { _id } = req.params;
  const loggedIn = !!req.session.keks;
  let atHome = false;

  if (req.session.keks) {
    atHome = isItMe(_id, req.session.keks._id);
  }

  try {
    const user = await User.findById({ _id }).populate("adventures");

    user.adventures = await user.adventures
      .filter((adventure) => {
        return adventure.isActive == false;
      })
      .sort((a, b) => {
        if (a.startDate < b.startDate) {
          return -1;
        }
        if (a.startDate > b.startDate) {
          return 1;
        } else {
          return 0;
        }
      });

    if (user.adventures.length >= 3) {
      user.adventures = user.adventures.slice(0, user.adventures.length - 2);
    }

    await user.populate("adventures");

    res.render("user/profile", { user, loggedIn, atHome });
  } catch (err) {
    next(err);
  }
});

// User Profile - Character Submenu ✅
router.get("/user/:_id/character", async (req, res) => {
  const { _id } = req.params;
  const loggedIn = !!req.session.keks;
  let atHome = false;

  if (req.session.keks) {
    atHome = isItMe(_id, req.session.keks._id);
  }

  try {
    const user = await User.findById(_id, {
      characters: { $slice: 5 },
    }).populate("characters");

    res.render("user/profileCharacters", { user, loggedIn, atHome });
  } catch (err) {
    res.sendStatus(400);
  }
});

// User Profile - Adventure Submenu ✅
router.get("/user/:_id/adventure", async (req, res) => {
  const { _id } = req.params;
  const loggedIn = !!req.session.keks;
  let atHome = false;

  if (req.session.keks) {
    atHome = isItMe(_id, req.session.keks._id);
  }

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

    res.render("user/profileAdventures", { user, loggedIn, atHome });
  } catch (err) {
    res.sendStatus(400);
  }
});

/* ------ Edit⚠️ ------ */
router.get("/me/edit", async (req, res, next) => {
  const { _id } = req.session.keks;
  const loggedIn = true;

  try {
    let user = await User.findById({ _id });
    if (user.birthDate) {
      user.born = user.birthDate.toISOString().slice(0, 10);
    }
    res.render("user/edit", { user, loggedIn });
  } catch (err) {
    next(err);
  }
});

router.post("/me/edit", async (req, res, next) => {
  const { _id } = req.session.keks;
  const loggedIn = true;
  let {
    username,
    email,
    firstName,
    lastName,
    isPlayer,
    isGameMaster,
    status,
    birthDate,
    avatar,
    playerExp,
    gameMasterExp,
    location,
    inputLanguages,
    password,
    newPassword,
    confirmNewPassword,
  } = req.body;

  try {
    let user = await User.findById({ _id });

    const { notValid, errors } = validateEditInput(
      email,
      newPassword,
      confirmNewPassword
    );
    if (notValid) {
      res.render("user/edit", { user, errors, loggedIn });
      return;
    }
    let hash;
    if (newPassword != "") {
      const salt = bcrypt.genSaltSync(12);
      hash = bcrypt.hashSync(newPassword, salt);
    }

    let languages = [];
    if (isGameMaster == "on") {
      isGameMaster = true;
    } else {
      isGameMaster = false;
    }

    if (typeof inputLanguages == "string") {
      languages.push(inputLanguages);
    } else {
      languages = inputLanguages;
    }
    const checkPW = bcrypt.compareSync(password, user.password);

    if (!checkPW) {
      const errors = {
        passwordConf: "Please enter your current password!",
      };
      res.render("user/edit", {
        user,
        loggedIn,
        errors,
      });
      return;
    }

    if (!hash) {
      hash = user.password;
    }

    user = await User.findByIdAndUpdate(
      { _id },
      {
        username,
        password: hash,
        email,
        firstName,
        lastName,
        isPlayer,
        isGameMaster,
        birthDate,
        status,
        avatar,
        playerExp,
        gameMasterExp,
        location,
        languages,
      }
    );
    await req.session.regenerate(() => {
      req.session.keks = user;
      res.redirect("/me");
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

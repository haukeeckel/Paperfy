const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../utilities/validators");

/* ------ Signup ------ */
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

/* ------ Signin ------ */
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

/* ------ Private ------ */
const loggedIn = (req, res, next) => {
  if (req.session.keks) {
    next();
  } else {
    res.status(400).redirect("/signin");
  }
};

router.get("/me", loggedIn, (req, res) => {
  res.render("user/profile");
});

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

/* ------ Logout ------ */
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).redirect("/");
});

module.exports = router;

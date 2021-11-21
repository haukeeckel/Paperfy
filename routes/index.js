const router = require("express").Router();

/* GET home page */
router.get("/", (req, res) => {
  let loggedIn = false;
  if (req.session.keks) {
    loggedIn = true;
  }

  res.render("index", { loggedIn });
});

module.exports = router;

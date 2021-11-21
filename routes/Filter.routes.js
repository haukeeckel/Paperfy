const router = require("express").Router();
const Adventure = require("../models/Adventure.model");

router.get("/filter", (req, res) => {
  const loggedIn = !!req.session.keks;
  res.render("adventure/filter", { loggedIn });
});

router.post("/filter", async (req, res, next) => {
  const { setting, gameSystem, language } = req.body;
  const loggedIn = !!req.session.keks;

  try {
    let filterResults = await Adventure.find({
      setting,
      gameSystem,
      language,
      isActive: true,
    });

    filterResults = filterResults.filter(
      (elem) => elem.groupSize > elem.userIds.length
    );

    filterResults.forEach((obj) => {
      obj._doc.playerCount = obj._doc.groupSize - obj._doc.userIds.length;
    });

    filterResults = JSON.stringify(filterResults);
    filterResults = JSON.parse(filterResults);

    res.render("adventure/filter", { filterResults, loggedIn });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const router = require("express").Router();
const Adventure = require("../models/Adventure.model");

router.get("/filter", (req, res) => {
  res.render("adventure/filter");
});

router.post("/filter", async (req, res, next) => {
  const { setting, gameSystem, language } = req.body;
  console.log(req.body);

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
    let newFilterResults = JSON.stringify(filterResults);
    newFilterResults = JSON.parse(newFilterResults);
    console.log(newFilterResults);
    res.render("adventure/filter", { newFilterResults });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

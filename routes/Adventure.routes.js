const router = require("express").Router();
const Adventure = require("../models/Adventure.model");

/* ------ Authorization ------ */

/* ------ Join ------ */

/* ------ Browse ------ */
router.get("/adventure/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const adventure = await Adventure.findById(id);
    if (adventure) {
      res.status(200).json(adventure);
    } else {
      // adventure._id == null => correct ObjectId format but not found
      res.sendStatus(400);
    }
  } catch (err) {
    // wrong ObjectId format
    res.sendStatus(400);
  }
});

module.exports = router;

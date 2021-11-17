const router = require('express').Router();

/* GET home page */
router.get('/', (_, res) => {
  res.render('index');
});

module.exports = router;

const router = require('express').Router();
const { validateRegisterInput } = require('../utilities/validators');

router.get('/signup/', (_, res) => {
  res.sendStatus(200);
});

router.post('/signup/', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const { notValid, errors } = validateRegisterInput(
    username,
    email,
    password,
    confirmPassword
  );

  if (notValid) {
    res.status(400).json(errors);
    throw new Error('User Inpupt Error: 400');
  }

  res.status(200);
});

module.exports = router;

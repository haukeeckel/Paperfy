const passRegEx = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const mailRegEx =
  /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;

module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};

  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  } else if (username.length > 16) {
    errors.username = "Username must not be longer than 16 characters";
  }

  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    if (!email.match(mailRegEx)) {
      errors.email = "Email must be in a regular format";
    }
  }

  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  } else if (password !== confirmPassword) {
    errors.password = "Password must match";
  } else if (!password.match(passRegEx)) {
    errors.password =
      "Password must match min. 8 character, with at least a symbol, upper and lower case letters and a number";
  }

  return {
    errors,
    notValid: Object.keys(errors).length >= 1,
  };
};

module.exports.validateLoginInput = (userInput, password) => {
  const errors = {};

  if (userInput.trim() === "") {
    errors.username = "Username must not be empty";
  }

  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    notValid: Object.keys(errors).length >= 1,
  };
};

module.exports.validateEditInput = (email, password, confirmPassword) => {
  const errors = {};

  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    if (!email.match(mailRegEx)) {
      errors.email = "Email must be in a regular format";
    }
  }

  if (password !== confirmPassword) {
    errors.password = "Password must match";
  } else if (!password.match(passRegEx)) {
    if (password != "") {
      errors.password =
        "Password must match min. 8 character, with at least a symbol, upper and lower case letters and a number";
    }
  }

  return {
    errors,
    notValid: Object.keys(errors).length >= 1,
  };
};

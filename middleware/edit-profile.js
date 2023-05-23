
require('dotenv').config();
const Joi = require("joi");
require("../utils.js");
const {isLoggedIn} = require("./login");

const errorMessages = {
  emptyUserName: 'Please provide a name',
}

const signupScheme = Joi.object({
  username: Joi.string().min(3).max(20).required(),
});

const editProfileValidation = async (req, res, next) => {
  let username = req.body.username;

  const validationResult = signupScheme.validate({username});

  let errorMessage = '';

  // if there is an empty input or error
  if (validationResult.error != null) {
    if (username.length < 1) {
      errorMessage = errorMessages.emptyUserName;
    } else {
      errorMessage = validationResult.error.message;
    }

    res.render('signup-submit', { signupFail: true, errorMessage, isLoggedIn: isLoggedIn(req) });
    // res.redirect(`/error?error=${errorMessage}`);
    // res.render('error', { signupFail: true, message: errorMessage, isLoggedIn: isLoggedIn(req) });
    console.log('error')
    return;
  }
  next();
  console.log('success')
}

module.exports = {
  editProfileValidation
}

require('dotenv').config();
const Joi = require("joi");
require("../utils.js");
const bcrypt = require("bcrypt");
const mongodb_database = process.env.MONGODB_DATABASE;


const loginScheme = Joi.object({
  userId: Joi.string().required(),
  password: Joi.string().max(20).required()
});

const errorMessages = {
  emptyUserName: 'Please provide a user name',
  emptyUserId: 'Please provide an id',
  emptyPassword: 'Please provide a password',
}

function isLoggedIn (req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

const loginValidation = async (req, res, next) => {
  let userId = req.body.userId;
  let password = req.body.password;

  let errorMessage = {};
  const validationResult = loginScheme.validate({ userId, password});

  if (validationResult.error != null) {
    if (userId.length < 1) {
      errorMessage = errorMessages.emptyUserId;
    } else if (password.length < 1) {
      errorMessage = errorMessages.emptyPassword;
    } else {
      errorMessage = validationResult.error.message;
    }
    res.render('login-submit', { errorMessage, isLoggedIn: isLoggedIn(req) });
    return;
  }

  // check if the user exists in the database
  let {database} = include('databaseConnection');
  const userCollection = database.db(mongodb_database).collection('users');
  const result = await userCollection.find({userId: userId}).project({userId: 1, password: 1, _id: 1}).toArray();

  // if the user does not exist
  if (result.length != 1) {
    errorMessage = 'Can not find the user.';
    res.render('login-submit', { errorMessage, isLoggedIn: isLoggedIn(req) });
    return;
  }

  // check if the password is correct
  if (!await bcrypt.compare(password, result[0].password)) {
    errorMessage = 'Invalid id/password combination';
    res.render('login-submit', { errorMessage, isLoggedIn: isLoggedIn(req) });
    return;
  }

  next();
}

module.exports = {
  isLoggedIn,
  loginValidation
}
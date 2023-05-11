
require('dotenv').config();
const Joi = require("joi");
require("../utils.js");
const bcrypt = require("bcrypt");
const mongodb_database = process.env.MONGODB_DATABASE;


const loginScheme = Joi.object({
  id: Joi.string().required(),
  password: Joi.string().max(20).required()
});

const errorMessages = {
  emptyUserName: 'Please provide a user name',
  emptyID: 'Please provide an id',
  emptyPassword: 'Please provide a password',
}

function isLoggedIn (req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

const loginValidation = async (req, res, next) => {
  let id = req.body.id;
  let password = req.body.password;

  let errorMessage = {};
  const validationResult = loginScheme.validate({ id, password});

  if (validationResult.error != null) {
    if (id.length < 1) {
      errorMessage = errorMessages.emptyID;
    } else if (password.length < 1) {
      errorMessage = errorMessages.emptyPassword;
    } else {
      errorMessage = validationResult.error.message;
    }
    res.render('login-submit', { errorMessage });
    return;
  }

  // check if the user exists in the database
  let {database} = include('databaseConnection');
  const userCollection = database.db(mongodb_database).collection('users');
  const result = await userCollection.find({id: id}).project({id: 1, password: 1, _id: 1}).toArray();

  // if the user does not exist
  if (result.length != 1) {
    errorMessage = 'Can not find the user.';
    res.render('login-submit', { errorMessage });
    return;
  }

  // check if the password is correct
  if (!await bcrypt.compare(password, result[0].password)) {
    errorMessage = 'Invalid id/password combination';
    res.render('login-submit', { errorMessage });
    return;
  }

  next();
}

module.exports = {
  isLoggedIn,
  loginValidation
}
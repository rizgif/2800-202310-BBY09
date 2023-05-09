require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require("joi");

require("./utils.js");

const {
  sessionValidation,
  loginValidation,
  adminAuthorization,
  isValidSession,
  isAdmin,
  isLoggedIn
} = require('./middleware');

const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();


const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)


/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

let {database} = include('databaseConnection');

// const userCollection = database.db(mongodb_database).collection('users');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));


var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
  crypto: {
    secret: mongodb_session_secret
  }
})

app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store
    saveUninitialized: false,
    resave: true
  }
));

/* === Pages === */

require("./routes/index.js");

app.get('/', (req,res) => {
  // let username = req.session.username || 'test';
  // res.render("index", {isLoggedIn: isLoggedIn(req), username: username});
  res.render("index", {isLoggedIn: false});
});

app.get('/login', (req,res) => {
  res.render("login");
});

app.get('/sample', (req,res) => {
  res.render("sample");
});


app.get('/login', (req,res) => {
  res.render('login')
});
app.use('/loggedin', sessionValidation);

app.post('/loginSubmit', loginValidation, async (req,res) => {
  let email = req.body.email;

  const result = await userCollection.find({email: email}).project({email: 1, password: 1, username: 1,  _id: 1}).toArray();

  req.session.authenticated = true;
  req.session.email = email;
  req.session.username = result[0].username;
  req.session.cookie.maxAge = expireTime;

  res.redirect('/');
});

app.get('/loggedin', (req,res) => {
  if (!req.session.authenticated) {
    res.redirect('/login');
  }
  // If so, render the loggedin page
  res.render("loggedin");
});

app.get('logout', (req,res) => {
  req.session.destroy();
  res.render("loggedout");
});


/* === // Pages end === */

app.use(express.static(__dirname + "/public"));

app.get("*", (req,res) => {
  res.status(404);
  res.send("Page not found - 404");
})

app.listen(port, () => {
  console.log("Node application listening on port "+port);
});
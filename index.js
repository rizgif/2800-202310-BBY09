require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require("joi");

require("./utils.js");

const {
  sessionValidation,
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

const userCollection = database.db(mongodb_database).collection('combined_data');

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

// app.get('/', (req,res) => {
//   // let username = req.session.username || 'test';
//   // res.render("index", {isLoggedIn: isLoggedIn(req), username: username});
//   res.render("index", {isLoggedIn: false});
// });

app.get('/', (req,res) => {
  if (!req.session.authenticated) {
      res.render("index_beforeLogin");
  } else {
      res.render("index_afterLogin");
  }
});

app.post('/searchSubmit', async (req,res) => {
  var courseSearch = req.body.courseSearch;

  const searchResult = await userCollection.find({ Title: { $regex: courseSearch, $options: 'i' } }).project({
  _id: 1, Provider: 1, Title: 1, Course_Difficulty: 1, Course_Rating: 1, 
  Course_URL: 1, Organization: 1, Course_Description: 1}).toArray();
  
  res.render("searchList", {searchResult: searchResult});
  // res.redirect('/searchList');
});

app.get('/login', (req,res) => {
  res.render("login");
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
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

const port = process.env.PORT || 8000;

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

let { database } = include('databaseConnection');

const reviewCollection = database.db(mongodb_database).collection('reviews');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));


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

app.get('/', (req, res) => {
  // let username = req.session.username || 'test';
  // res.render("index", {isLoggedIn: isLoggedIn(req), username: username});
  res.render("index", { isLoggedIn: false });
});

app.get('/login', (req, res) => {
  res.render("login");
});



app.get('/reviews', async (req, res) => {
  const reviews = await reviewCollection.find().toArray();

  // Extract the slider values from the reviews
  const sliderValues = reviews.map(review => ({
    courseContentSliderValue: review.CourseContentRating,
    courseStructureSliderValue: review.CourseStructureRating,
    teachingStyleSliderValue: review.TeachingStyleRating,
    studentSupportSliderValue: review.StudentSupportRating
  }));

  const review = reviews.map(review => ({
    review: review.Review
  }))

  console.log(sliderValues);
  console.log(review);
  // console.log(sliderValues[0].courseStructureSliderValue);
  // console.log(sliderValues[0].teachingStyleSliderValue);


  const renderData = {
    req: req,
    sliderValues: sliderValues,
    review: review
  };

  res.render("read-review", renderData);
});


app.get('/reviews/write', async (req, res) => {
  const reviews = await reviewCollection.find().toArray();

  // Extract the slider values from the reviews
  const sliderValues = reviews.map(review => ({
    courseContentSliderValue: review.CourseContentRating,
    courseStructureSliderValue: review.CourseStructureRating,
    teachingStyleSliderValue: review.TeachingStyleRating,
    studentSupportSliderValue: review.StudentSupportRating
  }));

  console.log(sliderValues);

  const renderData = {
    req: req,
    sliderValues: sliderValues
  };

  res.render("write-review", renderData);
});

//write to database
app.post('/submitReview', async (req, res) => {

  const { review,
    courseContentSliderValue,
    courseStructureSliderValue,
    teachingStyleSliderValue,
    studentSupportSliderValue } = req.body;

  console.log(review);

  // Validate the review input
  // const schema = Joi.object({
  //   review: Joi.string().max(256).required().messages({
  //     'string.empty': 'Please enter your review.'
  //   })
  // });

  // const { error } = schema.validate({ review });
  // if (error) {
  //   return res.status(400).send(error.details[0].message);
  // }

  // try {
  await reviewCollection.insertOne({
    Review: review,
    CourseContentRating: courseContentSliderValue,
    CourseStructureRating: courseStructureSliderValue,
    TeachingStyleRating: teachingStyleSliderValue,
    StudentSupportRating: studentSupportSliderValue
  });


  // console.log('Inserted user review and active index');
  res.status(200).send('Review and active index saved successfully');

});



/* === // Pages end === */

app.use(express.static(__dirname + "/public"));

app.get("*", (req, res) => {
  res.status(404);
  res.send("Page not found - 404");
})

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});
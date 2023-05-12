require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require("joi");
const {ObjectId} = require("mongodb");

require("./utils.js");

const {
  sessionValidation,
  loginValidation,
  signupValidation,
  isValidSession,
  isAdmin,
  isLoggedIn
} = require('./middleware');

const saltRounds = 12;

const port = process.env.PORT || 8001;

const app = express();


const expireTime = 12 * 60 * 60 * 1000; //expires after 12 hour  (hours * minutes * seconds * millis)


/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

let { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');
const datasetCollection = database.db(mongodb_database).collection('courses');
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

// TODO:
require("./routes/index.js");

const routePath = "./views/html";

// app.get('/', (req,res) => {
//   // let username = req.session.username || 'test';
//   // res.render("index", {isLoggedIn: isLoggedIn(req), username: username});
//   res.render("index", {isLoggedIn: false});
// });

app.get('/', async(req, res) => {
  if (req.session.authenticated && !req.session.uid) {
    const result = await userCollection.find({ email: req.session.email }).project({ _id: 1 }).toArray();
    req.session.uid = result[0]._id;

  }
  res.render("index", { isLoggedIn: isLoggedIn(req) });
});

let searchResult;

app.post('/searchSubmit', async (req,res) => {
  var courseSearch = req.body.courseSearch;

  searchResult = await datasetCollection.find({ Title: { $regex: courseSearch, $options: 'i' } }).project({
  _id: 1, Provider: 1, Title: 1, Course_Difficulty: 1, Course_Rating: 1, 
  Course_URL: 1, Organization: 1, Course_Description: 1}).toArray();
  
  res.render("searchList2", {searchResult: searchResult});
  // res.redirect('/searchList');


});

//Filters 

app.get('/filterudemy', (req,res) => {
  res.render("filterudemy", {searchResult: searchResult});
});

app.get('/filtercoursera', (req,res) => {
  res.render("filtercoursera", {searchResult: searchResult});
});

app.get('/filterallcourses', (req,res) => {
  res.render("filterallcourses", {searchResult: searchResult});
});





app.get('/login', (req, res) => {
  res.render("login");
});

app.get('/sample', (req, res) => {
  res.render("sample");
});

app.post('/login-submit', loginValidation, async (req,res) => {
  let id = req.body.id;

  const result = await userCollection.find({ id: id }).project({ email: 1, password: 1, username: 1, avatar: 1, _id: 1 }).toArray();
  req.session.uid = result[0]._id;
  req.session.authenticated = true;
  req.session.id = id;
  req.session.email = result[0].email;
  req.session.username = result[0].username;
  req.session.avatar = result[0].avatar;
  req.session.cookie.maxAge = expireTime;

  res.redirect('/');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup-submit', signupValidation, async (req, res) => {
  let id = req.body.id;
  let password = req.body.password;
  let username = req.body.username;
  let email = req.body.email;

  // If inputs are valid, add the member
  let hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({ id: id, username: username, email: email, password: hashedPassword, user_type: 'user' });
  console.log("Inserted user");

  // Create a session
  req.session.authenticated = true;
  req.session.id = id;
  req.session.email = email;
  req.session.username = username;
  req.session.user_type = 'user';
  req.session.avatar = null;
  req.session.cookie.maxAge = expireTime;

  // redirect the user to the / page.
  res.redirect('/');
});

app.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get('/profile', sessionValidation, (req,res) => {
  let { username, email, avatar } = req.session;
  res.render('profile', {username, email, avatar});
});

app.get('/change-password', sessionValidation, async (req,res) => {
  const message = req.query.message || '';
  const avatar = req.session.avatar;
  res.render('change-password', { message, avatar });
});

app.post('/change-password-submit', sessionValidation, async(req,res) => {
  console.log('change password submit');
  /* Check the old password */
  let email = req.session.email;
  let newPassword = req.body.password1;
  let oldPassword = req.body.oldPassword;

  // check if the password is correct
  const result = await userCollection.find({ email: email }).project({ _id: 1, password: 1 }).toArray();
  if (!await bcrypt.compare(oldPassword, result[0].password)) {
    res.redirect("/change-password?message=Old%20password%20is%20incorrect");
    return;
  }

  /* update the new password */
  // If inputs are valid, add the member
  let hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  let uid = result[0]._id;
  await userCollection.updateOne({_id: new ObjectId(uid)}, {$set: {password: hashedPassword}});
  console.log('password is changed')
  res.redirect("/profile");
});

app.get('/edit-profile', sessionValidation, async (req,res) => {
  let email = req.session.email;
  let username = req.session.username;
  let avatar = req.session.avatar;
  res.render("edit-profile", {email, username, avatar});
});
app.post('/edit-profile-submit', sessionValidation, async(req,res) => {
  let username = req.body.username;
  let avatar = req.body.avatar;
  let uid = req.session.uid;

  if (username) {
    await userCollection.updateOne({_id: new ObjectId(uid)}, {$set: {username, avatar}});
    req.session.username= username;
    req.session.avatar = avatar;
  }

  res.redirect("/profile");
});

app.get('/reviews', async (req, res) => {
  const reviews = await reviewCollection.find().toArray();

  const username = req.session.username;
  const reviewSliderPairs= reviews.map(review => {
    const sliderValue = {
      courseContentSliderValue: review.CourseContentRating,
      courseStructureSliderValue: review.CourseStructureRating,
      teachingStyleSliderValue: review.TeachingStyleRating,
      studentSupportSliderValue: review.StudentSupportRating
    };

    
    return {
      review: review,
      sliderValue: sliderValue
    };
  });
  // console.log(reviewSliderPairs);
  // console.log(sliderValue);
  res.render("review", {
    req: req,
    reviewSliderPairs: reviewSliderPairs,
    whichCourse: true,
    username: username
  });

});

// app.get('/reviews/write/:editReview?', async (req, res) => {
//   const username = req.session.username;

//   console.log(username);
//   const reviews = await reviewCollection.find().toArray();
//   const reviewSliderPairs= reviews.map(review => {
//     const sliderValue = {
//       courseContentSliderValue: review.CourseContentRating,
//       courseStructureSliderValue: review.CourseStructureRating,
//       teachingStyleSliderValue: review.TeachingStyleRating,
//       studentSupportSliderValue: review.StudentSupportRating
//     }
//   });

//   // Extract the slider values from the reviews
//   const sliderValues = reviews.map(review => ({
//     courseContentSliderValue: review.CourseContentRating,
//     courseStructureSliderValue: review.CourseStructureRating,
//     teachingStyleSliderValue: review.TeachingStyleRating,
//     studentSupportSliderValue: review.StudentSupportRating
//   }));

//   const editReview = req.params.editReview === 'updateReview';

//   const renderData = {
//     req: req,
//     sliderValues: sliderValues,
//     reviewSliderPairs: reviewSliderPairs,
//     username: username,
//     editReview: editReview
//   };

//   res.render("write-review", renderData);
// });

app.get('/reviews/write/:editReview', async (req, res) => {
  const username = req.session.username;
  const reviewId = req.body._id;
  
  const reviews = await reviewCollection.find().toArray();

  const reviewSliderPairs = reviews.map(review => ({
    username: review.username,
    sliderValue: {
      courseContentSliderValue: review.CourseContentRating,
      courseStructureSliderValue: review.CourseStructureRating,
      teachingStyleSliderValue: review.TeachingStyleRating,
      studentSupportSliderValue: review.StudentSupportRating
    }
  }));

  const sliderValues = reviews.map(review => ({
    courseContentSliderValue: review.CourseContentRating,
    courseStructureSliderValue: review.CourseStructureRating,
    teachingStyleSliderValue: review.TeachingStyleRating,
    studentSupportSliderValue: review.StudentSupportRating
  }));

  const editReview = req.params.editReview === '/updateReview';

  // Find the specific review for the current user
  const specificReview = reviews.find(review => review.username === username);

  const renderData = {
    req: req,
    sliderValues: sliderValues,
    reviewSliderPairs: reviewSliderPairs,
    username: username,
    editReview: editReview,
    specificReview: specificReview
  };

  res.render("write-review", renderData);
});



//write to database
app.post('/submitReview', async (req, res) => {

  const { review,
    courseContentSliderValue,
    courseStructureSliderValue,
    teachingStyleSliderValue,
    studentSupportSliderValue,
    currentDate } = req.body;

  const username = req.session.username; // Replace 'username' with the actual field name
  const email = req.session.email;

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
    StudentSupportRating: studentSupportSliderValue,
    Time: currentDate,
    username: username,
    email: email
  });

  // console.log('Inserted user review and active index');
  // res.status(200).send('Review and active index saved successfully');
  res.redirect('/reviews');
});

app.get('/profileReview', async (req, res) => {
  const reviews = await reviewCollection.find().toArray();

  const reviewSliderPairs= reviews.map(review => {
    const sliderValue = {
      courseContentSliderValue: review.CourseContentRating,
      courseStructureSliderValue: review.CourseStructureRating,
      teachingStyleSliderValue: review.TeachingStyleRating,
      studentSupportSliderValue: review.StudentSupportRating
    };

    
    return {
      review: review,
      sliderValue: sliderValue
    };
  });

  res.render("profile-review", {
    req: req,
    reviewSliderPairs: reviewSliderPairs
  });

});

app.use(express.static(__dirname + "/public"));

app.get("*", (req, res) => {
  res.status(404);
  res.send("Page not found - 404");
})

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});

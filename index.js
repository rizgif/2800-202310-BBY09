require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require("joi");
const { ObjectId, MongoClient } = require("mongodb");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

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

const port = process.env.PORT || 8000;

const app = express();

app.use(bodyParser.json());

const expireTime = 12 * 60 * 60 * 1000; //expires after 12 hour  (hours * minutes * seconds * millis)


/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const email_host = process.env.EMAIL_HOST;
const email_password = process.env.EMAIL_PASSWORD;
/* END secret section */

let { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');
const bookmarkCollection = database.db(mongodb_database).collection('bookmarks');
const courseCollection = database.db(mongodb_database).collection('courses');
const reviewCollection = database.db(mongodb_database).collection('reviews');
const tokenCollection = database.db(mongodb_database).collection('tokens');

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

const routePath = "./views/html";

// app.get('/', (req,res) => {
//   // let username = req.session.username || 'test';
//   // res.render("index", {isLoggedIn: isLoggedIn(req), username: username});
//   res.render("index", {isLoggedIn: false});
// });

app.get('/', async (req, res) => {
  if (req.session.authenticated && !req.session.uid) {
    const result = await userCollection.find({ email: req.session.email }).project({ _id: 1 }).toArray();
    req.session.uid = result[0]._id;

  }
  res.render("index", { isLoggedIn: isLoggedIn(req) });
});

let searchResult;

app.post('/searchSubmit', async (req, res) => {
  var courseSearch = req.body.courseSearch;
  const userId = req.session.uid;

  try {
    searchResult = await courseCollection.find({ Title: { $regex: courseSearch, $options: 'i' } }).project({
      _id: 1, Provider: 1, Title: 1, Course_Difficulty: 1, Course_Rating: 1, 
      Course_URL: 1, Organization: 1, Course_Description: 1}).toArray();

    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    const userBookmarks = user && user.bookmarks && user.bookmarks.length > 0 ? user.bookmarks.map(b => b.courseId.toString()) : [];
    



    res.render("searchList", {searchResult: searchResult, isLoggedIn: isLoggedIn(req), userBookmarks });

  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while searching');
  }
});

app.get('/course-detail', async (req, res) => {
  const courseId = req.query.courseId;
  const reviews = await reviewCollection.find().toArray();
  const username = req.session.username;

  const courseInfo = await courseCollection.findOne({ _id: new ObjectId(courseId) });
  console.log('courseInfo',courseInfo)

  const reviewSliderPairs = reviews.map(review => {
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
  res.render("course-detail", {
    req: req,
    courseId: courseId,
    reviewSliderPairs: reviewSliderPairs,
    // whichCourse: true,
    username: username,
    courseInfo: courseInfo || {},
    isLoggedIn: isLoggedIn(req)
  });
});


app.post('/addBookmark', async (req, res) => {
  const userId = req.session.uid; // user's _id
  const courseId = req.body.courseId; // course's _id

  console.log('Received courseId:', courseId);
  await bookmarkCollection.insertOne({
    userId: userId,
    courseId: courseId
  });

  res.sendStatus(200);
});

app.post('/removeBookmark', async (req, res) => {
  const userId = req.session.uid; // user's _id
  const courseId = req.body.courseId; // course's _id

  const result = await bookmarkCollection.deleteOne({ userId: userId, courseId: courseId });
  if (result.deletedCount === 1) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400); // bookmark not found
  }
  console.log('Deleted bookmark from DB');

});

//Filters 
/* Filter and Sort Course Search Results Section */

// Filter Online Course Providers

app.get('/filter-udemy', (req, res) => {
  res.render("filter-udemy", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});

app.get('/filter-coursera', (req, res) => {
  res.render("filter-coursera", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});

app.get('/filter-allcourses', (req, res) => {
  res.render("filter-allcourses", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});

// Filter Levels

app.get('/filter-beginner', (req, res) => {
  res.render("filter-beginner", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});

app.get('/filter-intermediate', (req, res) => {
  res.render("filter-intermediate", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});

app.get('/filter-advanced', (req, res) => {
  res.render("filter-advanced", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});

app.get('/filter-alllevels', (req, res) => {
  res.render("filter-alllevels", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});

//Sort Course Ratings 

app.get('/sort-hightolow', (req, res) => {
  res.render("sort-hightolow", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});


app.get('/sort-lowtohigh', (req, res) => {
  res.render("sort-lowtohigh", { searchResult: searchResult, isLoggedIn: isLoggedIn(req) });
});

/* End of Filter and Sort Course Search Results Section */



app.get('/login', (req, res) => {
  res.render("login", { isLoggedIn: isLoggedIn(req) });
});

app.get('/sample', (req, res) => {
  res.render("sample");
});

app.post('/login-submit', loginValidation, async (req,res) => {
  let email = req.body.email;

  const result = await userCollection.find({ email: email }).project({ password: 1, username: 1, avatar: 1, _id: 1 }).toArray();
  req.session.uid = result[0]._id;
  req.session.authenticated = true;
  req.session.email = email;
  req.session.username = result[0].username;
  req.session.avatar = result[0].avatar;
  req.session.cookie.maxAge = expireTime;

  res.redirect('/');
});

app.get('/signup', (req, res) => {
  res.render('signup', { isLoggedIn: isLoggedIn(req) });
});

app.post('/signup-submit', signupValidation, async (req, res) => {
  let password = req.body.password;
  let username = req.body.username;
  let email = req.body.email;

  // check if the id already exists
  const emailCheck = await userCollection.find({ email: email }).project({ _id: 1 }).toArray();

  if (emailCheck.length > 0) {
    res.render('signup-submit', { signupFail: true, errorMessage: `This email already exists. \n Please choose a different email.` });
    return;
  }

  // If inputs are valid, add the member
  let hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({ username: username, email: email, password: hashedPassword, user_type: 'user' });
  console.log("Inserted user");

  // Create a session
  req.session.authenticated = true;
  req.session.email = email;
  req.session.username = username;
  req.session.user_type = 'user';
  req.session.avatar = null;
  req.session.cookie.maxAge = expireTime;

  // redirect the user to the / page.
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get('/find-password', (req, res) => {
  res.render('find-password');
});
app.post('/find-password', async (req, res) => {
  const email = req.body.email;

  try {
    const user = await userCollection.findOne({ email: email });

    if (user) {
      const token = new ObjectId().toString();
      const expireTime = new Date(Date.now() + 3600000); // Token expires in 1 hour
      await tokenCollection.insertOne({ token: token, uid: user._id, expireAt: expireTime });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email_host,
          pass: email_password
        }
      });

      const mailOptions = {
        from: email_host,
        to: email,
        subject: 'Password Reset',
        text: `Hi ${user.username},\n\nYou requested a password reset for your account.
        \n\nPlease click on the following link within the next hour to reset your password:
        \n\nhttps://coursla.cyclic.app/reset-password/${token}
        \n\nIf you did not request this reset, please ignore this email.
        \n\nThank you,
        \nThe Coursla App Team`

      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.render('find-password', { message: 'Failed to send email. Please try again later.' });
        } else {
          console.log(info);
          res.redirect("/login?successMessage=Please check your email");
          // res.render('find-password', { message: 'An email has been sent with further instructions.' });
        }
      });
    } else {
      res.render('find-password', { message: 'No user found with that email address.' });
    }
  } catch (error) {
    console.log(error);
    res.render('find-password', { message: 'Failed to find user. Please try again later.' });
  }
});

app.get('/reset-password/:token', async (req, res) => {
  const token = req.params.token;
  try {
    const tokenData = await tokenCollection.findOne({ token: token });

    if (tokenData && tokenData.expireAt > new Date()) {
      const user = await userCollection.findOne({ _id: tokenData.uid });
      console.log(user)
      res.render('reset-password', { token: token, username: user.username, avatar: user.avatar });
    } else {
      res.render('error', { message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'An error occurred' });
  }
});

app.post('/reset-password-submit', async (req, res) => {
  console.log('change password submit');
  /* Check the old password */
  let token = req.body.token;
  let newPassword = req.body.password1;

  try {
    const tokenData = await tokenCollection.findOne({ token: token });
    console.log('tokenData', token, tokenData)
    const user = await userCollection.findOne({ _id: tokenData.uid });
    console.log('user', user)

    /* update the new password */
    // If inputs are valid, add the member
    let hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    let uid = user._id;
    await userCollection.updateOne({ _id: new ObjectId(uid) }, { $set: { password: hashedPassword } });
    console.log('password is changed')
    res.redirect("/profile");

  } catch (error) {
    console.error(error);
    res.render('error', { message: 'An error occurred' });
  }

});

app.get('/profile', sessionValidation, (req,res) => {
  let { username, email, avatar } = req.session;
  res.render('profile', {username, email, avatar, isLoggedIn: isLoggedIn(req) });
});

app.get('/change-password', sessionValidation, async (req, res) => {
  const message = req.query.message || '';
  const avatar = req.session.avatar;
  res.render('change-password', { message, avatar, isLoggedIn: isLoggedIn(req) });
});

app.post('/change-password-submit', sessionValidation, async (req, res) => {
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
  await userCollection.updateOne({ _id: new ObjectId(uid) }, { $set: { password: hashedPassword } });
  console.log('password is changed')
  res.redirect("/profile");
});

app.get('/edit-profile', sessionValidation, async (req, res) => {
  let email = req.session.email;
  let username = req.session.username;
  let avatar = req.session.avatar;
  res.render("edit-profile", {email, username, avatar, isLoggedIn: isLoggedIn(req)});
});

app.post('/edit-profile-submit', sessionValidation, async (req, res) => {
  let username = req.body.username;
  let avatar = req.body.avatar;
  let email = req.body.email;
  let uid = req.session.uid;

  if (username) {
    await userCollection.updateOne({ _id: new ObjectId(uid) }, { $set: { email, username, avatar } });
    req.session.username = username;
    req.session.avatar = avatar;
    req.session.email = email;
  }

  res.redirect("/profile");
});


//show the list of review cards
// app.get('/reviews', async (req, res) => {
//   const reviews = await reviewCollection.find().toArray();

//   const username = req.session.username;

//   const reviewSliderPairs = reviews.map(review => {
//     const sliderValue = {
//       courseContentSliderValue: review.CourseContentRating,
//       courseStructureSliderValue: review.CourseStructureRating,
//       teachingStyleSliderValue: review.TeachingStyleRating,
//       studentSupportSliderValue: review.StudentSupportRating
//     };

//     return {
//       review: review,
//       sliderValue: sliderValue
//     };
//   });

//   // console.log(reviewSliderPairs);
//   // console.log(sliderValue);
//   res.render("review", {
//     req: req,
//     reviewSliderPairs: reviewSliderPairs,
//     // whichCourse: true,
//     username: username
//   });

// });


// write a review on a specific course
app.get('/reviews/write/:courseid', async (req, res) => {
  const username = req.session.username;
  // const reviewId = req.body._id;
  const courseId = req.params.courseid.replace(':', '');;
  console.log("courseid here (2)", courseId)

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

  // const editReview = req.params.editReview === '/updateReview';

  // Find the specific review for the current user
  const specificReview = reviews.find(review => review.username === username);

  const renderData = {
    req: req,
    sliderValues: sliderValues,
    reviewSliderPairs: reviewSliderPairs,
    username: username,
    courseId: courseId,
    editReview: false,
    specificReview: specificReview
  };

  res.render("write-review", renderData);
});


// app.get('/reviews/write/:editReview', async (req, res) => {
//   const username = req.session.username;
//   const reviewId = req.body._id;

//   const reviews = await reviewCollection.find().toArray();

//   const reviewSliderPairs = reviews.map(review => ({
//     username: review.username,
//     sliderValue: {
//       courseContentSliderValue: review.CourseContentRating,
//       courseStructureSliderValue: review.CourseStructureRating,
//       teachingStyleSliderValue: review.TeachingStyleRating,
//       studentSupportSliderValue: review.StudentSupportRating
//     }
//   }));

//   const sliderValues = reviews.map(review => ({
//     courseContentSliderValue: review.CourseContentRating,
//     courseStructureSliderValue: review.CourseStructureRating,
//     teachingStyleSliderValue: review.TeachingStyleRating,
//     studentSupportSliderValue: review.StudentSupportRating
//   }));

//   const editReview = req.params.editReview === '/updateReview';

//   // Find the specific review for the current user
//   const specificReview = reviews.find(review => review.username === username);

//   const renderData = {
//     req: req,
//     sliderValues: sliderValues,
//     reviewSliderPairs: reviewSliderPairs,
//     username: username,
//     editReview: editReview,
//     specificReview: specificReview
//   };

//   res.render("write-review", renderData);
// });


//change the review written for a specific course
app.get('/reviews/write/updateReview/:id', async (req, res) => {
  const username = req.session.username;
  const reviewId = req.params.id; // Get the review ID from the URL parameter
  const reviews = await reviewCollection.find().toArray();

  const reviewSliderPairs = reviews.map(review => ({
    username: review.username,
    // review: review.Review,
    sliderValue: {
      courseContentSliderValue: review.CourseContentRating,
      courseStructureSliderValue: review.CourseStructureRating,
      teachingStyleSliderValue: review.TeachingStyleRating,
      studentSupportSliderValue: review.StudentSupportRating
    },
    courseId: review.CourseID

  }));

  // Find the specific review for the current user based on the review ID
  const specificReview = reviews.find(review => review._id.toString() === reviewId);
  console.log("specific", specificReview)
  const courseID = specificReview.CourseID;
 
  const renderData = {
    req: req,
    // sliderValues: sliderValues,
    reviewSliderPairs: reviewSliderPairs,
    username: username,
    editReview: true,
    specificReview: specificReview,
    reviewId: reviewId,
    courseId: courseID

  };

  res.render("write-review", renderData);
});



//delete the review from database
app.delete('/reviews/deleteReview/:id', async (req, res) => {
  const reviewId = req.params.id;

  // Delete the review from the database based on the review ID
  await reviewCollection.deleteOne({ _id: new ObjectId(reviewId) });

  res.redirect('/reviews');
});


//write to database
app.post('/submitReview/:id', async (req, res) => {
  // const courseId = req.params.id;
  const courseId = req.params.id;
  console.log("okay", courseId);
  const reviewId = req.body.reviewId;
  const { review,
    courseContentSliderValue,
    courseStructureSliderValue,
    teachingStyleSliderValue,
    studentSupportSliderValue,
    currentDate } = req.body;

  const username = req.session.username; // Replace 'username' with the actual field name
  const email = req.session.email;

  console.log("new review", req.body);

  if (reviewId) {
    console.log('Update user review and active index');
    // Update an existing review
    await reviewCollection.updateOne(
      { _id: new ObjectId(reviewId) }, // Specify the query criteria
      {
        $set: {
          Review: review,
          CourseContentRating: courseContentSliderValue,
          CourseStructureRating: courseStructureSliderValue,
          TeachingStyleRating: teachingStyleSliderValue,
          StudentSupportRating: studentSupportSliderValue,
          Time: currentDate,
          CourseID: courseId
        }
      }
    );
    console.log('Review updated successfully');
  }

  else {

    await reviewCollection.insertOne({
      Review: review,
      CourseContentRating: courseContentSliderValue,
      CourseStructureRating: courseStructureSliderValue,
      TeachingStyleRating: teachingStyleSliderValue,
      StudentSupportRating: studentSupportSliderValue,
      Time: currentDate,
      username: username,
      email: email,
      CourseID: courseId
    });
  }

  res.redirect('/courseDetails?courseid=' + courseId);
});

app.get('/profileReview', async (req, res) => {
  const reviews = await reviewCollection.find().toArray();

  const reviewSliderPairs = reviews.map(review => {
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
  res.render("404", { isLoggedIn: isLoggedIn(req) });
})

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});

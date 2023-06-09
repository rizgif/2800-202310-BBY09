require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const {ObjectId, MongoClient} = require("mongodb");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

require("./utils.js");

const {
  sessionValidation,
  loginValidation,
  signupValidation,
  isLoggedIn,
} = require('./middleware');
const {editProfileValidation} = require("./middleware/edit-profile");

const saltRounds = 12;

const port = process.env.PORT || 8000;

const app = express();

app.use(bodyParser.json());

const expireTime = 12 * 60 * 60 * 1000; //expires after 12 hour  (hours * minutes * seconds * millis)

// save firebase config to use firebase image storage
const {
  FIREBASE_apiKey,
  FIREBASE_authDomain,
  FIREBASE_projectId,
  FIREBASE_storageBucket,
  FIREBASE_messagingSenderId,
  FIREBASE_appId,
  FIREBASE_measurementId
} = process.env;

const firebaseConfig = {
  apiKey: FIREBASE_apiKey,
  authDomain: FIREBASE_authDomain,
  projectId: FIREBASE_projectId,
  storageBucket: FIREBASE_storageBucket,
  messagingSenderId: FIREBASE_messagingSenderId,
  appId: FIREBASE_appId,
  measurementId: FIREBASE_measurementId
};


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

let {database} = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');
const bookmarkCollection = database.db(mongodb_database).collection('bookmarks');
const courseCollection = database.db(mongodb_database).collection('courses');
const reviewCollection = database.db(mongodb_database).collection('reviews');
const tokenCollection = database.db(mongodb_database).collection('tokens');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));


var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
  crypto: {
    secret: mongodb_session_secret
  }
});

app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store
    saveUninitialized: false,
    resave: true
  }
));


/**
 * Handle the root route and render the index page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */

app.get('/', async (req, res) => {
  // Logic for handling the root route and rendering the index page
  if (req.session.authenticated && !req.session.uid) {
    const result = await userCollection.find({email: req.session.email}).project({_id: 1}).toArray();
    req.session.uid = result[0]._id;

  }
  res.render("index", {isLoggedIn: isLoggedIn(req), username: req.session.username});
});

/**
 * Handle the search-results route and display search results based on query parameters.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/search-results', async (req, res) => {
  // Logic for handling the search-results route and displaying search results
  const userId = req.session.uid;
  const userBookmarks = await bookmarkCollection.find({userId: userId}).toArray();

  const courseSearch = req.query.courseSearch;
  const provider = req.query.provider?.toLowerCase();
  const level = req.query.level?.toLowerCase();
  const rating = req.query.rating?.toLowerCase();
  const sort = req.query.sort;

  const condition = {};

  if (courseSearch) {
    condition.Title = {$regex: `${courseSearch}`, $options: 'i'};
  }
  if (provider) condition.Provider = {$regex: `${provider}`, $options: 'i'};
  if (level) condition.Course_Difficulty = {$regex: `${level}`, $options: 'i'};
  if (rating) condition.Course_Rating = {$regex: `${rating}`, $options: 'i'};

  const sortOptions = {};

  sortOptions.Course_Rating = -1; // Default sort by Course_Rating in descending order

  if (sort === 'low to high') {
    sortOptions.Course_Rating = 1; // Sort by Course_Rating in ascending order
  }

  try {
    if (Object.keys(condition).length === 0) {
      // No query parameters provided, fetch all objects
      searchResult = await courseCollection.find({}).toArray();
    } else {
      // Query parameters provided, filter the search
      searchResult = await courseCollection.find(condition).toArray();
    }

    const searchResultCount = searchResult.length;


    let calibratedValues = [];
    let nonCalibratedValues = [];

    searchResult.forEach((course) => {
      if (course.Course_Rating !== "Not Calibrated") {
        nonCalibratedValues.push(course);
      } else {
        calibratedValues.push(course);
      }
    });

    searchResult = nonCalibratedValues.concat(calibratedValues);
    // console.log(nonCalibratedValues);

    // Sort the search result based on Course_Rating
    searchResult.sort((a, b) => {
      if (sort === 'low to high') {
        return a.Course_Rating - b.Course_Rating;
      } else {
        return b.Course_Rating - a.Course_Rating;
      }
    });

    res.render("search-results", {
      searchResult: searchResult,
      searchResultCount: searchResultCount,
      isLoggedIn: isLoggedIn(req),
      userBookmarks,
      courseSearch,
      provider,
      level,
      rating,
      sort,
      username: req.session.username
    });
  } catch (error) {
    console.error(error);
    res.render('error', {
      message: `An error occurred while searching: ${error.message}`,
      username: req.session.username
    });
  }

});

/**
 * Handle the course-details route and render the course details page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/course-details', async (req, res) => {
  // Logic for handling the course-details route and rendering the course details page
  const courseId = req.query.courseId;
  const reviews = await reviewCollection.find().toArray();
  const username = req.session.username;
  const userId = req.session.uid;

  const userBookmarks = await bookmarkCollection.find({userId: userId}).toArray();
  const email = req.session.email;
  const selecteduser = await userCollection.find({email: email}).toArray();

  const courseInfo = await courseCollection.findOne({_id: new ObjectId(courseId)});

  console.log(selecteduser)
  let reviewSliderPairs = await Promise.all(
    reviews
      .filter(review => review.CourseID === courseId)
      .map(async review => {
        const sliderValue = {
          courseContentSliderValue: review.CourseContentRating,
          courseStructureSliderValue: review.CourseStructureRating,
          teachingStyleSliderValue: review.TeachingStyleRating,
          studentSupportSliderValue: review.StudentSupportRating
        };

        const user = await userCollection.findOne({email: review.email});
        const avatar = user ? user.avatar : null;

        return {
          review: review,
          sliderValue: sliderValue,
          user: user,
          avatar: avatar,
          Badges: user?.Badges || ""
        };

      })
  );

  const totalvote = reviewSliderPairs.length;
  const numCategory = 4;

  const overallCategorySums = {
    courseContent: 0,
    courseStructure: 0,
    teachingStyle: 0,
    studentSupport: 0
  };

  reviewSliderPairs.forEach(pair => {
    overallCategorySums.courseContent += parseInt(pair.sliderValue.courseContentSliderValue);
    overallCategorySums.courseStructure += parseInt(pair.sliderValue.courseStructureSliderValue);
    overallCategorySums.teachingStyle += parseInt(pair.sliderValue.teachingStyleSliderValue);
    overallCategorySums.studentSupport += parseInt(pair.sliderValue.studentSupportSliderValue);
  });

  const CourslaRating = (Object.values(overallCategorySums).reduce((sum, value) => sum + value, 0) / (numCategory * totalvote)).toFixed(1);

  async function updateCourse(courseId, overallCategorySums, totalvote) {
    // Update the course document with the specified courseId
    await courseCollection.updateOne(
      {_id: new ObjectId(courseId)},
      {
        $set: {
          OverallCategorySums: overallCategorySums,
          Totalvote: totalvote,
          CourslaRating: CourslaRating
        }
      }
    );
  }

  // console.log(reviewSliderPairs)
  updateCourse(courseId, overallCategorySums, reviewSliderPairs.length);

  res.render("course-detail", {
    req: req,
    courseId: courseId,
    reviewSliderPairs: reviewSliderPairs,
    username: username,
    courseInfo: courseInfo || {},
    isLoggedIn: isLoggedIn(req),
    overallCategorySums: overallCategorySums,
    Totalvote: totalvote,
    CourslaRating: CourslaRating,
    userBookmarks,
    easterEgg: false,
    myReviewPage: false,
    email: email,
    selecteduser: selecteduser
  });
});

/**
 * Handle the addBookmark route and add a bookmark for the user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/addBookmark', async (req, res) => {
  // Logic for handling the addBookmark route and adding a bookmark for the user
  const userId = req.session.uid; // user's _id
  const courseId = req.body.courseId; // course's _id

  await bookmarkCollection.insertOne({
    userId: userId,
    courseId: courseId
  });

  res.sendStatus(200);
});

/**
 * Handle the removeBookmark route and remove a bookmark for the user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/removeBookmark', async (req, res) => {
  // Logic for handling the removeBookmark route and removing a bookmark for the user
  const userId = req.session.uid; // user's _id
  const courseId = req.body.courseId; // course's _id

  const bookmark = await bookmarkCollection.findOne({userId: userId, courseId: courseId});
  if (bookmark) {
    const result = await bookmarkCollection.deleteOne({_id: bookmark._id});
    if (result.deletedCount === 1) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500); // failed to delete bookmark
    }
  } else {
    res.sendStatus(404); // bookmark not found
  }

});

/**
 * Handle the bookmarks route and render the bookmarks page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/bookmarks', async (req, res) => {
  // Logic for handling the bookmarks route and rendering the bookmarks page
  if (!req.session.authenticated) {
    res.redirect('/');
  } else {
    try {
      const userId = req.session.uid;

      const bookmarkedCourses = await database.db(mongodb_database).collection('bookmarks').aggregate([
        {
          $match: {userId: userId} // Match the bookmarks for the current user
        },
        {
          $lookup: {
            from: 'courses',
            let: {courseId: {$toObjectId: '$courseId'}},
            pipeline: [
              {$match: {$expr: {$eq: ['$_id', '$$courseId']}}},
              {
                $project: {
                  _id: 1,
                  Title: 1,
                  Provider: 1,
                  Course_Rating: 1,
                  CourslaRating: 1,
                  Course_Difficulty: 1,
                  imageNum: 1
                }
              }
            ],
            as: 'courseDetails'
          }
        },
        {
          $unwind: '$courseDetails'
        }
      ]).toArray();

      const userBookmarks = await bookmarkCollection.find({userId: userId}).toArray();

      res.render('bookmarks', {
        bookmarkedCourses,
        isLoggedIn: isLoggedIn(req),
        userBookmarks,
        username: req.session.username
      });
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

});

/**
 * Handle the login route and render the login page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/login', (req, res) => {
  // Logic for handling the login route and rendering the login page
  res.render("login", {isLoggedIn: isLoggedIn(req)});
});
app.get('/error', (req, res) => {
  res.render("login", {
    isLoggedIn: isLoggedIn(req),
    message: req.query.message || req.body.message,
    username: req.session.username
  });
});

app.get('/sample', (req, res) => {
  res.render("sample");
});

/**
 * Handle the login-submit route and process the login form submission.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/login-submit', loginValidation, async (req, res) => {
  // Logic for handling the login-submit route and processing the login form submission
  let email = req.body.email;

  const result = await userCollection.find({email: email}).project({
    password: 1,
    username: 1,
    avatar: 1,
    _id: 1
  }).toArray();
  req.session.uid = result[0]._id;
  req.session.authenticated = true;
  req.session.email = email;
  req.session.username = result[0].username;
  req.session.avatar = result[0].avatar;
  req.session.cookie.maxAge = expireTime;


  const courseId = req.session.courseId;
  if (courseId) {
    return res.redirect('/course-details?courseId=' + courseId);
  }
  res.redirect('/');
});


/**
 * Handle the signup route and render the signup page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/signup', (req, res) => {
  // Logic for handling the signup route and rendering the signup page
  res.render('signup', {isLoggedIn: isLoggedIn(req)});
});

/**
 * Handle the signup-submit route and process the signup form submission.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/signup-submit', signupValidation, async (req, res) => {
  // Logic for handling the signup-submit route and processing the signup form submission
  let password = req.body.password;
  let username = req.body.username?.trim();
  let email = req.body.email?.trim();

  if (isLoggedIn(req)) {
    res.redirect('/');
    return;
  }

  // check if the id already exists
  const emailCheck = await userCollection.find({email: email}).project({_id: 1}).toArray();

  if (emailCheck.length > 0) {
    res.render('signup-submit', {
      signupFail: true,
      errorMessage: `This email already exists. \n Please choose a different email.`
    });
    return;
  }

  // If inputs are valid, add the member
  let hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({username: username, email: email, password: hashedPassword, user_type: 'user'});
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

/**
 * Handle the logout route and log out the user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/logout', (req, res) => {
  // Logic for handling the logout route and logging out the user
  req.session.destroy();
  res.redirect("/");
});


/**
 * Render the find-password page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/find-password', (req, res) => {
  res.render('find-password');
});

/**
 * Process the find password form submission and send a password reset email if the user is found.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/find-password', async (req, res) => {
  const email = req.body.email;

  try {
    const user = await userCollection.findOne({email: email});
    // Generate and store a password reset token
    if (user) {
      const token = new ObjectId().toString();
      const expireTime = new Date(Date.now() + 3600000); // Token expires in 1 hour
      await tokenCollection.insertOne({token: token, uid: user._id, expireAt: expireTime});
      // Send password reset email to the user
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
        subject: '[Coursla] Password Reset',
        html: `Hi, <b>${user.username}</b>,
        <br><br>You requested a password reset for your account.
        <br><br>Please click on the following link within the next hour to reset your password:
        <br>https://coursla.cyclic.app/reset-password/${token}
        <br><br>If you did not request this reset, please ignore this email.
        <br><br>Thank you,
        <br><br>The Coursla App Team
        <br><br>
        <img style="width:100px;" src="cid:${token}"/>
        `,
        attachments: [{
          filename: 'coursla_main.png',
          path: './public/image/coursla_main.png',
          cid: token //same cid value as in the html img src
        }]
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.render('find-password', {
            message: 'Failed to send email. Please try again later.',
            username: user.username
          });
        } else {
          console.log(info);
          res.redirect("/login?successMessage=Please check your email");
          // res.render('find-password', { message: 'An email has been sent with further instructions.' });
        }
      });
    } else {
      res.render('find-password', {message: 'No user found with that email address.', username: user.username});
    }
  } catch (error) {
    console.log(error);
    res.render('find-password', {message: 'Failed to find user. Please try again later.', username: user.username});
  }
});

/**
 * Render the reset password page for a specific token.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/reset-password/:token', async (req, res) => {
  const token = req.params.token;
  try {
    const tokenData = await tokenCollection.findOne({token: token});

    if (tokenData && tokenData.expireAt > new Date()) {
      const user = await userCollection.findOne({_id: tokenData.uid});
      console.log(user)
      res.render('reset-password', {token: token, username: user.username, avatar: user.avatar});
    } else {
      res.render('error', {message: 'Invalid or expired token', username: req.session.username});
    }
  } catch (error) {
    console.error(error);
    res.render('error', {message: 'An error occurred', username: req.session.username});
  }
});

/**
 * Process the password reset form submission and update the user's password.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/reset-password-submit', async (req, res) => {
  console.log('change password submit');
  /* Check the old password */
  let token = req.body.token;
  let newPassword = req.body.password1;

  try {
    const tokenData = await tokenCollection.findOne({token: token});
    console.log('tokenData', token, tokenData)
    const user = await userCollection.findOne({_id: tokenData.uid});
    console.log('user', user)

    /* update the new password */
    // If inputs are valid, add the member
    let hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    let uid = user._id;
    await userCollection.updateOne({_id: new ObjectId(uid)}, {$set: {password: hashedPassword}});
    console.log('password is changed')
    res.redirect("/profile");

  } catch (error) {
    console.error(error);
    res.render('error', {message: 'An error occurred', username: req.session.username, isLoggedIn: isLoggedIn(req)});
  }

});

/**
 * Render the profile page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/profile', sessionValidation, (req, res) => {
  let {username, email, avatar} = req.session;
  res.render('profile', {username, email, avatar, isLoggedIn: isLoggedIn(req)});
});

/**
 * Render the change password page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/change-password', sessionValidation, async (req, res) => {
  const message = req.query.message || '';
  const avatar = req.session.avatar;
  res.render('change-password', {message, avatar, isLoggedIn: isLoggedIn(req), username: req.session.username});
});

/**
 * Process the change password form submission and update the user's password.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/change-password-submit', sessionValidation, async (req, res) => {
  console.log('change password submit');
  /* Check the old password */
  let email = req.session.email;
  let newPassword = req.body.password1;
  let oldPassword = req.body.oldPassword;

  // check if the password is correct
  const result = await userCollection.find({email: email}).project({_id: 1, password: 1}).toArray();
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

/**
 * Render the edit profile page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/edit-profile', sessionValidation, async (req, res) => {
  let email = req.session.email;
  let username = req.session.username;
  let avatar = req.session.avatar;
  let uid = req.session.uid;
  res.render("edit-profile", {
    email,
    username,
    avatar,
    firebaseConfig,
    uid: new ObjectId(uid).toString(),
    isLoggedIn: isLoggedIn(req)
  });
});

/**
 * Process the edit profile form submission and update the user's profile information.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/edit-profile-submit', editProfileValidation, async (req, res) => {
  let username = req.body.username?.trim();
  let avatar = req.body.avatar;
  let uid = req.session.uid;

  if (!isLoggedIn(req)) {
    res.redirect("/login");
    return;
  }

  await userCollection.updateOne({_id: new ObjectId(uid)}, {$set: {username, avatar}});
  req.session.username = username;
  req.session.avatar = avatar;

  res.redirect("/profile");
});

/**
 * Render the write review page for a specific course.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/reviews/write/:courseid', async (req, res) => {
  const username = req.session.username;
  const avatar = req.session.avatar;
  const courseId = req.params.courseid.replace(':', '');
  const email = req.session.email;

  if (username == null) {

    req.session.courseId = courseId;
    return res.redirect("/login");
  }

  const reviews = await reviewCollection.find().toArray();

  const reviewSliderPairs = reviews.map(review => ({
    username: review.username,
    email: review.email,
    sliderValue: {
      courseContentSliderValue: review.CourseContentRating,
      courseStructureSliderValue: review.CourseStructureRating,
      teachingStyleSliderValue: review.TeachingStyleRating,
      studentSupportSliderValue: review.StudentSupportRating
    },
  }));

  const sliderValues = reviews.map(review => ({
    courseContentSliderValue: review.CourseContentRating,
    courseStructureSliderValue: review.CourseStructureRating,
    teachingStyleSliderValue: review.TeachingStyleRating,
    studentSupportSliderValue: review.StudentSupportRating
  }));

  // Find the specific review for the current user
  const specificReview = reviews.find(review => review.email === email && review.CourseID === courseId);
  const hasReview = Boolean(specificReview);

  if (specificReview) {

    const reviewId = specificReview._id.toString();
    const renderData = {
      req: req,
      sliderValues: sliderValues,
      reviewSliderPairs: reviewSliderPairs,
      username: username,
      courseId: courseId,
      editReview: true,
      specificReview: specificReview,
      hasReview: hasReview,
      reviewId: reviewId,
      avatar: avatar,
      email: email
    }
    res.render("write-review", renderData);

  } else {

    const renderData = {
      req: req,
      sliderValues: sliderValues,
      reviewSliderPairs: reviewSliderPairs,
      username: username,
      avatar: avatar,
      courseId: courseId,
      editReview: false,
      hasReview: hasReview,
      email: email

    };
    res.render("write-review", renderData);
  }

});


/**
 * Render the write review page for updating a specific review.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/reviews/write/updateReview/:id', async (req, res) => {
  const username = req.session.username;
  const avatar = req.session.avatar;
  const reviewId = req.params.id; // Get the review ID from the URL parameter
  const reviews = await reviewCollection.find().toArray();
  const myReviewPage = req.query.myReviewPage;

  const reviewSliderPairs = reviews.map(review => ({
    username: review.username,
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
  const courseID = specificReview.CourseID;

  const renderData = {
    req: req,
    reviewSliderPairs: reviewSliderPairs,
    username: username,
    editReview: true,
    specificReview: specificReview,
    reviewId: reviewId,
    courseId: courseID,
    hasReview: false,
    avatar: avatar,
    myReviewPage: myReviewPage
  };

  res.render("write-review", renderData);
});


/**
 * Delete a review from the database.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/reviews/deleteReview/:id', async (req, res) => {
  const courseId = req.params.id;
  const email = req.query.useremail || req.session.email;
  const uid = req.session.uid;

  console.log("deleted review is for this course: ", courseId);
  // Get the review ID before deleting the review
  const deletedReview = await reviewCollection.findOne({CourseID: courseId, email: email});

  if (!deletedReview || deletedReview?.length < 1) {
    return false;
  }

  const reviewCount = await reviewCollection.countDocuments({
    email: email
  });

  if (deletedReview) {
    const deletedReviewId = deletedReview._id.toString();
    await reviewCollection.deleteOne({CourseID: courseId, email: email});

    if (reviewCount <= 5) {
      await userCollection.updateOne(
        {_id: new ObjectId(uid)},
        {$set: {Badges: " "}}
      );
    }

    await userCollection.updateOne(
      {ReviewID: deletedReviewId},
      {$pull: {ReviewID: deletedReviewId}}
    );

    res.redirect(`/course-details?courseId=${courseId}`);
  } else {
    res.status(404).send('Review not found');
  }
});


/**
 * Write a review to the database.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.post('/submitReview/:id', async (req, res) => {
  const uid = req.session.uid;
  const username = req.session.username; // Replace 'username' with the actual field name
  const email = req.session.email;
  const courseId = req.params.id;
  const Existingreviews = await reviewCollection.findOne({CourseID: courseId, email: email});

  const myReviewPage = req.query.myReviewPage;

  console.log('submit', myReviewPage)

  const {
    review,
    courseContentSliderValue,
    courseStructureSliderValue,
    teachingStyleSliderValue,
    studentSupportSliderValue,
    currentDate
  } = req.body;

  // if there is a exisiting review, direct user to edit their existing review
  if (Existingreviews) {
    console.log('Update user review and active index');
    // Update an existing review
    await reviewCollection.updateOne(
      {_id: new ObjectId(Existingreviews._id.toString())}, // Specify the query criteria
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
  } else {
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

    const insertedReview = await reviewCollection.findOne({
      Review: review,
      email: email
    });

    const reviewCount = await reviewCollection.countDocuments({
      email: email
    });

    if (reviewCount > 1) {

      await userCollection.updateOne(
        {email: email}, // Specify the query criteria
        {
          $push: {
            ReviewID: insertedReview._id.toString()
          }
        }
      );
    } else {

      await userCollection.updateOne(
        {email: email}, // Specify the query criteria
        {
          $set: {
            ReviewID: [insertedReview._id.toString()]
          }
        }
      );
    }

    // Easter-egg: If the user has written 5 reviews, give them a badge
    if (reviewCount === 5) {
      console.log('User has written 5 reviews, give them a badge');

      const response = await userCollection.updateOne(
        {_id: new ObjectId(uid)},
        {$set: {Badges: "Reviewer"}}
      );

      res.redirect('/course-details?easterEgg=true&courseId=' + courseId);
      return false;
    } else if (reviewCount > 5) {
      // to make sure they have badge
      await userCollection.updateOne(
        {_id: new ObjectId(uid)},
        {$set: {Badges: "Reviewer"}}
      )
    } else {
      // to prevent user remove review and get badge
      await userCollection.updateOne(
        {_id: new ObjectId(uid)},
        {$set: {Badges: " "}}
      );
    }

  }

  if (myReviewPage) {
    res.redirect('/my-reviews');
  } else {
    res.redirect('/course-details?courseId=' + courseId);
  }
});

/**
 * Render the user's review page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get('/my-reviews', async (req, res) => {
  const email = req.session.email;
  const reviews = await reviewCollection.find({email: email}).toArray();
  const username = req.session.username;
  let courseId;
  const reviewGroups = {};

  // Group reviews by courseId
  reviews.forEach(review => {
    courseId = review.CourseID;
    if (!reviewGroups[courseId]) {
      reviewGroups[courseId] = [];
    }
    reviewGroups[courseId].push(review);
  });

  const reviewSliderPairs = [];
  // Retrieve course information for each group
  for (const courseId in reviewGroups) {
    const courseInfo = await courseCollection.findOne({_id: new ObjectId(courseId)});

    const groupReviews = reviewGroups[courseId];
    const groupSliderPairs = await Promise.all(
      groupReviews.map(async review => {
        const sliderValue = {
          courseContentSliderValue: review.CourseContentRating,
          courseStructureSliderValue: review.CourseStructureRating,
          teachingStyleSliderValue: review.TeachingStyleRating,
          studentSupportSliderValue: review.StudentSupportRating
        };

        const user = await userCollection.findOne({email: review.email});
        const avatar = user ? user.avatar : null;

        return {
          review: review,
          sliderValue: sliderValue,
          avatar: avatar,
          user: user,
          courseId: courseId, // Pass the courseId to the template
          courseImageNum: courseInfo.imageNum, // Get the imageNum from courseInfo
          courseTitle: courseInfo.Title // Get the title from courseInfo
        };
      })
    );

    reviewSliderPairs.push(...groupSliderPairs);
  }

  const totalvote = reviewSliderPairs.length;
  const numCategory = 4;

  const overallCategorySums = {
    courseContent: 0,
    courseStructure: 0,
    teachingStyle: 0,
    studentSupport: 0
  };

  reviewSliderPairs.forEach(pair => {
    overallCategorySums.courseContent += parseInt(pair.sliderValue.courseContentSliderValue);
    overallCategorySums.courseStructure += parseInt(pair.sliderValue.courseStructureSliderValue);
    overallCategorySums.teachingStyle += parseInt(pair.sliderValue.teachingStyleSliderValue);
    overallCategorySums.studentSupport += parseInt(pair.sliderValue.studentSupportSliderValue);
  });

  const CourslaRating = (Object.values(overallCategorySums).reduce((sum, value) => sum + value, 0) / (numCategory * totalvote)).toFixed(1);

  async function updateCourse(courseId, overallCategorySums, totalvote) {
    // Update the course document with the specified courseId
    await courseCollection.updateOne(
      {_id: new ObjectId(courseId)},
      {
        $set: {
          OverallCategorySums: overallCategorySums,
          Totalvote: totalvote,
          CourslaRating: CourslaRating
        }
      }
    );
  }

  updateCourse(courseId, overallCategorySums, reviewSliderPairs.length);

  res.render("my-review", {
    req: req,
    reviewSliderPairs: reviewSliderPairs,
    username: username,
    isLoggedIn: isLoggedIn(req),
    overallCategorySums: overallCategorySums,
    Totalvote: totalvote,
    myReviewPage: true,
    email: email
  });
});

/**
 * Serve static files from the "public" directory.
 */
app.use(express.static(__dirname + "/public"));

/**
 * Handle the wildcard route for all unmatched routes.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void}
 */
app.get("*", (req, res) => {
  res.status(404);
  res.render("404", {isLoggedIn: isLoggedIn(req), username: req.session.username});
})

/**
 * Start the Express server and listen on the specified port.
 * @param {number} port - The port number on which to listen.
 * @returns {void}
 */
app.listen(port, () => {
  console.log("Node application listening on port " + port);
});

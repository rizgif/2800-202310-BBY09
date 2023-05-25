<h1 style>Coursla 🌿</h1>

Our project, BBY-09, is developing online course integration platforms to assist students and working professionals struggling to find suitable online courses with key features such as filtering and sorting.

During our development process, we used many technologies that include the following: 
<ul>
    <li><h3>Tools</h3>
        <ul>
        <li>VS Code</li>
        <li>Source tree</li>
        <li>ChatGPT</li>
        <li>GitHub</li>
        <li>Sublime Merge</li>
        <li>Studio3T</li>
        </ul>
    </li>
    <li><h3>Skills & Libraries</h3>
        <ul>
        <li>HTML</li>
        <li>CSS</li>
        <li>JS</li>
        <li>MongoDB</li>
        <li>Kaggle</li>
        <li>Node JS</li>
        <li>sweetalert2</li>
        <li>Firestore Cloud Storage</li>
        <li>Bootstrap</li>
        <li>JQuery</li>  
</ul>


<h3>Listing of File Contents of folder</h3>

```bash
.
├── README.md
├── databaseConnection.js
├── index.js
├── middleware
│   ├── admin.js
│   ├── edit-profile.js
│   ├── index.js
│   ├── login.js
│   ├── review.js
│   ├── session.js
│   └── signup.js
├── public
│   ├── css
│   │   ├── all-reviews.css
│   │   ├── bookmarks.css
│   │   ├── bootstrap.css
│   │   ├── common.css
│   │   ├── confetti-rain.css
│   │   ├── course-detail.css
│   │   ├── coursecard.css
│   │   ├── custom.css
│   │   ├── easter-egg.css
│   │   ├── edit-review.css
│   │   ├── form.css
│   │   ├── header.css
│   │   ├── main.css
│   │   ├── my-reviews.css
│   │   ├── profile.css
│   │   ├── read-my-review-card.css
│   │   ├── read-review-card.css
│   │   ├── reviewcard2.css
│   │   ├── search-list.css
│   │   ├── search.css
│   │   ├── slider.css
│   │   └── write-review-card.css
│   ├── font
│   │   └── Lato
│   │       ├── Lato-Black.ttf
│   │       ├── Lato-BlackItalic.ttf
│   │       ├── Lato-Bold.ttf
│   │       ├── Lato-BoldItalic.ttf
│   │       ├── Lato-Italic.ttf
│   │       ├── Lato-Light.ttf
│   │       ├── Lato-LightItalic.ttf
│   │       ├── Lato-Regular.ttf
│   │       ├── Lato-Thin.ttf
│   │       ├── Lato-ThinItalic.ttf
│   │       └── OFL.txt
│   ├── image
│   │   ├── ads_main.png
│   │   ├── avatar.png
│   │   ├── bookmark.png
│   │   ├── camera.png
│   │   ├── closemenu.png
│   │   ├── complete.png
│   │   ├── coursla_main.png
│   │   ├── crown.png
│   │   ├── favicon.ico
│   │   ├── logo-coursera.svg
│   │   ├── logo-round-coursera.png
│   │   ├── logo-round-udemy.webp
│   │   ├── logo-udemy.svg
│   │   ├── openmenu.png
│   │   ├── randomimage
│   │   │   ├── 1.jpeg
│   │   │   ├── 2.jpeg
│   │   │   ├── 3.jpeg
│   │   │   ├── 4.jpeg
│   │   │   ├── 5.jpeg
│   │   │   ├── 6.jpeg
│   │   │   ├── 7.jpeg
│   │   │   ├── 8.jpeg
│   │   │   └── 9.jpeg
│   │   ├── rating.png
│   │   ├── reviews.png
│   │   ├── rick-roll-rick-ashley.gif
│   │   ├── rick-roll-rick-rolled.gif
│   │   ├── selective.png
│   │   ├── setting.png
│   │   └── udemy.png
│   └── js
│       ├── bookmark.js
│       ├── common.js
│       ├── confetti-rain.js
│       ├── easter-egg.js
│       ├── image.js
│       ├── modal.js
│       └── search-list.js
├── sample.env
├── utils.js
└── views
    ├── 404.ejs
    ├── all-reviews.ejs
    ├── bookmarks.ejs
    ├── change-password.ejs
    ├── course-detail.ejs
    ├── edit-my-review.ejs
    ├── edit-profile.ejs
    ├── edit-review.ejs
    ├── error.ejs
    ├── find-password.ejs
    ├── index-afterLogin.ejs
    ├── index.ejs
    ├── login-submit.ejs
    ├── login.ejs
    ├── my-review.ejs
    ├── profile.ejs
    ├── read-my-review.ejs
    ├── read-review.ejs
    ├── reset-password.ejs
    ├── search-results.ejs
    ├── signup-submit.ejs
    ├── signup.ejs
    ├── templates
    │   ├── bookmarks-list.ejs
    │   ├── easter-egg.ejs
    │   ├── footer.ejs
    │   ├── head.ejs
    │   ├── header-beforeLogin.ejs
    │   ├── header-index-beforeLogin.ejs
    │   ├── header.ejs
    │   ├── list.ejs
    │   ├── loader.ejs
    │   ├── nav-beforeLogin.ejs
    │   ├── nav.ejs
    │   ├── profile-avatar.ejs
    │   ├── read-slider.ejs
    │   ├── write-slider-dontchange.ejs
    │   └── write-slider.ejs
    └── write-review.ejs
```

<h2>Installing and Running Coursla</h2>
<p>To install and run the project, follow these steps:</p>
<ol>
    <li>Install Node.js:
        <ul>
            <li>Download and install Node.js from the official website (<a href="https://nodejs.org">https://nodejs.org</a>).</li>
            <li>Follow the installation instructions for your operating system.</li>
        </ul>
    </li>
     <br>
    <li>Clone the GitHub repository:
        <ul>
            <li>Open a terminal or command prompt.</li>
            <li>Change to the directory where you want to clone the repository.</li>
            <li>Run the following command to clone the repository:</li>
            <li><code>git clone <repository_url></code> </li>
            <li>Replace <repository_url> with the URL of the GitHub repository.</li>
        </ul>
    </li>
    <br>
    <li>Set up environment variables:
        <ul>
            <li>Create a .env file in the project root directory.</li>
            <li>Add the necessary environment variables to the .env file. Refer to the project documentation or the .env.example file for the required variables.</li>
        </ul>
    </li>
     <br>
    <li>Set up the database:
        <ul>
            <li>Install and set up MongoDB.</li>
            <li>Configure the MongoDB connection URL in the .env file.</li>
        </ul>
    </li>
     <br>
    <li>Run the project:
        <ul>
            <li>Run the following command to start the server:</li>
            <li><code>npm start</code></li>
            <li>The server should start running, and you should see a message indicating the port on which the server is listening.</li>
        </ul>
    </li>
     <br>
    <li>Access the web app:
        <ul>
            <li>Open a web browser.</li>
            <li>Enter the URL http://localhost:<port> in the address bar.</li>
            <li>Replace <port> with the port number specified in the console output.</li>
        </ul>
    </li>
</ol>
 
<h2>How to use the Coursla</h2>
 <h4>1. Search and Filter Online Courses:</h4>
  <ul>
    <li>Utilize the search functionality to find courses based on keywords.</li>
    <li>Apply filters such as course provider, difficulty level, or sorting to narrow down your search results.</li>
  </ul>
  
  <h4>2. See Course Details:</h4>
  <ul>
    <li>Click on a course to access its detailed information.</li>
    <li>Explore the course provider, difficulty level, enrollment number, description, provider and Coursla rating. </li>
    <li>Click on external link to go to the online course provider.</li>
  </ul>
  
  <h4>3. Read and Write Reviews for Courses:</h4>
  <ul>
    <li>Find the review section or option for each course.</li>
    <li>Read reviews left by other users to gain insights and perspectives.</li>
    <li>Write your own reviews, providing feedback on the course content, instructor, or learning experience.</li>
  </ul>
  
  <h4>4. Bookmark Courses for Later Viewing:</h4>
  <ul>
    <li>Click on the bookmark icon to save courses of interest.</li>
    <li>Access your bookmarked courses later in my Bookmarks</li>
  </ul>
        
<h2>AI and Coursla</h2>

<p>As per the project theme, we relied on AI technology to help develop our app. We used ChatGPT to help us create functions, design our functions, and debug our code.</p> 
<p>For our project, we used two MOOC dataset that were publicly available on Kaggle. Iniitally, we attempted to use ChatGPT to help us sort all of the courses into ten categories. However, our team noticed that there were too many values (7000+ data points) and we learned that ChatGPT could only process the datasets in small batches.</p>
<p>Coursla used AI for the development of the application but it was not incorporated within the application itself.</p>
<p></p>
        
 <



# 2800-202310-BBY09

1. Project Title [1 mark]
2. Project Description (One Sentence Pitch) [2 marks]
3. Technologies used  [2 marks]
    - frontend, backend, database?
    - other tech tools
4. Listing of File Contents of folder [2 marks]
5. How to install or run the project [2 marks]
6. How to use the product (Features) [2 marks]
7. Include Credits, References, and Licenses [ 2 marks]
8. How did you use AI? Tell us exactly what AI services and products you used and how you used them. Be very specific:
    1. Did you use AI to help create your app? If so, how? Be specific. [ 2 marks]
    2. DId you use AI to create data sets or clean data sets? If so, how? Be specific. [ 2 marks]
    3. Does your app use AI? If so, how? Be specific. [ 2 marks]
    4. Did you encounter any limitations? What were they, and how did you overcome them? Be specific. [ 2 marks]
9. Contact Information [1 mark]

<h1>Coursla 🌿</h1>

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




<h2>How to run the Coursla App!</h2>
<ol>
    <li>MongoDB</li>
    <li>MongoDB</li>
</ol>



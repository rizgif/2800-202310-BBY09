// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_J3UvDUQU3ATFTsHg8hfDBb3wLWPX-wc",
  authDomain: "coursla.firebaseapp.com",
  projectId: "coursla",
  storageBucket: "coursla.appspot.com",
  messagingSenderId: "499981227380",
  appId: "1:499981227380:web:d85ec03478e29e51d04821",
  measurementId: "G-NL1YRPGGYP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/* firebase storage */
const storage = getStorage();


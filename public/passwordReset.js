// This JavaScript document is for the login.html page only, as other JavaScript files will change the general info on the other static pages
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { AuthErrorCodes } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, sendPasswordResetEmail, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


// Initalize constants that the JS will use to interact with HTML elements based on user authentication state
const divLoginError = document.querySelector('#divLoginError')
const lblLoginErrorMessage = document.querySelector('#lblLoginErrorMessage')
// Nav Bar Display Buttons
const whenSignedOutNav = document.querySelector('#whenSignedOutNav')
const whenSignedInNav = document.querySelector('#whenSignedInNav')
// Footer Links
const footerLogin = document.querySelector('#footerLogin')
const footerAccount = document.querySelector('#footerAccount')
// Email Input
const txtEmail = document.querySelector('#txtEmail')
const successMessage = document.querySelector('#successMessage')
const resetPassword = document.querySelector('#resetPassword')

const firebaseApp = initializeApp({
    apiKey: "AIzaSyCuS3TWRtitOxxjJ3gyb-lxH2kmu2N0Ij8",
    authDomain: "thetataumiamiuniversity.firebaseapp.com",
    projectId: "thetataumiamiuniversity",
    storageBucket: "thetataumiamiuniversity.appspot.com",
    messagingSenderId: "752928414181",
    appId: "1:752928414181:web:d70dbd3f4ed11077e7b70c",
    measurementId: "G-BTNR03FCB4"
});

// Core constant variable used to regulate a user's authenticated 'state'
const auth = firebase.auth();
const authentication = getAuth(firebaseApp);

///// Password Management /////
//// Reset Password ////

// User enters their email to recieve password reset email
const resetPasswordFunction = () => {
  const email = txtEmail.value;
  console.log(email);
  auth.sendPasswordResetEmail(email)
  .then(() => {
    console.log("Password Reset Email Sent Successfully!");
  })
  .catch(error => {
    console.error(error);
  })
}

// Handle display errors when logging in
const hideLoginError = () => {
    divLoginError.style.display = 'none'
    lblLoginErrorMessage.innerHTML = ''
}

const showLoginError = (error) => {
    divLoginError.style.display = 'block'    
    if (error.code == AuthErrorCodes.INVALID_PASSWORD) {
        lblLoginErrorMessage.innerHTML = `Wrong password. Try again.`
    }
    else {
        lblLoginErrorMessage.innerHTML = `Invalid email`      
    }
}

// Button Click Event Listeners (Reset Password)
resetPassword.addEventListener("click", resetPasswordFunction);




import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
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
const failureMessage = document.querySelector('#failureMessage')
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

 // Log out function
 const logout = async () => {
  await signOut(auth);
}

// Make sure the user is logged out anytime they access the password reset page
logout();

///// Password Management /////
//// Reset Password ////

// User enters their email to recieve password reset email
const resetPasswordFunction = () => {
  const email = txtEmail.value;
  //console.log(email);
  auth.sendPasswordResetEmail(email)
  .then(() => {
    console.log("Password Reset Email Sent Successfully!");
    successMessage.hidden = false;
    failureMessage.hidden = true;
  })
  .catch(error => {
    console.error(error);
    failureMessage.hidden = false;
    successMessage.hidden = true;
  })
}

// Button Click Event Listeners (Reset Password)
resetPassword.addEventListener("click", resetPasswordFunction);




import { auth } from "/config/firebaseConfig.js";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Initialize constants that the JS will use to interact with HTML elements based on user authentication state
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

// Log out function
const logout = async () => {
    await signOut(auth);
}

// Make sure the user is logged out anytime they access the password reset page
logout();

///// Password Management /////
//// Reset Password ////

// User enters their email to receive password reset email
const resetPasswordFunction = () => {
    const email = txtEmail.value;
    //console.log(email);
    sendPasswordResetEmail(auth, email)
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
// This JavaScript document is for the login.html page only, as other JavaScript files will change the general info on the other static pages

import { AuthErrorCodes, onAuthStateChanged,
            signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { auth } from "/config/firebaseConfig.js";

// Initalize constants that the JS will use to interact with HTML elements based on user authentication state
const divLoginError = document.querySelector('#divLoginError')
const lblLoginErrorMessage = document.querySelector('#lblLoginErrorMessage')
// Nav Bar Display Buttons
const whenSignedOutNav = document.querySelector('#whenSignedOutNav')
const whenSignedInNav = document.querySelector('#whenSignedInNav')
// Header Text
const headerLogin = document.querySelector('#headerLogin')
const headerAccount = document.querySelector('#headerAccount')
// Footer Links
const footerLogin = document.querySelector('#footerLogin')
const footerAccount = document.querySelector('#footerAccount')

// Login using email/password
const loginEmailPassword = async () => {
    const loginEmail = txtEmail.value
    const loginPassword = txtPassword.value
    console.log("Logging in page");
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
    }
    catch(error) {
      console.log(`There was an error: ${error}`)
      showLoginError(error)
    }
}

// Handle display errors when logging in
const hideLoginError = () => {
    divLoginError.style.display = 'none'
    lblLoginErrorMessage.innerHTML = ''
}

const showLoginError = (error) => {
    divLoginError.style.display = 'block'    
    if (error.code == AuthErrorCodes.INVALID_PASSWORD) {
        lblLoginErrorMessage.innerHTML = `Invalid email or password, try again.`
    }
    else {
        lblLoginErrorMessage.innerHTML = `Invalid email or password, try again.`      
    }
}


 // Log out
 const logout = async () => {
    await signOut(auth);
}

auth.onAuthStateChanged( (user) => {
    console.log("Firebase Auth Object:", auth);
    console.log("Checking auth state...");
    if (user) {
        // SIGNED IN
        // Change Header Text
        headerLogin.hidden = true;
        headerAccount.hidden = false;
        // Change Nav Bar Display
        // whenSignedInNav.style = "";
        // whenSignedOutNav.style = "display:none;";
        // Change Footer Display to Account
        // footerLogin.hidden = true;
        // footerAccount.hidden = false;

        // Redirect to accounts
        window.location.replace("account.html");


    } else {
        // NOT SIGNED IN
        console.log("Not logged in")
        // Change header to Login page
        headerLogin.hidden = false;
        headerAccount.hidden = true;
        // Change Nav Bar to Login
        whenSignedInNav.style = "display:none;";
        whenSignedOutNav.style = "";
        // Change Footer Display to Login
        footerLogin.hidden = false;
        footerAccount.hidden = true;
    }
});

// Add Listener to login
btnLogin.addEventListener("click", loginEmailPassword)


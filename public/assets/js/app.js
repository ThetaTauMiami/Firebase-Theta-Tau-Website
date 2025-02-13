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
// Header Text
const headerLogin = document.querySelector('#headerLogin')
const headerAccount = document.querySelector('#headerAccount')
// Footer Links
const footerLogin = document.querySelector('#footerLogin')
const footerAccount = document.querySelector('#footerAccount')

const firebaseApp = initializeApp({
    apiKey: "AIzaSyCuS3TWRtitOxxjJ3gyb-lxH2kmu2N0Ij8",
    authDomain: "thetataumiamiuniversity.firebaseapp.com",
    projectId: "thetataumiamiuniversity",
    storageBucket: "thetataumiamiuniversity.appspot.com",
    messagingSenderId: "752928414181",
    appId: "1:752928414181:web:d70dbd3f4ed11077e7b70c",
    measurementId: "G-BTNR03FCB4"
});

///// User Authentication /////
//// Email & Password Sign-In ////

// Login using email/password
const loginEmailPassword = async () => {
    const loginEmail = txtEmail.value
    const loginPassword = txtPassword.value
    console.log(loginEmail, loginPassword)
    try {
      await signInWithEmailAndPassword(authentication, loginEmail, loginPassword)
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

// Monitor user Authentication state, this will change website contents using javascript functions
const monitorAuthState = async () => {
    onAuthStateChanged(authentication, user => {
      if (user) {
        console.log("Successful login")
        
        // If the user is properly logged in, get rid of any log in error that has been displayed
        hideLoginError()
      }
      else {
        console.log("Not Logged In")
      }
    })
  }

 // Log out
 const logout = async () => {
    await signOut(auth);
}

// Button Click Event Listeners (Email Login, Logout)

btnLogin.addEventListener("click", loginEmailPassword)

// btnLogout.addEventListener("click", logout)

// Core constant variable used to regulate a user's authenticated 'state'
const auth = firebase.auth();

const authentication = getAuth(firebaseApp);

monitorAuthState();

// This authentication listener regulates what the user sees
// on the page depending on the authentication state.
auth.onAuthStateChanged(user => {
  if (user) {
      // SIGNED IN
      // Change Header Text
      headerLogin.hidden = true;
      headerAccount.hidden = false;
      // Change Nav Bar Display
      whenSignedInNav.style = "";
      whenSignedOutNav.style = "display:none;";
      // Change Footer Display to Account
      footerLogin.hidden = true;
      footerAccount.hidden = false;
      window.location.replace("account.html");


  } else {
      // NOT SIGNED IN

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


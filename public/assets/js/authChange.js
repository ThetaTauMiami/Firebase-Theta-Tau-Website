// // This JavaScript document is for the static pages only, as other JavaScript files will be used for login.html to handle logged in users
// import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
// import { AuthErrorCodes } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
// import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
//
// // Initalize constants that the JS will use to interact with HTML elements based on user authentication state
// // Nav Bar Display Buttons
// const whenSignedOutNav = document.querySelector('#whenSignedOutNav')
// const whenSignedInNav = document.querySelector('#whenSignedInNav')
// // Footer Links
// const footerLogin = document.querySelector('#footerLogin')
// const footerAccount = document.querySelector('#footerAccount')
//
//
//
// const firebaseApp = initializeApp({
//     apiKey: "AIzaSyCuS3TWRtitOxxjJ3gyb-lxH2kmu2N0Ij8",
//     authDomain: "thetataumiamiuniversity.firebaseapp.com",
//     projectId: "thetataumiamiuniversity",
//     storageBucket: "thetataumiamiuniversity.appspot.com",
//     messagingSenderId: "752928414181",
//     appId: "1:752928414181:web:d70dbd3f4ed11077e7b70c",
//     measurementId: "G-BTNR03FCB4"
// });
//
// ///// User Authentication /////
//
// // Monitor user Authentication state, this will change website contents using javascript functions
// const monitorAuthState = async () => {
//     onAuthStateChanged(authentication, user => {
//       if (user) {
//         console.log("Logged In")
//       }
//       else {
//         console.log("Not Logged In")
//       }
//     })
//   }
//
// // Core constant variable used to regulate a user's authenticated 'state'
// const auth = firebase.auth();
//
// const authentication = getAuth(firebaseApp);
//
// monitorAuthState();
//
// // This authentication listener regulates what the user sees
// // on the page depending on the authentication state.
// auth.onAuthStateChanged(user => {
//   if (user) {
//       // SIGNED IN
//
//       // Change Nav Bar Display
//       whenSignedInNav.style = "";
//       whenSignedOutNav.style = "display:none;";
//       // Change Footer Display to Account
//       footerLogin.hidden = true;
//       footerAccount.hidden = false;
//
//
//
//   } else {
//       // NOT SIGNED IN
//
//       // Change Nav Bar to Login
//       whenSignedInNav.style = "display:none;";
//       whenSignedOutNav.style = "";
//       // Change Footer Display to Login
//       footerLogin.hidden = false;
//       footerAccount.hidden = true;
//   }
// });
//

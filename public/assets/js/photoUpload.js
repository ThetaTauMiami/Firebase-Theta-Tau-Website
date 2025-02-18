import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, sendPasswordResetEmail, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


// Initalize constants that the JS will use to interact with HTML elements based on user authentication state
// Email Input
const txtPhotoURL = document.querySelector('#txtPhotoURL')
const successMessage = document.querySelector('#successMessage')
const failureMessage = document.querySelector('#failureMessage')
const btnSubmitPhoto = document.querySelector('#btnSubmitPhoto')

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

//////// Firestore Variables (Database) //////////
const db = firebase.firestore();
let usersRef; // Reference to the document or collection we want to access
let unsubscribe;

// Check to see if user is logged in properly
auth.onAuthStateChanged(user => {
  if (user) {
      // SIGNED IN
      // Create a reference to the database user collection
      usersRef = db.collection('userData');
      // If the user is logged in and fills out the account details, handle the submission here
      btnSubmitPhoto.onclick = () => {
        // Get User's Photo URL
        let curPhotoURL = txtPhotoURL.value;
        //console.log(linkedinVal);
        //console.log(txtLinkedinEntry.checkValidity());
        if (!txtPhotoURL.checkValidity()) { // If the user has an invalid LinkedIn URL input
          // Display a red invalid input field for the user to fix
          txtPhotoURL.style = "width:95%; margin: auto; background-color: #FFCCCB;";
          txtPhotoURL.placeholder = "You must input a valid photo URL!";
          txtPhotoURL.classList.add('placeholderInvalid');
          txtPhotoURL.classList.add('placeholderInvalid::placeholder');
          txtPhotoURL.value = "";
          successMessage.hidden = true;
          failureMessage.hidden = false;
        } else { // Valid input
            // Query the user's information
            const query = usersRef.where('uid', '==', user.uid);
            // Get the new viewable photo URL from the transforming
            const newURL = transformGoogleDriveURL(curPhotoURL);
            console.log(newURL);
            // Query and update database if possible
            query.get().then((snapshot) => {
              snapshot.forEach((doc) => {
                usersRef.doc(doc.id).update({ pictureLink: newURL });
                // Change what the user sees
              });
            });
            successMessage.hidden = false;
            failureMessage.hidden = true;
        }
      }

  } else { // User is not signed in
    // Return the user to the login screen
    unsubscribe && unsubscribe(); // Stop listening for user input (no memory leaks)
    window.location.replace("login.html");
  }
});

// Function that transforms the user's inputted photo URL 
// into something viewable in HTML format
function transformGoogleDriveURL(originalURL) {
  const startIndex = originalURL.indexOf("/file/d/") + 8; // Index after "/file/d/"
  const endIndex = originalURL.indexOf("/view?usp=sharing");
  
  if (startIndex !== -1 && endIndex !== -1) {
    const allTextHere = originalURL.substring(startIndex, endIndex);
    const newURL = `https://drive.google.com/uc?export=view&id=${allTextHere}`;
    return newURL;
  } else {
    // If the input URL doesn't match the expected pattern, return the original URL.
    return originalURL;
  }
}
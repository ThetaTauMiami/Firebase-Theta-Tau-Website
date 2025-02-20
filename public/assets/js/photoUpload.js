import {auth, db, firebaseApp} from "/config/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
// Initalize constants that the JS will use to interact with HTML elements based on user authentication state
// Email Input
const txtPhotoURL = document.querySelector('#txtPhotoURL')
const successMessage = document.querySelector('#successMessage')
const failureMessage = document.querySelector('#failureMessage')
const btnSubmitPhoto = document.querySelector('#btnSubmitPhoto')


//////// Firestore Variables (Database) //////////
let usersRef; // Reference to the document or collection we want to access
let unsubscribe;

// Check to see if user is logged in properly
// auth.onAuthStateChanged((user) => {
//   if (user) {
//       // SIGNED IN
//       // Create a reference to the database user collection
//       usersRef = db.collection('userData');
//       console.log(usersRef);
//       // If the user is logged in and fills out the account details, handle the submission here
//       btnSubmitPhoto.onclick = () => {
//         // Get User's Photo URL
//         let curPhotoURL = txtPhotoURL.value;
//         //console.log(linkedinVal);
//         //console.log(txtLinkedinEntry.checkValidity());
//         if (!txtPhotoURL.checkValidity()) { // If the user has an invalid LinkedIn URL input
//           // Display a red invalid input field for the user to fix
//           txtPhotoURL.style = "width:95%; margin: auto; background-color: #FFCCCB;";
//           txtPhotoURL.placeholder = "You must input a valid photo URL!";
//           txtPhotoURL.classList.add('placeholderInvalid');
//           txtPhotoURL.classList.add('placeholderInvalid::placeholder');
//           txtPhotoURL.value = "";
//           successMessage.hidden = true;
//           failureMessage.hidden = false;
//         } else { // Valid input
//             // Query the user's information
//             const query = usersRef.where('uid', '==', user.uid);
//             // Get the new viewable photo URL from the transforming
//             const newURL = transformGoogleDriveURL(curPhotoURL);
//             console.log(newURL);
//             // Query and update database if possible
//             query.get().then((snapshot) => {
//               snapshot.forEach((doc) => {
//                 usersRef.doc(doc.id).update({ pictureLink: newURL });
//                 // Change what the user sees
//               });
//             });
//             successMessage.hidden = false;
//             failureMessage.hidden = true;
//         }
//       }
//
//   } else { // User is not signed in
//     // Return the user to the login screen
//     unsubscribe && unsubscribe(); // Stop listening for user input (no memory leaks)
//     window.location.replace("login.html");
//   }
// });



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

// Handle user authentication state change
onAuthStateChanged(auth, (user) => {
    if (!user) return handleUserNotSignedIn();

    console.log("User signed in:", user.uid);

    // Create Firestore reference
    const usersRef = collection(db, "userData");

    // Attach event listener to submit button
    btnSubmitPhoto.onclick = () => handlePhotoSubmission(usersRef, user.uid);
});

// Handle what happens when a user is not signed in
function handleUserNotSignedIn() {
    console.log("User is not signed in. Redirecting...");
    unsubscribe && unsubscribe(); // Stop listening for user input (prevent memory leaks)
    window.location.replace("login.html");
}

// Handle photo submission
function handlePhotoSubmission(usersRef, userId) {
    const photoURL = txtPhotoURL.value;
    console.log("Photo submissions")

    if (!isValidPhotoURL(photoURL)) {
        displayInputError(txtPhotoURL, "You must input a valid photo URL!");
        return;
    }

    updateUserPhoto(usersRef, userId, photoURL);
}

// Validate input
function isValidPhotoURL(url) {
    return txtPhotoURL.checkValidity();
}

// Show input error
function displayInputError(inputElement, message) {
    inputElement.style = "width:95%; margin: auto; background-color: #FFCCCB;";
    inputElement.placeholder = message;
    inputElement.classList.add("placeholderInvalid");
    inputElement.value = "";
    successMessage.hidden = true;
    failureMessage.hidden = false;
}

// Update user photo in Firestore
async function updateUserPhoto(usersRef, userId, photoURL) {
    const newURL = transformGoogleDriveURL(photoURL);
    console.log("Transformed URL:", newURL);

    try {

        const userQuery = query(usersRef, where("uid", "==", userId));

        const snapshot = await getDocs(userQuery);
        snapshot.forEach(async (docSnap) => {
            const userDocRef = doc(db, "userData", docSnap.id);
            await updateDoc(userDocRef, { pictureLink: newURL });
            console.log(`Updated pictureLink for user ${userId}`);
        });

        successMessage.hidden = false;
        failureMessage.hidden = true;
    } catch (error) {
        console.error("Error updating photo URL:", error);
    }
}

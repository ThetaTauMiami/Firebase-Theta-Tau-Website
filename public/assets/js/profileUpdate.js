import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, sendPasswordResetEmail, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


// Initalize constants that the JS will use to interact with HTML elements based on user authentication state
// Message Displays
const successMessage = document.querySelector('#successMessage')
const failureMessage = document.querySelector('#failureMessage')
const notInitMessage = document.querySelector('#notInitMessage')
//Buttons
const btnUpdateAccountDetails = document.querySelector('#btnUpdateAccountDetails')
// User Input
// Input Areas
const txtFirstnameEntry = document.querySelector('#txtFirstname')
const txtLastnameEntry = document.querySelector('#txtLastname')
const txtMajorEntry = document.querySelector('#txtMajor')
const txtMinorEntry = document.querySelector('#txtMinor')
const txtGradYearEntry = document.querySelector('#txtGradYear')
const txtFratClassEntry = document.querySelector('#txtFratClass')
const txtLinkedinEntry = document.querySelector('#txtLinkedin')
const txtPersonalWebEntry = document.querySelector('#txtPersonalWeb')
const txtGitHubEntry = document.querySelector('#txtGithub')

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
      const userQuery = usersRef.where('uid', '==', user.uid);

      // Checks to see if the current user has setup their account (Not first sign-in)
      userOwnsSomething(user.uid)
          .then((userOwnsThings) => {
            console.log("User owns things? ", userOwnsThings);
            if (!userOwnsThings) { // If the user hasn't setup their account
              // Return the user to the login screen
              unsubscribe && unsubscribe();
              window.location.replace("account.html");
            } else { // User has information already stored (GOOD)
              // Fetch user data and populate form
              userQuery.get().then(querySnapshot => {
                if (!querySnapshot.empty) {
                  const userData = querySnapshot.docs[0].data();
                  populateFormWithUserData(userData);
                }
              });

              // If the user is logged in and fills out the account details, handle the submission here
              btnUpdateAccountDetails.onclick = async () => {
                let notInvalidCheck = true;
                // Get User's Firstname
                let firstnameVal = txtFirstnameEntry.value;
                //console.log(firstnameVal);
                //console.log(txtFirstnameEntry.checkValidity());
                if (!txtFirstnameEntry.checkValidity()) { // If the user has an invalid Firstname input
                  // Display a red invalid input field for the user to fix
                  txtFirstnameEntry.style = "width:95%; margin: auto; background-color: #FFCCCB;";
                  txtFirstnameEntry.placeholder = "You must input a valid first name!";
                  txtFirstnameEntry.classList.add('placeholderInvalid');
                  txtFirstnameEntry.classList.add('placeholderInvalid::placeholder');
                  txtFirstnameEntry.value = "";
                  notInvalidCheck = false;
                }

                // Get User's Lastname
                let lastnameVal = txtLastnameEntry.value;
                //console.log(lastnameVal);
                //console.log(txtLastnameEntry.checkValidity());
                if (!txtLastnameEntry.checkValidity()) { // If the user has an invalid Lastname input
                  // Display a red invalid input field for the user to fix
                  txtLastnameEntry.style = "width:95%; margin: auto; background-color: #FFCCCB;";
                  txtLastnameEntry.placeholder = "You must input a valid last name!";
                  txtLastnameEntry.classList.add('placeholderInvalid');
                  txtLastnameEntry.classList.add('placeholderInvalid::placeholder');
                  txtLastnameEntry.value = "";
                  notInvalidCheck = false;
                }

                // Get User's Major
                let majorVal = txtMajorEntry.value;
                //console.log(majorVal);
                //console.log(txtMajorEntry.checkValidity());
                if (!txtMajorEntry.checkValidity()) { // If the user has an invalid major input
                  // Display a red invalid input field for the user to fix
                  txtMajorEntry.style = "width:95%; margin: auto; background-color: #FFCCCB;";
                  txtMajorEntry.placeholder = "You must input a valid major!";
                  txtMajorEntry.classList.add('placeholderInvalid');
                  txtMajorEntry.classList.add('placeholderInvalid::placeholder');
                  txtMajorEntry.value = "";
                  notInvalidCheck = false;
                }

                // Get User's Minor (Optional)
                let minorVal = txtMinorEntry.value;
                //console.log(minorVal);
                //console.log(txtMinorEntry.checkValidity());

                // Get User's Grad Year
                let gradYearVal = txtGradYearEntry.value;
                //console.log(gradYearVal);
                //console.log(txtGradYearEntry.checkValidity());
                if (!txtGradYearEntry.checkValidity()) { // If the user has an invalid graduation year input
                  // Display a red invalid input field for the user to fix
                  txtGradYearEntry.style = "width:95%; margin: auto; background-color: #FFCCCB;";
                  txtGradYearEntry.placeholder = "You must input a valid graduation year! (1980-2050)";
                  txtGradYearEntry.classList.add('placeholderInvalid');
                  txtGradYearEntry.classList.add('placeholderInvalid::placeholder');
                  txtGradYearEntry.value = "";
                  notInvalidCheck = false;
                }

                // Get User's Grad Year
                let fratClassVal = txtFratClassEntry.value;
                //console.log(fratClassVal);
                //console.log(txtFratClassEntry.checkValidity());
                if (!txtFratClassEntry.checkValidity()) { // If the user has an invalid fraternity class input
                  // Display a red invalid input field for the user to fix
                  txtFratClassEntry.style = "width:95%; margin: auto; background-color: #FFCCCB;";
                  txtFratClassEntry.placeholder = "You must input a valid fraternity class! (Ex: Kappa)";
                  txtFratClassEntry.classList.add('placeholderInvalid');
                  txtFratClassEntry.classList.add('placeholderInvalid::placeholder');
                  notInvalidCheck = false;
                }

                // Get User's LinkedIn URL (Optional)
                let linkedinVal = txtLinkedinEntry.value;
                //console.log(linkedinVal);
                //console.log(txtLinkedinEntry.checkValidity());
                if (!txtLinkedinEntry.checkValidity()) { // If the user has an invalid LinkedIn URL input
                  // Display a red invalid input field for the user to fix
                  txtLinkedinEntry.style = "width:95%; margin: auto; background-color: #FFCCCB;";
                  txtLinkedinEntry.placeholder = "You must input a valid LinkedIn URL!";
                  txtLinkedinEntry.classList.add('placeholderInvalid');
                  txtLinkedinEntry.classList.add('placeholderInvalid::placeholder');
                  txtLinkedinEntry.value = "";
                  notInvalidCheck = false;
                }

                // Get User's Personal Website URL (Optional)
                let personalWebVal = txtPersonalWebEntry.value;
                //console.log(personalWebVal);
                //console.log(txtPersonalWebEntry.checkValidity());
                if (!txtPersonalWebEntry.checkValidity()) { // If the user has an invalid Personal Web URL input
                  // Display a red invalid input field for the user to fix
                  txtPersonalWebEntry.style = "width:95%; margin: auto; background-color: #FFCCCB;";
                  txtPersonalWebEntry.placeholder = "You must input a valid personal website URL!";
                  txtPersonalWebEntry.classList.add('placeholderInvalid');
                  txtPersonalWebEntry.classList.add('placeholderInvalid::placeholder');
                  txtPersonalWebEntry.value = "";
                  notInvalidCheck = false;
                }

                // Get User's GitHub URL (Optional)
                let githubVal = txtGitHubEntry.value;
                //console.log(githubVal);
                //console.log(txtGitHubEntry.checkValidity());
                if (!txtGitHubEntry.checkValidity()) { // If the user has an invalid GitHub URL input
                  // Display a red invalid input field for the user to fix
                  txtGitHubEntry.style = "width:95%; margin: auto; background-color: #FFCCCB;";
                  txtGitHubEntry.placeholder = "You must input a valid GitHub URL!";
                  txtGitHubEntry.classList.add('placeholderInvalid');
                  txtGitHubEntry.classList.add('placeholderInvalid::placeholder');
                  txtGitHubEntry.value = "";
                  notInvalidCheck = false;
                }

                if (txtFirstnameEntry.checkValidity() && txtLastnameEntry.checkValidity()
                  && txtMajorEntry.checkValidity() && txtGradYearEntry.checkValidity()
                  && txtLinkedinEntry.checkValidity() && txtPersonalWebEntry.checkValidity()
                  && txtFratClassEntry.checkValidity() && txtGitHubEntry.checkValidity() && notInvalidCheck) { // If every field has a valid input, accept the form
                    // Check if the user entry already exists
                    const userSnapshot = await userQuery.get();
                
                    if (!userSnapshot.empty) {
                      // User entry exists, update the existing entry
                      const userDoc = userSnapshot.docs[0];
                      userDoc.ref.update({
                        fratclass: fratClassVal,
                        firstname: firstnameVal,
                        lastname: lastnameVal,
                        major: majorVal,
                        minor: minorVal,
                        gradYear: gradYearVal,
                        linkedinLink: linkedinVal,
                        personalLink: personalWebVal,
                        githubLink: githubVal
                        // Add other fields to update as needed
                      });

                      // Display a success message to the user
                      successMessage.hidden = false;
                      failureMessage.hidden = true;
                      notInitMessage.hidden = true;
                      
                      // Fetch user data again (after update) and populate form
                      userQuery.get().then(querySnapshot => {
                        if (!querySnapshot.empty) {
                          const userData = querySnapshot.docs[0].data();
                          populateFormWithUserData(userData);
                        }
                      });
                    } else {
                      // User entry does not exist, handle this case accordingly
                      notInitMessage.hidden = false;
                      successMessage.hidden = true;
                      failureMessage.hidden = true;
                    }
                }
              }
            }
      });
  } else { // User is not signed in
    // Return the user to the login screen
    unsubscribe && unsubscribe();
    window.location.replace("login.html");
  }
});

// Function to populate the HTML form with user data
function populateFormWithUserData(user) {
  // Assuming user is the document snapshot or data returned from Firestore

  // Populate form fields
  document.getElementById('txtFirstname').value = user.firstname || '';
  document.getElementById('txtLastname').value = user.lastname || '';
  document.getElementById('txtMajor').value = user.major || '';
  document.getElementById('txtMinor').value = user.minor || '';
  document.getElementById('txtGradYear').value = user.gradYear || '';
  document.getElementById('txtFratClass').value = user.fratclass || '';
  document.getElementById('txtLinkedin').value = user.linkedinLink || '';
  document.getElementById('txtPersonalWeb').value = user.personalLink || '';
  document.getElementById('txtGithub').value = user.githubLink || '';
}

// Function to check if a user owns any items in the Cloud Firestore database
function userOwnsSomething(userId) {
  return db.collection("userData")
    .where("uid", "==", userId)
    .get()
    .then((querySnapshot) => {
      return !querySnapshot.empty; // returns true if user owns things, false otherwise
    })
    .catch((error) => {
      return false; // return false if there was an error [nothing owned]
    });
}




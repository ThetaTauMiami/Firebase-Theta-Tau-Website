// This JavaScript document is for the account page only, as other JavaScript files will be used for login.html and the static pages
// This JavaScript file handles logged in users, admin users, and provides a way for logged out users to exit the page
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { AuthErrorCodes } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Initalize constants that the JS will use to interact with HTML elements based on user authentication state

//First Login Sections
const divFirstLoginPrompt = document.querySelector('#firstLoginPrompt')
const divFirstLoginForm = document.querySelector('#firstLoginForm')
// First Time Sign-In Form Selections
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
// Text Areas
const txtNavbarName = document.querySelector('#userNameNavbar')

// Get the canvas element
var ctx = document.getElementById('pointsChart').getContext('2d');

// Submission Button
const btnMakeAccountDetails = document.querySelector('#btnMakeAccountDetails')


//Logged-In User Sections
const divFullUser = document.querySelector('#fullUser')
const loggedInNavbar = document.querySelector('#loggedInNavbar')
const logoutHeader = document.querySelector('#logoutHeader')

//Logged-Out User Sections
const divSignedOutUser = document.querySelector('#signedOutUser')

// Return to Login Button
const btnLoginReturn = document.querySelector('#btnLoginReturn')

// Upload Photo Button
const btnUploadPhoto = document.querySelector('#btnUploadPhoto')

// Update Profile Button
const btnUpdateProfile = document.querySelector('#btnUpdateProfile')

// Points Update Button (ADMINS ONLY)
const updatePointsSection = document.querySelector('#updatePointsSection')

///////////////// Firebase Initialization ////////////////
const firebaseApp = initializeApp({
    apiKey: "AIzaSyCuS3TWRtitOxxjJ3gyb-lxH2kmu2N0Ij8",
    authDomain: "thetataumiamiuniversity.firebaseapp.com",
    projectId: "thetataumiamiuniversity",
    storageBucket: "thetataumiamiuniversity.appspot.com",
    messagingSenderId: "752928414181",
    appId: "1:752928414181:web:d70dbd3f4ed11077e7b70c",
    measurementId: "G-BTNR03FCB4"
});

//////// Firestore Variables (Database) //////////
const db = firebase.firestore();
const configRef = db.collection('config').doc('roles');
let usersRef; // Reference to the document or collection we want to access
let unsubscribe; // Query handler for user information check
let adminCheck; // Query handler for admin uid check

// Core constant variables used to regulate a user's authenticated 'state'
const auth = firebase.auth();
const authentication = getAuth(firebaseApp);

// Track user's state of loaded ownership
var ownershipLoaded = false;

///////////////////// User Authentication ////////////////////////
// Monitor user Authentication state, this will change website contents using javascript functions
const monitorAuthState = async () => {
    onAuthStateChanged(authentication, user => {
      if (user) {
        console.log("Logged In")
      }
      else {
        console.log("Not Logged In")
      }
    })
}

monitorAuthState();

// Log out
const logout = async () => {
  await signOut(auth);
}

const logoutExit = () => {
  logout(); // Ensure the user is signed out
  window.location.replace('login.html'); // Send the user back to the Login page
}


////////////////////// FUNCTIONS ///////////////////////////////////
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

function updatePointsChart(bhoodP, serviceP, professionalDevelopmentP, generalP) {
          let totalP = bhoodP + serviceP + professionalDevelopmentP + generalP;
          const xValues = ["Brotherhood", "Service", "Professional Development", "General", "Total"];
          const yValues = [bhoodP, serviceP, professionalDevelopmentP, generalP, totalP];
          const barColors = ["red", "green","blue","orange","purple"];

          // Create the bar chart
          var pointsChart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: xValues,
              datasets: [{
                backgroundColor: barColors,
                data: yValues,
                label: 'Semester Points'
              }]
            },
            options: { 
              legend: {
                  display: false
              }
            }
          });
}

// This button will return a user back to the "Login" page and ensure that they are logged out as well
btnLoginReturn.addEventListener("click", logoutExit);
// Normal Logout Button
// btnLogout.addEventListener("click", logoutExit);

// Logout header clicked
logoutHeader.addEventListener("click", logoutExit);

// This button will take the user to the photo upload page
// btnUploadPhoto.addEventListener("click", goToPhotoUpload);

// This button will take the user to the profile update page
// btnUpdateProfile.addEventListener("click", goToProfileUpdate);

// This authentication listener regulates what the user sees
// on the page depending on the authentication state.
auth.onAuthStateChanged(user => {
  if (user) {
      // SIGNED IN
      // Create a reference to the database user collection
      usersRef = db.collection('userData');
      // Hide Signed-Out Content
      divSignedOutUser.hidden = true;
      // Checks to see if the current user has setup their account (Not first sign-in)
      userOwnsSomething(user.uid)
          .then((userOwnsThings) => {
            console.log("User owns things? ", userOwnsThings);
            if (!userOwnsThings) { // If the user hasn't setup their account
              divFirstLoginPrompt.hidden = false;
              divFirstLoginForm.hidden = false;
              divFullUser.hidden = true;
              loggedInNavbar.hidden = true;
              updatePointsSection.style.display = 'none';
            } else {

              // Query the user's information
              unsubscribe = usersRef
              .where('uid', '==', user.uid) // Order by 'searchName' field
              .onSnapshot(querySnapshot => {

                  const photoArea = document.getElementById('photoArea');
                  const bhpointsNum = document.getElementById('bhoodPoints');
                  const servicepointsNum = document.getElementById('servicePoints');
                  const pdpointsNum = document.getElementById('pdPoints');
                  const generalpointsNum = document.getElementById('generalPoints');


                  // Clear previous content for photo and points
                  photoArea.innerHTML = '';
                  bhpointsNum.innerHTML = '';
                  servicepointsNum.innerHTML = '';
                  pdpointsNum.innerHTML = '';
                  generalpointsNum.innerHTML = '';

                  // Loop through query results and extract profile variable values
                  querySnapshot.docs.forEach(doc => {
                      const profile = doc.data();
                      const firstN = profile.firstname;
                      const lastN = profile.lastname;
                      const gradYear = profile.gradYear;
                      const fratClass = profile.fratclass;
                      const bhoodPoints = profile.brotherhoodPoints;
                      const pdPoints = profile.pdPoints;
                      const servicePoints = profile.servicePoints;
                      const generalPoints = profile.generalPoints;
                      const deiFulfilled = profile.deiFulfilled;
                      const major = profile.major;
                      const minor = profile.minor;
                      const linkedinLink = profile.linkedinLink;
                      const personalLink = profile.personalLink;
                      const githubLink = profile.githubLink;
                      const pictureLink = profile.pictureLink;
                      // const amount = profile.amount;
                      // const col = document.createElement('td');
                      // col.textContent = `${name}: ${amount}`;
                      // row.appendChild(col);
                      // colCount++;
                      // If there are 5 columns in this row, append it to the table body and start a new row
                      photoArea.innerHTML = "<img src='https://drive.google.com/uc?export=view&id=1F26Y5GnD9GFQH_Z8-9hKc_Ll1nFGrNll' alt='Theta Tau Brother Headshot' width='331' height='496'>";
                      bhpointsNum.innerHTML = '' + bhoodPoints;
                      servicepointsNum.innerHTML = '' + servicePoints;
                      pdpointsNum.innerHTML = '' + pdPoints;
                      generalpointsNum.innerHTML = '' + generalPoints;
                      txtNavbarName.innerHTML = 'Welcome, ' + firstN + ' ' + lastN + '!';
                      updatePointsChart(bhoodPoints, servicePoints, pdPoints, generalPoints);
                  });
              });

              // Query the admin information
              adminCheck = configRef
                .get()
                .then(doc => {
                  if (doc.exists) {
                    const admins = doc.data().admins;
                    if (admins && admins.includes(user.uid)) {
                      // User is an admin, do something
                      updatePointsSection.style.display = 'list-item';
                    }
                  }
                })
                .catch(error => {
                  console.error('Error getting document:', error);
                });

              // Hide first login display
              divFirstLoginPrompt.hidden = true;
              divFirstLoginForm.hidden = true;
              // Show normal login content (User has setup account)
              divFullUser.hidden = false;
              // Show the 
              loggedInNavbar.hidden = false;
            }
      });
    
      // If the user is logged in and fills out the account details, handle the submission here
      btnMakeAccountDetails.onclick = () => {
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
        }

        if (txtFirstnameEntry.checkValidity() && txtLastnameEntry.checkValidity()
          && txtMajorEntry.checkValidity() && txtGradYearEntry.checkValidity()
          && txtLinkedinEntry.checkValidity() && txtPersonalWebEntry.checkValidity()
          && txtFratClassEntry.checkValidity() && txtGitHubEntry.checkValidity()) { // If every field has a valid input, accept the form
            usersRef.add({
              uid: user.uid,
              fratclass: fratClassVal,
              brotherhoodPoints: 0,
              pdPoints: 0,
              servicePoints: 0,
              generalPoints: 0,
              deiFulfilled: false,
              firstname: firstnameVal,
              lastname: lastnameVal,
              major: majorVal,
              minor: minorVal,
              gradYear: gradYearVal,
              // The picture link is a placeholder photo for everyone before they upload their own professional headshot
              pictureLink: 'https://drive.google.com/uc?export=view&id=1AwJ9tWv0SagtDnE8U1NejxV2rpwOE8mD',
              linkedinLink: linkedinVal,
              personalLink: personalWebVal,
              githubLink: githubVal
            })
            // Change what the user sees
            divFirstLoginPrompt.hidden = true;
            divFirstLoginForm.hidden = true;
            divFullUser.hidden = false;
            loggedInNavbar.hidden = false;
            setTimeout(function() {
              // Reload the page to properly display account page
              // on initial load-in (wait 0.5 seconds)
              location.reload(true);
            }, 500);
        }
      }

  } else {
      // NOT SIGNED IN
      //Hide Signed-In Sections
      divFirstLoginPrompt.hidden = true;
      divFirstLoginForm.hidden = true;
      divFullUser.hidden = true;
      loggedInNavbar.hidden = true;
      // Show Logged-Out Section
      divSignedOutUser.hidden = false;
      // Unsubscribe listening streams for no memory leak when user signs out
      unsubscribe && unsubscribe();
  }
});


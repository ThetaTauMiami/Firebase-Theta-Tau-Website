import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Initalize constants that the JS will use to interact with HTML elements based on user authentication state


//Logged-In User Sections
const divFullUser = document.querySelector('#fullUser')
const loggedInNavbar = document.querySelector('#loggedInNavbar')
const logoutHeader = document.querySelector('#logoutHeader')

//Logged-Out User Sections
const divSignedOutUser = document.querySelector('#signedOutUser')

// Return to Login Button
const btnLoginReturn = document.querySelector('#btnLoginReturn')

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
              // Send them back to the account setup page first
              window.location.replace('account.html');
            } else {
              // Query the admin information
              adminCheck = configRef.get().then(doc => {
                  if (doc.exists) {
                    const admins = doc.data().admins;
                    if (admins && admins.includes(user.uid)) {
                        // User is an admin
                        usersRef.get().then(querySnapshot => {
                            querySnapshot.forEach(doc => {
                                const userData = doc.data();
                                const userRow = takesUserCreatesHTML(userData);
                                const brElem = document.createElement("br");
                                document.getElementById('memberList').appendChild(userRow);
                                document.getElementById('memberList').appendChild(brElem);
                            });
                        }).catch(error => {
                            console.error('Error getting users:', error);
                        });
                    } else {
                        // User is not an admin, go back to account page
                        window.location.replace('account.html');
                    }
                  }
                })
                .catch(error => {
                  console.error('Error getting document:', error);
                });
            }
      });

  } else {
      // NOT SIGNED IN
      // Send user back to sign in
      logoutExit();
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


function takesUserCreatesHTML(userDocument) {
  let element = document.createElement("div")
  let noSelectString, yesSelectString;
  let totalPoints = userDocument.brotherhoodPoints 
    + userDocument.servicePoints
    + userDocument.pdPoints
    + userDocument.generalPoints;
  if (userDocument.deiFulfilled == "true") {
    yesSelectString = "selected";
    noSelectString = "";
  } else if (userDocument.deiFulfilled == "false") {
    yesSelectString = "";
    noSelectString = "selected";
  }
  element.setAttribute("class", "row")
  element.setAttribute("style", "padding:10px")
  element.innerHTML =
      `<div class="col-lg-2">
        <img src="${userDocument.pictureLink}" style="width:100%" />
      </div>
      <div class="col-lg-2">
        <h5>${userDocument.firstname} ${userDocument.lastname}</h5>
      </div>
      <div class="col-lg-6">
        <div class="row points-padding">
          <div class="col-md-6">
            <label for="brotherhoodPoints-${userDocument.uid}">Brotherhood Points: </label>
          </div>
          <div class="col-md-6">
            <input type="number" id="brotherhoodPoints-${userDocument.uid}" name="brotherhoodPoints" step="1" min="0" value="${userDocument.brotherhoodPoints}">
          </div>
        </div>
        
        <div class="row points-padding">
          <div class="col-md-6">
            <label for="servicePoints-${userDocument.uid}">Service Points: </label>
          </div>
          <div class="col-md-6">
            <input type="number" id="servicePoints-${userDocument.uid}" name="servicePoints" step="1" min="0" value="${userDocument.servicePoints}">
          </div>
        </div>

        <div class="row points-padding">
          <div class="col-md-6">
            <label for="pdPoints-${userDocument.uid}">Professional Development Points: </label>
          </div>
          <div class="col-md-6">
            <input type="number" id="pdPoints-${userDocument.uid}" name="pdPoints" step="1" min="0" value="${userDocument.pdPoints}">
          </div>
        </div>

        <div class="row points-padding">
          <div class="col-md-6">
            <label for="generalPoints-${userDocument.uid}">General Points: </label>
          </div>
          <div class="col-md-6">
            <input type="number" id="generalPoints-${userDocument.uid}" name="generalPoints" step="1" min="0" value="${userDocument.generalPoints}">
          </div>
        </div>

        <div class="row points-padding">
          <div class="col-md-6">
            <label for="totalPoints-${userDocument.uid}">Total Points: </label>
          </div>
          <div class="col-md-6">
            <label id="totalPoints-${userDocument.uid}" name="totalPoints">${totalPoints}</label>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <label for="deiPoint-${userDocument.uid}">DEI Fulfillment: </label>
          </div>
          <div class="col-md-6">
            <select name="deiPoint" id="deiPoint-${userDocument.uid}">
              <option value="true" ${yesSelectString}>Yes</option>
              <option value="false" ${noSelectString}>No</option>
            </select>
          </div>
        </div>

      </div>
      <div class="col-2">
        <button class="btn btn-warning updatePoints-btn">Update</button> 
      </div>
      `;
    
      const updatePointsBtn = element.querySelector('.updatePoints-btn');
      updatePointsBtn.addEventListener('click', () => {
        updateUserPoints(userDocument);
      });

      // Send the formatted element back to be appended
      return element;
}

function updateUserPoints(userDocument) {
  const usersRef = db.collection("userData");
  const user_brotherhoodPoints = document.querySelector(`#brotherhoodPoints-${userDocument.uid}`).value;
  const user_servicePoints = document.querySelector(`#servicePoints-${userDocument.uid}`).value;
  const user_pdPoints = document.querySelector(`#pdPoints-${userDocument.uid}`).value;
  const user_generalPoints = document.querySelector(`#generalPoints-${userDocument.uid}`).value;
  const user_deiPoint = document.querySelector(`#deiPoint-${userDocument.uid}`).value;
  var totalPoints = parseInt(user_brotherhoodPoints) + parseInt(user_servicePoints) + parseInt(user_pdPoints) + parseInt(user_generalPoints);
  document.querySelector(`#totalPoints-${userDocument.uid}`).innerHTML = totalPoints;

  const query = usersRef.where('uid', '==', userDocument.uid);
      query.get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            usersRef.doc(doc.id).update({ brotherhoodPoints: parseInt(user_brotherhoodPoints) });
            usersRef.doc(doc.id).update({ servicePoints: parseInt(user_servicePoints) });
            usersRef.doc(doc.id).update({ pdPoints: parseInt(user_pdPoints) });
            usersRef.doc(doc.id).update({ generalPoints: parseInt(user_generalPoints) });
            usersRef.doc(doc.id).update({ deiFulfilled: user_deiPoint });
          });
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
}



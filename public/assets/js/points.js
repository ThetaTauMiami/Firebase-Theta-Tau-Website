import {
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { collection, doc, query, getDocs, where } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { db, auth} from "/config/firebaseConfig.js";

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


const configRef = doc(collection(db, 'config'), 'roles');
let usersRef; // Reference to the document or collection we want to access
let unsubscribe; // Query handler for user information check
let adminCheck; // Query handler for admin uid check


///////////////////// User Authentication ////////////////////////
// Monitor user Authentication state, this will change website contents using javascript functions
const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
      if (!user) {
          window.redirect('/login');
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
// Helper function to check if a user has stored data
const userOwnsSomething = async (userId) => {
    try {
        const userQuery = query(collection(db, "userData"), where("uid", "==", userId));
        const snapshot = await getDocs(userQuery);
        return !snapshot.empty;
    } catch (error) {
        console.error("Error checking user data:", error);
        return false;
    }
};

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
      usersRef = collection(db, 'userData');
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

// Function to export points to CSV
function exportPoints() {

   // Example CSV data format:
   let csvContent = "data:text/csv;charset=utf-8,";
   csvContent += "Name,Brotherhood Points,Service Points,Professional Development Points,General Points,DEI Fulfilled\n";
 
   const usersRef = db.collection('userData');
   usersRef.get().then(querySnapshot => {
     querySnapshot.forEach(doc => {
       const userData = doc.data();
       const row = `${userData.firstname} ${userData.lastname},${userData.brotherhoodPoints},${userData.servicePoints},${userData.pdPoints},${userData.generalPoints},${userData.deiFulfilled}\n`;
       csvContent += row;
     });
 
     // Create a Blob containing the CSV data
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", "user_points.csv");
     document.body.appendChild(link);
 
     // Trigger the download
     link.click();
   }).catch(error => {
     console.error('Error getting users:', error);
   });
}

// Attach exportPoints function to the global window object
window.exportPoints = exportPoints;

function clearPoints() {
  // Ask for confirmation
  const confirmed = window.confirm("Are you sure you want to clear all points?");

  if (!confirmed) {
    return; // If user cancels, do nothing
  }

  const usersRef = db.collection('userData');
  usersRef.get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const docID = doc.id;
      const userData = doc.data(); // Fetch document data
      const curUID = userData.uid; // Access uid field from document data
      
      // Update the user document to reset points to zero and DEI Fulfillment to "false"
      usersRef.doc(docID).update({
        brotherhoodPoints: 0,
        servicePoints: 0,
        pdPoints: 0,
        generalPoints: 0,
        deiFulfilled: "false"
      }).then(() => {
        //console.log("Points cleared successfully for user:", userData.firstname, " ", userData.lastname);
        // Update HTML to reflect changes
        updateHTMLAfterClear(userData);
      }).catch(error => {
        //console.error("Error clearing points for user:", userData.firstname, " ", userData.lastname, "-->", error);
      });
    });
  }).catch(error => {
    console.error('Error getting users:', error);
  });
}

// Function to update HTML after points are cleared
function updateHTMLAfterClear(docID) {
  // Update total points display to show 0
  document.querySelector(`#totalPoints-${docID.uid}`).innerHTML = 0;

  // Update each input field value to 0
  document.querySelector(`#brotherhoodPoints-${docID.uid}`).value = 0;
  document.querySelector(`#servicePoints-${docID.uid}`).value = 0;
  document.querySelector(`#pdPoints-${docID.uid}`).value = 0;
  document.querySelector(`#generalPoints-${docID.uid}`).value = 0;

  // Update DEI Fulfillment select field to "No"
  document.querySelector(`#deiPoint-${docID.uid}`).value = "false";
}



// Attach clearPoints function to the global window object
window.clearPoints = clearPoints;

function updateUserPoints(userDocument) {
  const usersRef = collection(db, "userData");
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



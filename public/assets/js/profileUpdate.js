import { auth, db } from "/config/firebaseConfig.js";
import { collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// DOM elements
const txtFirstname = document.getElementById('txtFirstname');
const txtLastname = document.getElementById('txtLastname');
const txtMajor = document.getElementById('txtMajor');
const txtMinor = document.getElementById('txtMinor');
const txtGradYear = document.getElementById('txtGradYear');
const txtFratClass = document.getElementById('txtFratClass');
const txtLinkedin = document.getElementById('txtLinkedin');
const txtPersonalWeb = document.getElementById('txtPersonalWeb');
const txtGithub = document.getElementById('txtGithub');
const btnUpdateAccountDetails = document.getElementById('btnUpdateAccountDetails');
const successMessage = document.getElementById('successMessage');
const failureMessage = document.getElementById('failureMessage');
const notInitMessage = document.getElementById('notInitMessage');

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

// Populate form fields with user data
const populateFormWithUserData = (userData) => {
  txtFirstname.value = userData.firstname || '';
  txtLastname.value = userData.lastname || '';
  txtMajor.value = userData.major || '';
  txtMinor.value = userData.minor || '';
  txtGradYear.value = userData.gradYear || '';
  txtFratClass.value = userData.fratclass || '';
  txtLinkedin.value = userData.linkedinLink || '';
  txtPersonalWeb.value = userData.personalLink || '';
  txtGithub.value = userData.githubLink || '';
};

// Validate input field
const validateField = (inputElement, errorMessage) => {
  if (!inputElement.checkValidity()) {
    inputElement.style.backgroundColor = "#FFCCCB";
    inputElement.placeholder = errorMessage;
    inputElement.value = "";
    return false;
  }
  inputElement.style.backgroundColor = "";
  return true;
};

// Update user data in Firestore
const updateUserData = async (userDocId, updatedData) => {
  try {
    const userDocRef = doc(db, "userData", userDocId);
    await updateDoc(userDocRef, updatedData);
    console.log("User data updated successfully.");
    successMessage.hidden = false;
    failureMessage.hidden = true;
  } catch (error) {
    console.error("Error updating user data:", error);
    failureMessage.hidden = false;
  }
};

// Handle authentication state change
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  console.log("User signed in:", user.uid);

  const userQuery = query(collection(db, "userData"), where("uid", "==", user.uid));
  const snapshot = await getDocs(userQuery);

  if (snapshot.empty) {
    console.log("User data not found. Redirecting...");
    window.location.replace("account.html");
    return;
  }

  const userData = snapshot.docs[0].data();
  const userDocId = snapshot.docs[0].id;
  populateFormWithUserData(userData);

  // Handle account update
  btnUpdateAccountDetails.onclick = async () => {
    if (
        !validateField(txtFirstname, "You must input a valid first name!") ||
        !validateField(txtLastname, "You must input a valid last name!") ||
        !validateField(txtMajor, "You must input a valid major!") ||
        !validateField(txtGradYear, "You must input a valid graduation year! (1980-2050)") ||
        !validateField(txtFratClass, "You must input a valid fraternity class! (Ex: Kappa)") ||
        !validateField(txtLinkedin, "You must input a valid LinkedIn URL!") ||
        !validateField(txtPersonalWeb, "You must input a valid personal website URL!") ||
        !validateField(txtGithub, "You must input a valid GitHub URL!")
    ) {
      return;
    }

    // Prepare updated user data
    const updatedUserData = {
      firstname: txtFirstname.value,
      lastname: txtLastname.value,
      major: txtMajor.value,
      minor: txtMinor.value,
      gradYear: txtGradYear.value,
      fratclass: txtFratClass.value,
      linkedinLink: txtLinkedin.value,
      personalLink: txtPersonalWeb.value,
      githubLink: txtGithub.value,
    };

    await updateUserData(userDocId, updatedUserData);
  };
});
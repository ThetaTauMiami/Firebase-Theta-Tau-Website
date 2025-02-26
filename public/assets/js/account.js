import {
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import {
    collection,
    doc,
    query,
    where,
    getDocs,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import {
    auth,
    db
} from "/config/firebaseConfig.js";


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



const configRef = doc(collection(db, 'config'), 'roles');
let usersRef; // Reference to the document or collection we want to access
let unsubscribe; // Query handler for user information check
let adminCheck; // Query handler for admin uid check

// Track user's state of loaded ownership
var ownershipLoaded = false;

///////////////////// User Authentication ////////////////////////
// Monitor user Authentication state, this will change website contents using javascript functions
const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log("Logged In")
        } else {
            console.log("Not Logged In")
            window.redirect("/login")
        }
    })
}

monitorAuthState();

// Log out
const logout = async () => {
    await signOut(auth);
}

const logoutExit = () => {
    signOut(auth).then(() => {
        window.location.replace('login.html');
    }).catch((err) => {
        console.error(`Error Logging Out: ${err}`);
    });
}


////////////////////// FUNCTIONS ///////////////////////////////////
// Function to check if a user owns any items in the Cloud Firestore database
const userOwnsSomething = async (userId) => {
    try {
        const userRef = collection(db, "userData");
        const userQuery = query(userRef, where("uid", "==", userId));
        const querySnapshot = await getDocs(userQuery);

        return !querySnapshot.empty; // Returns true if the user owns data, false otherwise
    } catch (error) {
        console.error("Error checking user ownership:", error);
        return false; // Return false if there's an error
    }
};

function pointsColorDeterminer(numPoints) {
    if (numPoints <= 0) {
        return "color: #8a0108";
    } else if (numPoints === 1) {
        return "color: #e80602";
    } else if (numPoints === 2) {
        return "color: #f56302";
    } else if (numPoints === 3) {
        return "color: #F8B324";
    } else if (numPoints === 4) {
        return "color: #67d962";
    } else {
        // Assuming 5 or more
        return "color: #08a300";
    }
}

function totalPointsColorDeterminer(numPoints) {
    if (numPoints <= 4) {
        return "color: #8a0108";
    } else if (numPoints <= 8) {
        return "color: #e80602";
    } else if (numPoints <= 12) {
        return "color: #f56302";
    } else if (numPoints <= 16) {
        return "color: #F8B324";
    } else if (numPoints < 20) {
        return "color: #67d962";
    } else {
        // Assuming 20 or more
        return "color: #08a300";
    }
}

function deiFormatter(deiFulfillment) {
    if (deiFulfillment == 'true') {
        return "Yes";
    } else if (deiFulfillment == 'false') {
        return "No";
    } else {
        return "Invalid DEI point format";
    }
}

function deiPointColor(deiFulfillment) {
    if (deiFulfillment == 'true') {
        return "color: #08a300";
    } else if (deiFulfillment == 'false') {
        return "color: #e80602";
    } else {
        return "Black";
    }
}


function updatePointsChart(bhoodP, serviceP, professionalDevelopmentP, generalP) {
    let totalP = bhoodP + serviceP + professionalDevelopmentP + generalP;
    const xValues = ["Brotherhood", "Service", "Professional Development", "General", "Total"];
    const yValues = [bhoodP, serviceP, professionalDevelopmentP, generalP, totalP];
    const barColors = ["red", "green", "blue", "orange", "purple"];

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

auth.onAuthStateChanged(user => {
    if (user) {
        handleUserSignedIn(user);
    } else {
        handleUserSignedOut();
    }
});

function handleUserSignedIn(user) {
    usersRef = collection(db, 'userData');

    // Hide Signed-Out Content
    divSignedOutUser.hidden = true;

    checkIfAccountSetup(usersRef, user.uid);

    userOwnsSomething(user.uid).then(userOwnsThings => {
        // console.log("User owns things? ", userOwnsThings);
        if (!userOwnsThings) {
            showFirstLoginUI();
        } else {
            fetchUserData(user);
            checkIfAdmin(user);
            showMainUI();
        }
    });

    btnMakeAccountDetails.onclick = handleAccountDetailsSubmission;
}

function checkIfAccountSetup(usersRef, userId) {
    const userRef = doc(usersRef, userId);

    getDoc(userRef)
        .then(docSnapshot => {
            if (!docSnapshot.exists()) {
                // console.log("User has no profile setup, prompting first-time login setup.");
                showFirstLoginUI();
            }
        })
        .catch(error => console.error("Error checking account setup:", error));
}

function handleUserSignedOut() {
    divFirstLoginPrompt.hidden = true;
    divFirstLoginForm.hidden = true;
    divFullUser.hidden = true;
    loggedInNavbar.hidden = true;
    divSignedOutUser.hidden = false;
    unsubscribe && unsubscribe();
}

function showFirstLoginUI() {
    divFirstLoginPrompt.hidden = false;
    divFirstLoginForm.hidden = false;
    divFullUser.hidden = true;
    loggedInNavbar.hidden = true;
    updatePointsSection.style.display = 'none';
}

const fetchUserData = async (user) => {
    try {
        const userQuery = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(userQuery);

        clearPreviousUserData();

        querySnapshot.forEach(doc => updateUserProfile(doc.data()));
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
};


function clearPreviousUserData() {
    document.getElementById('photoArea').innerHTML = '';
    document.getElementById('bhoodPoints').innerHTML = '';
    document.getElementById('servicePoints').innerHTML = '';
    document.getElementById('pdPoints').innerHTML = '';
    document.getElementById('generalPoints').innerHTML = '';
}

function updateUserProfile(profile) {
    const {
        firstname,
        lastname,
        gradYear,
        fratclass,
        brotherhoodPoints,
        pdPoints,
        servicePoints,
        generalPoints,
        deiFulfilled,
        pictureLink
    } = profile;

    let totalPoints = brotherhoodPoints + servicePoints + pdPoints + generalPoints;

    document.getElementById('photoArea').innerHTML = `<img src='${pictureLink}' alt='Theta Tau Brother Headshot' loading="lazy"  width='331' height='496'>`;
    setPointsDisplay('bhoodPoints', brotherhoodPoints);
    setPointsDisplay('servicePoints', servicePoints);
    setPointsDisplay('pdPoints', pdPoints);
    setPointsDisplay('generalPoints', generalPoints);
    setPointsDisplay('totalPoints', totalPoints);
    setDEIDisplay('deiPoint', deiFulfilled);

    txtNavbarName.innerHTML = `Welcome, ${firstname} ${lastname}!`;
    updatePointsChart(brotherhoodPoints, servicePoints, pdPoints, generalPoints);
}

function setPointsDisplay(elementId, points) {
    const element = document.getElementById(elementId);
    element.innerHTML = `${points}`;
    element.style = pointsColorDeterminer(points);
}

function setDEIDisplay(elementId, deiFulfilled) {
    const element = document.getElementById(elementId);
    element.innerHTML = `${deiFormatter(deiFulfilled)}`;
    element.style = deiPointColor(deiFulfilled);
}

async function checkIfAdmin(user) {
    try {
        const docSnapshot = await getDoc(configRef);

        if (docSnapshot.exists()) {
            const admins = docSnapshot.data().admins;
            if (admins && admins.includes(user.uid)) {
                updatePointsSection.style.display = 'list-item';
            }
        }
    } catch (error) {
        console.error("Error getting document:", error);
    }
}

function showMainUI() {
    divFirstLoginPrompt.hidden = true;
    divFirstLoginForm.hidden = true;
    divFullUser.hidden = false;
    loggedInNavbar.hidden = false;
}

function handleAccountDetailsSubmission() {
    const formData = {
        firstname: txtFirstnameEntry.value,
        lastname: txtLastnameEntry.value,
        major: txtMajorEntry.value,
        minor: txtMinorEntry.value,
        gradYear: txtGradYearEntry.value,
        fratclass: txtFratClassEntry.value,
        linkedin: txtLinkedinEntry.value,
        personalWeb: txtPersonalWebEntry.value,
        github: txtGitHubEntry.value
    };

    if (!validateFormFields(formData)) return;

    usersRef.add({
        uid: auth.currentUser.uid,
        fratclass: formData.fratclass,
        brotherhoodPoints: 0,
        pdPoints: 0,
        servicePoints: 0,
        generalPoints: 0,
        deiFulfilled: "false",
        firstname: formData.firstname,
        lastname: formData.lastname,
        major: formData.major,
        minor: formData.minor,
        gradYear: formData.gradYear,
        pictureLink: 'https://drive.google.com/uc?export=view&id=1AwJ9tWv0SagtDnE8U1NejxV2rpwOE8mD',
        linkedinLink: formData.linkedin,
        personalLink: formData.personalWeb,
        githubLink: formData.github
    });

    showMainUI();
    setTimeout(() => location.reload(true), 500);
}

function validateFormFields(formData) {
    let isValid = true;
    const fields = [
        { element: txtFirstnameEntry, value: formData.firstname, placeholder: "You must input a valid first name!" },
        { element: txtLastnameEntry, value: formData.lastname, placeholder: "You must input a valid last name!" },
        { element: txtMajorEntry, value: formData.major, placeholder: "You must input a valid major!" },
        { element: txtGradYearEntry, value: formData.gradYear, placeholder: "You must input a valid graduation year! (1980-2050)" },
        { element: txtFratClassEntry, value: formData.fratclass, placeholder: "You must input a valid fraternity class! (Ex: Kappa)" },
        { element: txtLinkedinEntry, value: formData.linkedin, placeholder: "You must input a valid LinkedIn URL!" },
        { element: txtPersonalWebEntry, value: formData.personalWeb, placeholder: "You must input a valid personal website URL!" },
        { element: txtGitHubEntry, value: formData.github, placeholder: "You must input a valid GitHub URL!" }
    ];

    fields.forEach(({ element, value, placeholder }) => {
        if (!element.checkValidity()) {
            element.style = "width:95%; margin: auto; background-color: #FFCCCB;";
            element.placeholder = placeholder;
            element.classList.add('placeholderInvalid');
            element.classList.add('placeholderInvalid::placeholder');
            element.value = "";
            isValid = false;
        }
    });

    return isValid;
}
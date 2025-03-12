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
    getDoc,
    addDoc
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import {
    auth,
    db
} from "/config/firebaseConfig.js";

// Import the first login component
import "../../components/account/firstLogin.js";

// DOM elements
// First Login Component - Now using the component instead
let firstLoginComponent;

// Text Areas
const txtNavbarName = document.querySelector('#userNameNavbar');

// Get the canvas element
var ctx = document.getElementById('pointsChart').getContext('2d');

// Logged-In User Sections
const divFullUser = document.querySelector('#fullUser');
const loggedInNavbar = document.querySelector('#loggedInNavbar');
const logoutHeader = document.querySelector('#logoutHeader');

// Logged-Out User Sections
const divSignedOutUser = document.querySelector('#signedOutUser');

// Return to Login Button
const btnLoginReturn = document.querySelector('#btnLoginReturn');

// Points Update Button (ADMINS ONLY)
const updatePointsSection = document.querySelector('#updatePointsSection');

const configRef = doc(collection(db, 'config'), 'roles');
let usersRef; // Reference to the document or collection we want to access
let unsubscribe; // Query handler for user information check

// Initialize DOM elements after they're loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get component after DOM is loaded
    firstLoginComponent = document.querySelector('first-login-component');

    // Listen for the custom event from the first-login component
    if (firstLoginComponent) {
        firstLoginComponent.addEventListener('firstLoginSubmit', handleFirstLoginSubmission);
    }

    // Add event listener to logout buttons
    if (btnLoginReturn) {
        btnLoginReturn.addEventListener("click", logoutExit);
    }

    if (logoutHeader) {
        logoutHeader.addEventListener("click", logoutExit);
    }
});

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
    if (!ctx) return; // Safety check

    let totalP = bhoodP + serviceP + professionalDevelopmentP + generalP;
    const xValues = ["Brotherhood", "Service", "Professional Development", "General", "Total"];
    const yValues = [bhoodP, serviceP, professionalDevelopmentP, generalP, totalP];
    const barColors = ["red", "green", "blue", "orange", "purple"];

    // Create the bar chart
    new Chart(ctx, {
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

const logoutExit = () => {
    signOut(auth).then(() => {
        window.location.replace('login.html');
    }).catch((err) => {
        console.error(`Error Logging Out: ${err}`);
    });
}

// Set up auth state change listener
auth.onAuthStateChanged(user => {
    if (user) {
        handleUserSignedIn(user);
    } else {
        handleUserSignedOut();
    }
});

async function handleUserSignedIn(user) {
    console.log("User is signed in:", user.uid);
    usersRef = collection(db, 'userData');

    // Hide Signed-Out Content
    if (divSignedOutUser) {
        divSignedOutUser.hidden = true;
    }

    try {
        // Check if user has account data
        const hasData = await userOwnsSomething(user.uid);

        if (!hasData) {
            console.log("First-time user detected, showing setup form");
            showFirstLoginUI();
        } else {
            console.log("Returning user detected, showing main UI");
            await fetchUserData(user);
            await checkIfAdmin(user);
            showMainUI();
        }
    } catch (error) {
        console.error("Error in user initialization:", error);
    }
}

function handleUserSignedOut() {
    console.log("User is signed out");

    if (firstLoginComponent) {
        firstLoginComponent.hide();
    }

    if (divFullUser) {
        divFullUser.hidden = true;
    }

    if (loggedInNavbar) {
        loggedInNavbar.hidden = true;
    }

    if (divSignedOutUser) {
        divSignedOutUser.hidden = false;
    }

    // Clear any subscriptions
    if (unsubscribe) {
        unsubscribe();
    }
}

function showFirstLoginUI() {
    console.log("Showing first login UI");

    if (firstLoginComponent) {
        firstLoginComponent.show();
    }

    if (divFullUser) {
        divFullUser.hidden = true;
    }

    if (loggedInNavbar) {
        loggedInNavbar.hidden = true;
    }

    if (updatePointsSection) {
        updatePointsSection.style.display = 'none';
    }
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
    const photoArea = document.getElementById('photoArea');
    const bhoodPoints = document.getElementById('bhoodPoints');
    const servicePoints = document.getElementById('servicePoints');
    const pdPoints = document.getElementById('pdPoints');
    const generalPoints = document.getElementById('generalPoints');

    if (photoArea) photoArea.innerHTML = '';
    if (bhoodPoints) bhoodPoints.innerHTML = '';
    if (servicePoints) servicePoints.innerHTML = '';
    if (pdPoints) pdPoints.innerHTML = '';
    if (generalPoints) generalPoints.innerHTML = '';
}

function updateUserProfile(profile) {
    if (!profile) return;

    const {
        firstname,
        lastname,
        brotherhoodPoints = 0,
        pdPoints = 0,
        servicePoints = 0,
        generalPoints = 0,
        deiFulfilled = 'false',
        pictureLink = 'https://drive.google.com/uc?export=view&id=1AwJ9tWv0SagtDnE8U1NejxV2rpwOE8mD'
    } = profile;

    let totalPoints = brotherhoodPoints + servicePoints + pdPoints + generalPoints;

    const photoArea = document.getElementById('photoArea');
    if (photoArea) {
        photoArea.innerHTML = `<img src='${pictureLink}' alt='Theta Tau Brother Headshot' loading="lazy" width='331' height='496'>`;
    }

    setPointsDisplay('bhoodPoints', brotherhoodPoints);
    setPointsDisplay('servicePoints', servicePoints);
    setPointsDisplay('pdPoints', pdPoints);
    setPointsDisplay('generalPoints', generalPoints);
    setPointsDisplay('totalPoints', totalPoints);
    setDEIDisplay('deiPoint', deiFulfilled);

    if (txtNavbarName) {
        txtNavbarName.innerHTML = `Welcome, ${firstname} ${lastname}!`;
    }

    updatePointsChart(brotherhoodPoints, servicePoints, pdPoints, generalPoints);
}

function setPointsDisplay(elementId, points) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `${points}`;
        element.style = pointsColorDeterminer(points);
    }
}

function setDEIDisplay(elementId, deiFulfilled) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `${deiFormatter(deiFulfilled)}`;
        element.style = deiPointColor(deiFulfilled);
    }
}

async function checkIfAdmin(user) {
    try {
        const docSnapshot = await getDoc(configRef);

        if (docSnapshot.exists()) {
            const admins = docSnapshot.data().admins;
            if (admins && admins.includes(user.uid) && updatePointsSection) {
                updatePointsSection.style.display = 'list-item';
            }
        }
    } catch (error) {
        console.error("Error getting document:", error);
    }
}

function showMainUI() {
    console.log("Showing main UI");

    if (firstLoginComponent) {
        firstLoginComponent.hide();
    }

    if (divFullUser) {
        divFullUser.hidden = false;
    }

    if (loggedInNavbar) {
        loggedInNavbar.hidden = false;
    }
}

// Handle the submission event from the first-login component
function handleFirstLoginSubmission(event) {
    const formData = event.detail;
    console.log("First login form submitted:", formData);

    if (!auth.currentUser) {
        console.error("No authenticated user found");
        return;
    }

    addDoc(usersRef, {
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
    }).then(() => {
        console.log("User data added successfully");
        showMainUI();
        // Use a short timeout to allow database operations to complete
        setTimeout(() => location.reload(true), 500);
    }).catch(error => {
        console.error("Error adding user data:", error);
    });
}
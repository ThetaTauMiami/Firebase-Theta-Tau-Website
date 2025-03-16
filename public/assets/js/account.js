import {
    onAuthStateChanged
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

// Store current user data
let currentUser = null;
let userData = null;
let userDocId = null;
let isAdmin = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log("Account page initializing...");

    // Setup auth state listener
    setupAuthStateListener();
});

// Setup auth state change listener
function setupAuthStateListener() {
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            fetchUserData(user).then(() => {
                // Once data is fetched, update all UI components
                updateProfileUI(userData);
                updatePointsChart(userData);
                updateCalendarUI(userData);
            });
        } else {
            // Redirect to login page if not authenticated
            window.location.replace('login.html');
        }
    });
}

// Fetch user data from Firestore
async function fetchUserData(user) {
    try {
        // Query user data
        const userRef = collection(db, "userData");
        const userQuery = query(userRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
            const docSnapshot = querySnapshot.docs[0];
            userData = docSnapshot.data();
            userDocId = docSnapshot.id;

            // Check if user is admin
            await checkIfAdmin(user);

            return userData;
        } else {
            console.error("No user data found");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}

// Check if user is admin
async function checkIfAdmin(user) {
    try {
        const configRef = doc(db, "config", "roles");
        const docSnapshot = await getDoc(configRef);

        if (docSnapshot.exists()) {
            const admins = docSnapshot.data().admins;
            isAdmin = admins && admins.includes(user.uid);

            // Update navbar with admin status
            const navbarComponent = $('logged-in-navbar')[0];
            if (navbarComponent) {
                navbarComponent.showAdminFeatures(isAdmin);
            }

            return isAdmin;
        }

        return false;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

// Method to update profile information on the page
function updateProfileUI(userData) {
    console.log("Updating profile UI");

    if (!userData) return;

    // Extract user data with defaults for missing fields
    const {
        firstname = "",
        lastname = "",
        major = "",
        minor = "",
        gradYear = "",
        fratclass = "",
        linkedinLink = "",
        personalLink = "",
        githubLink = "",
        pictureLink = 'https://drive.google.com/uc?export=view&id=1AwJ9tWv0SagtDnE8U1NejxV2rpwOE8mD'
    } = userData;

    // Update profile photo in the profile-img div
    $('.profile-img').css({
        'background-image': `url('${pictureLink}')`,
        'background-size': 'cover',
        'background-position': 'center'
    });

    // Update name
    $('#name').text(`${firstname} ${lastname}`);

    // Update college year (graduation year)
    $('#collegeYear').text(`Class of ${gradYear}`);

    // Update fraternity class
    $('#fraternityClass').text(`${fratclass} Class`);

    // Update major/minor
    let majorMinorText = major;
    if (minor && minor.trim() !== "") {
        majorMinorText += ` with a minor in ${minor}`;
    }
    $('#major').text(majorMinorText);

    // Update LinkedIn
    if (linkedinLink) {
        $('#linkedin').html(`<a href="${linkedinLink}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`);
    }

    // Update GitHub
    if (githubLink) {
        $('#github').html(`<a href="${githubLink}" target="_blank" rel="noopener noreferrer">GitHub</a>`);
    }

    // Update personal site
    if (personalLink) {
        $('#personalSite').html(`<a href="${personalLink}" target="_blank" rel="noopener noreferrer">Personal Website</a>`);
    }

    // Update username in navbar
    const navbarComponent = $('logged-in-navbar')[0];
    if (navbarComponent) {
        navbarComponent.setUserName(`Welcome, ${firstname} ${lastname}!`);
    }
}

// Method to update points chart
function updatePointsChart(userData) {
    console.log("Updating points chart");

    if (!userData) return;

    const {
        brotherhoodPoints = 0,
        pdPoints = 0,
        servicePoints = 0,
        generalPoints = 0
    } = userData;

    // Update points displays
    updatePointsDisplay('bhoodPoints', brotherhoodPoints);
    updatePointsDisplay('servicePoints', servicePoints);
    updatePointsDisplay('pdPoints', pdPoints);
    updatePointsDisplay('generalPoints', generalPoints);
    updatePointsDisplay('totalPoints', brotherhoodPoints + servicePoints + pdPoints + generalPoints);

    if (userData.deiFulfilled !== undefined) {
        updateDEIDisplay('deiPoint', userData.deiFulfilled);
    }

    // Update chart if canvas exists
    const ctx = $('#pointsChart');
    if (ctx.length && typeof Chart !== 'undefined') {
        // Check if chart instance already exists
        if (window.pointsChart instanceof Chart) {
            window.pointsChart.destroy();
        }

        // Create new chart
        window.pointsChart = new Chart(ctx[0].getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Brotherhood', 'Service', 'Professional', 'General'],
                datasets: [{
                    data: [brotherhoodPoints, servicePoints, pdPoints, generalPoints],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Method to update calendar
function updateCalendarUI(userData) {
    console.log("Updating calendar UI");

    // Calendar implementation would go here
    // This would render upcoming events or activities
}

// Helper function to update points display
function updatePointsDisplay(elementId, points) {
    $(`#${elementId}`).text(points);

    // Add color styling based on point value
    if (typeof pointsColorDeterminer === 'function') {
        $(`#${elementId}`).attr('style', pointsColorDeterminer(points));
    }
}

// Helper function to update DEI status display
function updateDEIDisplay(elementId, status) {
    const element = $(`#${elementId}`);

    // Format the status text
    element.text(status === "true" ? "Complete" : "Incomplete");

    // Add color styling
    element.attr('style', status === "true" ?
        "color: green; font-weight: bold;" :
        "color: red; font-weight: bold;"
    );
}

// Expose methods
window.accountPage = {
    updateProfileUI,
    updatePointsChart,
    updateCalendarUI
};
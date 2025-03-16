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
    // If pictureLink exists, update the image source
    if (pictureLink) {
        $('.profile-img img').attr('src', pictureLink);
    }

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
        // Extract the username from LinkedIn URL using regex
        const linkedinUsername = linkedinLink.match(/linkedin\.com\/in\/([^\/\?]+)/i);
        const displayText = linkedinUsername ? `in/${linkedinUsername[1]}` : linkedinLink;
    $('#linkedin').html(`<a href="${linkedinLink}" target="_blank" rel="noopener noreferrer">${displayText}</a>`);
    }

    // Update GitHub
    if (githubLink) {
        // Extract the username from GitHub URL using regex
        const githubUsername = githubLink.match(/github\.com\/([^\/\?]+)/i);
        const displayText = githubUsername ? `github.com/${githubUsername[1]}` : githubLink;
        $('#github').html(`<a href="${githubLink}" target="_blank" rel="noopener noreferrer">${displayText}</a>`);
    }

    // Update personal site
    if (personalLink) {
        // For personal site, just remove http(s):// and trailing slash
        const displayText = personalLink.replace(/^https?:\/\//i, '').replace(/\/$/,'');
        $('#personalSite').html(`<a href="${personalLink}" target="_blank" rel="noopener noreferrer">${displayText}</a>`);
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

    console.log(userData);
    const {
        brotherhoodPoints = 0,
        pdPoints = 0,
        servicePoints = 0,
        generalPoints = 0,
    } = userData;

    const deiPoints = userData.deiFulfilled === true ? 1 : 0;

    // Points to Achieve
    const maxPoints = {
        brotherhood: 6,
        pd: 6,
        service: 6,
        dei: 1,
        general: 6
    };

    // Define the categories with their data
    const categories = [
        { name: 'Brotherhood', points: brotherhoodPoints, max: maxPoints.brotherhood, color: '#4285F4' },
        { name: 'Professional Development', points: pdPoints, max: maxPoints.pd, color: '#EA4335' },
        { name: 'Service', points: servicePoints, max: maxPoints.service, color: '#FBBC05' },
        { name: 'DEI', points: deiPoints, max: maxPoints.dei, color: '#34A853' },
        { name: 'General', points: generalPoints, max: maxPoints.general, color: '#8758FF' }
    ];

    // Calculate total max points and current total
    const totalMax = Object.values(maxPoints).reduce((sum, val) => sum + val, 0);
    const currentTotal = categories.reduce((sum, cat) => sum + Math.min(cat.points, cat.max), 0);

    // Create or update the chart container
    let chartContainer = $('#points-chart');
    if (chartContainer.length === 0) {
        $('body').append('<div id="points-chart" class="points-chart-container"></div>');
        chartContainer = $('#points-chart');
    }

    // Clear existing content
    chartContainer.empty();

    // Add title and total progress
    chartContainer.append(`
        <div class="chart-header">
            <h3>Progress Tracker: ${currentTotal}/${totalMax} points</h3>
        </div>
    `);

    // Create the progress bar container
    chartContainer.append(`
        <div class="single-progress-container">
            <div class="single-progress-bar"></div>
        </div>
    `);

    const progressBar = chartContainer.find('.single-progress-bar');

    // Track the total width used so far
    let currentPosition = 0;

    // Add filled segments for each category, all justified to the left
    categories.forEach(category => {
        // Calculate how many points this category contributes to the total
        const categoryPercentage = (category.max / totalMax) * 100;

        // Calculate how many points are filled in this category
        const actualPoints = Math.min(category.points, category.max);
        const pointsPercentage = (actualPoints / totalMax) * 100;

        if (pointsPercentage > 0) {
            progressBar.append(`
                <div class="progress-segment" 
                     style="left: ${currentPosition}%; 
                            width: ${pointsPercentage}%; 
                            background-color: ${category.color};">
                </div>
            `);

            currentPosition += pointsPercentage;
        }

        // Add segment divider/marker at the end of where this category should be
        const markerPosition = currentPosition + (categoryPercentage - pointsPercentage);
        if (markerPosition < 100) {
            progressBar.append(`
                <div class="segment-divider" style="left: ${markerPosition}%;"></div>
            `);
        }
    });

    // Add legend below the bar
    chartContainer.append('<div class="chart-legend"></div>');
    const legend = chartContainer.find('.chart-legend');

    categories.forEach(category => {
        legend.append(`
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${category.color};"></div>
                <div class="legend-text">${category.name}: ${category.points}/${category.max}</div>
            </div>
        `);
    });

    // Add CSS if it doesn't exist
    if ($('#points-chart-styles').length === 0) {
        $('head').append(`
            <style id="points-chart-styles">
                .points-chart-container {
                    margin: 30px 0;
                    padding: 20px;
                    border-radius: 8px;
                    background-color: #f5f5f5;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    position: relative;
                    font-family: Arial, sans-serif;
                }
                .chart-header {
                    margin-bottom: 20px;
                    text-align: center;
                }
                .chart-header h3 {
                    margin: 0;
                    font-size: 18px;
                }
                .single-progress-container {
                    height: 30px;
                    background-color: #e0e0e0;
                    border-radius: 15px;
                    overflow: hidden;
                    margin-bottom: 20px;
                    position: relative;
                }
                .single-progress-bar {
                    height: 100%;
                    width: 100%;
                    position: relative;
                }
                .progress-segment {
                    height: 100%;
                    position: absolute;
                    top: 0;
                }
                .segment-divider {
                    position: absolute;
                    height: 100%;
                    width: 2px;
                    background-color: #fff;
                    top: 0;
                }
                .chart-legend {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 10px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                }
                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    margin-right: 5px;
                }
                .legend-text {
                    font-size: 14px;
                }
            </style>
        `);
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
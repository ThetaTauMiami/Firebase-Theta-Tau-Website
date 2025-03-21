import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { collection, doc, query, getDocs, getDoc, where, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { db, auth } from "/config/firebaseConfig.js";

// DOM Elements
const divFullUser = document.querySelector('#fullUser');
const loggedInNavbar = document.querySelector('#loggedInNavbar');
const logoutHeader = document.querySelector('#logoutHeader');
const divSignedOutUser = document.querySelector('#signedOutUser');
const btnLoginReturn = document.querySelector('#btnLoginReturn');
const updatePointsSection = document.querySelector('#updatePointsSection');
const memberList = document.getElementById('memberList');

// Firestore References
const configRef = doc(db, 'config', 'roles');
const usersRef = collection(db, 'userData');

// Monitor Authentication State
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("User is not logged in. Redirecting to login...");
        window.location.href = "/login.html";
        return;
    }

    console.log(`User logged in: ${user.uid}`);

    // Hide Signed-Out Content
    divSignedOutUser.hidden = true;

    // Check if user has account setup
    if (!(await userOwnsSomething(user.uid))) {
        console.log("User has no profile setup, redirecting...");
        window.location.href = "/account.html";
        return;
    }

    // Check if user is an admin
    await checkIfAdmin(user);

    // Listen for changes in user data
    // unsubscribe = onSnapshot(query(usersRef, where("uid", "==", user.uid)), (querySnapshot) => {
    //     clearPreviousUserData();
    //     querySnapshot.forEach(doc => updateUserProfile(doc.data()));
    // });

});

// Check if user owns something (has data in Firestore)
const userOwnsSomething = async (userId) => {
    try {
        const snapshot = await getDocs(query(usersRef, where("uid", "==", userId)));
        return !snapshot.empty;
    } catch (error) {
        console.error("Error checking user data:", error);
        return false;
    }
};

// Check if user is an admin
const checkIfAdmin = async (user) => {
    try {
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
            const admins = docSnap.data().admins || [];
            if (admins.includes(user.uid)) {
                console.log("User is an admin");
                updatePointsSection.style.display = 'list-item';
                loadAllUsersForAdmin();
            } else {
                console.log("User is not an admin, redirecting...");
                window.location.href = "/account.html";
            }
        }
    } catch (error) {
        console.error("Error checking admin status:", error);
    }
};

// Load all users for admin view
const loadAllUsersForAdmin = async () => {
    try {
        const snapshot = await getDocs(usersRef);
        snapshot.forEach(doc => {
            const userData = doc.data();
            const userRow = createUserElement(userData);
            memberList.appendChild(userRow);
            memberList.appendChild(document.createElement("br"));
        });
    } catch (error) {
        console.error("Error getting users:", error);
    }
};

// Create HTML for a user row
const createUserElement = (userData) => {
    const element = document.createElement("div");
    element.classList.add("row", "user-row");
    element.style.padding = "10px";

    const totalPoints = (parseInt(userData.brotherhoodPoints, 10) || 0) +
        (parseInt(userData.servicePoints, 10) || 0) +
        (parseInt(userData.pdPoints, 10) || 0) +
        (parseInt(userData.generalPoints, 10) || 0);

    console.log(userData)
    const deiFulfilled = userData.deiFulfilled;
    console.log(`User DEI Fulfilled: ${deiFulfilled}`);
    element.innerHTML = `
        <div class="col-lg-2"><img src="${userData.pictureLink}"  loading="lazy" style="width:100%" /></div>
        <div class="col-lg-2"><h5>${userData.firstname} ${userData.lastname}</h5></div>
        <div class="col-lg-6">
            ${createPointsInput("Brotherhood", userData.uid, userData.brotherhoodPoints)}
            ${createPointsInput("Service", userData.uid, userData.servicePoints)}
            ${createPointsInput("Professional Development", userData.uid, userData.pdPoints)}
            ${createPointsInput("General", userData.uid, userData.generalPoints)}
            <div class="row points-padding">
                <div class="col-md-6"><label>Total Points:</label></div>
                <div class="col-md-6"><label id="totalPoints-${userData.uid}">${totalPoints}</label></div>
            </div>
            <div class="row">
                <div class="col-md-6"><label>DEI Fulfillment:</label></div>
                <div class="col-md-6">
                    <select id="deiPoint-${userData.uid}">
                        <option value="true" ${deiFulfilled ? "selected" : ""}>Yes</option>
                    <option value="false" ${!deiFulfilled ? "selected" : ""}>No</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="col-2">
            <button class="btn btn-warning updatePoints-btn">Update</button> 
        </div>
    `;

    element.querySelector('.updatePoints-btn').addEventListener('click', () => updateUserPoints(userData));
    return element;
};

// Generate HTML for individual point fields
const createPointsInput = (label, uid, value) => `
    <div class="row points-padding">
        <div class="col-md-6"><label>${label} Points:</label></div>
        <div class="col-md-6">
            <input type="number" id="${label.toLowerCase().replace(/\s+/g, '')}Points-${uid}" min="0" value="${Number.parseInt(value) ?? 0}">
        </div>
    </div>
`;

const getSafeNumber = (id) => {
    const input = document.querySelector(id);
    return input ? parseInt(input.value, 10) || 0 : 0;
};

async function updateUserPoints(userDocument) {
    try {
        const userRef = collection(db, "userData");
        const userQuery = query(userRef, where("uid", "==", userDocument.uid));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
            console.error(`No document found for user: ${userDocument.uid}`);
            return;
        }

        const docRef = querySnapshot.docs[0].ref; // Get the first matching document reference

        // Use it for all point fields
        const user_pdPoints = getSafeNumber(`#professionaldevelopmentPoints-${userDocument.uid}`);
        const user_brotherhoodPoints = getSafeNumber(`#brotherhoodPoints-${userDocument.uid}`);
        const user_servicePoints = getSafeNumber(`#servicePoints-${userDocument.uid}`);
        const user_generalPoints = getSafeNumber(`#generalPoints-${userDocument.uid}`);
        const user_deiPoint = document.querySelector(`#deiPoint-${userDocument.uid}`).value;

        const totalPoints = user_brotherhoodPoints + user_servicePoints + user_pdPoints + user_generalPoints;
        document.querySelector(`#totalPoints-${userDocument.uid}`).innerHTML = totalPoints;

        // Update Firestore document
        await updateDoc(docRef, {
            brotherhoodPoints: user_brotherhoodPoints,
            servicePoints: user_servicePoints,
            pdPoints: user_pdPoints,
            generalPoints: user_generalPoints,
            deiFulfilled: user_deiPoint
        });

        console.log(`User points updated for ${userDocument.uid}`);

    } catch (error) {
        console.error("Error updating user points:", error);
    }
}

// Get updated input value
const getUpdatedValue = (label, uid) => parseInt(document.querySelector(`#${label.toLowerCase().replace(/\s+/g, '')}Points-${uid}`).value) || 0;

// Logout function
const logout = async () => {
    await signOut(auth);
    window.location.href = "/login.html";
};

// Attach logout functions
logoutHeader.addEventListener("click", logout);
btnLoginReturn.addEventListener("click", logout);
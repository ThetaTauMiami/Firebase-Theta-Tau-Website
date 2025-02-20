// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";


// Firebase Configuration (Replace with your actual Firebase credentials)
const firebaseConfig = {
    apiKey: "AIzaSyCuS3TWRtitOxxjJ3gyb-lxH2kmu2N0Ij8",
    authDomain: "thetataumiamiuniversity.firebaseapp.com",
    projectId: "thetataumiamiuniversity",
    storageBucket: "thetataumiamiuniversity.appspot.com",
    messagingSenderId: "752928414181",
    appId: "1:752928414181:web:d70dbd3f4ed11077e7b70c",
    measurementId: "G-BTNR03FCB4"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Set authentication persistence to keep users logged in across page reloads
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        // console.log("Persistence set to browserLocalPersistence");
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });

function giveFirestore() {
    return getFirestore(firebaseApp);
}

export { firebaseConfig, firebaseApp, auth, db, giveFirestore };
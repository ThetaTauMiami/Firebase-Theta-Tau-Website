// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";
import ENV from "./env-config.js";

// Firebase Configuration (Replace with your actuacll Firebase credentials)
const firebaseConfig = {
    apiKey: ENV.FIREBASE_API_KEY,
    authDomain: ENV.FIREBASE_AUTH_DOMAIN,
    projectId: ENV.FIREBASE_PROJECT_ID,
    storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
    appId: ENV.FIREBASE_APP_ID,
    measurementId: ENV.FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

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

export { firebaseConfig, firebaseApp, auth, db, storage, giveFirestore };
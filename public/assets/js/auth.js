// auth.js (Used on Every Page That Needs Auth)
import { auth } from "/config/firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user.email);
            document.getElementById("loginNav").style.display = "none";
            document.getElementById("accountNav").style.display = "block";
        } else {
            console.log("No user is logged in");
            document.getElementById("loginNav").style.display = "block";
            document.getElementById("accountNav").style.display = "none";
        }
    });

    // Logout Event Listener
    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            window.location.href = "login.html"; // Redirect after logout
        });
    }
});
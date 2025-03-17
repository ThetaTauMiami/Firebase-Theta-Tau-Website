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

// Custom component for logged-in navigation bar in account pages
class LoggedInNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Create styles
        const style = document.createElement("style");
        style.textContent = `
            :host {
                display: block;
                width: 100%;
                margin-bottom: 20px;
            }
            
            .navbar {
                border-radius: 0px !important;
                background-color: #5B0000;
                color: white;
                position: relative;
            }
            
            .container-fluid {
                padding: 0 15px;
            }
            
            .navbar-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                flex-wrap: wrap;
            }
            
            .welcome-text {
                color: white;
                font-size: 28px;
                margin: 15px 0;
                text-align: left;
                padding-right: 50px; /* Space for mobile toggle button */
            }
            
            .navbar-toggle {
                display: none;
                border: 1px solid white;
                padding: 9px 10px;
                background-color: transparent;
                cursor: pointer;
                position: absolute;
                top: 15px;
                right: 15px;
                z-index: 100;
                transition: transform 0.3s ease;
            }
            
            .navbar-toggle.active {
                transform: rotate(90deg);
            }
            
            .icon-bar {
                display: block;
                width: 22px;
                height: 2px;
                background-color: white;
                margin: 4px 0;
                transition: transform 0.3s ease-in-out, opacity 0.2s ease;
            }
            
            .navbar-toggle.active .icon-bar:nth-child(1) {
                transform: translateY(6px) rotate(45deg);
            }
            
            .navbar-toggle.active .icon-bar:nth-child(2) {
                opacity: 0;
            }
            
            .navbar-toggle.active .icon-bar:nth-child(3) {
                transform: translateY(-6px) rotate(-45deg);
            }
            
            .nav-links {
                display: flex;
                justify-content: flex-end;
                flex: 1;
            }
            
            .nav {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .navbar-right {
                display: flex;
                flex-direction: row;
                padding: 0;
                margin: 0;
            }
            
            .navbar-right li {
                margin: 0;
                display: inline-block;
            }
            
            .navbar-right a {
                color: white;
                text-decoration: none;
                padding: 15px;
                display: block;
                text-align: center;
            }
            
            .navbar-right a:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            @media (max-width: 768px) {
                .navbar-toggle {
                    display: block;
                }
                
                .nav-links {
                    flex-basis: 100%;
                    max-height: 50px;
                    overflow: hidden;
                    width: 100%;
                    opacity: 0;
                    transform: translateY(-20px);
                    transition: max-height 0.4s ease-in-out, opacity 0.3s ease, transform 0.3s ease;
                }
                
                .nav-links.active {
                    max-height: 300px; /* Adjust this value based on your menu height */
                    
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .navbar-right {
                    flex-direction: column;
                    width: 100%;
                }
                
                .navbar-right li {
                    display: block;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: opacity 0.2s ease, transform 0.2s ease;
                }
                
                .nav-links.active .navbar-right li {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                /* Stagger the delay for each item */
                .nav-links.active .navbar-right li:nth-child(1) { transition-delay: 0.05s; }
                .nav-links.active .navbar-right li:nth-child(2) { transition-delay: 0.1s; }
                .nav-links.active .navbar-right li:nth-child(3) { transition-delay: 0.15s; }
                .nav-links.active .navbar-right li:nth-child(4) { transition-delay: 0.2s; }
            }
        `;

        // Create navbar structure
        const navbar = document.createElement("nav");
        navbar.classList.add("navbar", "navbar-default");
        navbar.innerHTML = `
            <div class="container-fluid">
                <div class="navbar-content">
                    <h5 id="userNameDisplay" class="welcome-text">Welcome!</h5>
                    <button type="button" class="navbar-toggle" id="navToggle">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <div class="nav-links" id="navbarCollapse">
                        <ul class="nav navbar-right">
                            <li id="updatePointsLink" style="display: none;"><a href="points.html">Points Update</a></li>
                            <li><a href="photoUpload.html">Photo Upload</a></li>
                            <li><a href="profileUpdate.html">Profile Update</a></li>
                            <li><a id="logoutLink" href="#">Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Append elements to shadow DOM
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(navbar);

        // Store user data as a property of the component
        this.userData = null;
    }

    // Method to handle logout
    logoutExit() {
        signOut(auth).then(() => {
            window.location.replace('login.html');
        }).catch((err) => {
            console.error(`Error Logging Out: ${err}`);
        });
    }

    // Setup auth state change listener and other functionality
    connectedCallback() {
        // Setup toggle functionality for mobile navigation
        const toggleButton = this.shadowRoot.querySelector("#navToggle");
        const navLinks = this.shadowRoot.querySelector("#navbarCollapse");

        if (toggleButton && navLinks) {
            toggleButton.addEventListener("click", () => {
                toggleButton.classList.toggle("active");
                navLinks.classList.toggle("active");
                console.log("Toggle clicked, nav links active:", navLinks.classList.contains("active"));
            });
        }

        // Setup logout functionality
        const logoutLink = this.shadowRoot.querySelector("#logoutLink");
        if (logoutLink) {
            logoutLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.logoutExit();
            });
        }

        // Set up authentication state change listener
        this.setupAuthListener();
    }

    // Setup the Firebase auth state listener
    setupAuthListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Query Firestore for user data
                    const userQuery = query(
                        collection(db, "userData"),
                        where("uid", "==", user.uid)
                    );
                    const snapshot = await getDocs(userQuery);

                    if (!snapshot.empty) {
                        // Get the user data from the first document
                        const userData = snapshot.docs[0].data();
                        const userDocId = snapshot.docs[0].id;

                        // Store the user data and document ID
                        this.userData = userData;
                        this.userDocId = userDocId;

                        // Update the welcome message with the user's name
                        if (userData.firstname) {
                            this.setUserName(`Welcome, ${userData.firstname}!`);
                        } else {
                            this.setUserName(`Welcome!`);
                        }

                        // Admin check is already done above, no need to check again

                        // Dispatch an event to notify other components that user data is loaded
                        this.dispatchEvent(new CustomEvent('user-data-loaded', {
                            detail: {
                                userData: userData,
                                userDocId: userDocId
                            },
                            bubbles: true,
                            composed: true
                        }));
                    } else {
                        console.error("No user data found in Firestore");
                        this.setUserName("Welcome!");
                    }

                    const configRef = doc(db, "config", "roles");
                    const docSnapshot = await getDoc(configRef);
                    docSnapshot.data()
                    if (docSnapshot.exists()) {
                        const admins = docSnapshot.data().admins;
                        const isAdmin = admins.includes(user.uid);
                        if (isAdmin) {
                            this.showAdminFeatures(true);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    this.setUserName("Welcome!");
                }
            } else {
                // User is not logged in, redirect to login page
                window.location.replace('login.html');
            }
        });
    }

    // Method to update username display
    setUserName(name) {
        const userNameDisplay = this.shadowRoot.querySelector("#userNameDisplay");
        if (userNameDisplay) {
            userNameDisplay.textContent = name || "Welcome!";
        }
    }

    // Method to show/hide admin features
    showAdminFeatures(show = true) {
        const updatePointsLink = this.shadowRoot.querySelector("#updatePointsLink");
        if (updatePointsLink) {
            updatePointsLink.style.display = show ? "list-item" : "none";
        }
    }

    // Method to get user data (can be used by external scripts)
    getUserData() {
        return this.userData;
    }

    // Method to get user document ID (can be used by external scripts)
    getUserDocId() {
        return this.userDocId;
    }
}

// Register the custom element
customElements.define("logged-in-navbar", LoggedInNavbar);
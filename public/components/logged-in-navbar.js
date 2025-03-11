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
            }
            
            .container-fluid {
                padding: 0 15px;
            }
            
            .navbar-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
            }
            
            .welcome-text {
                color: white;
                font-size: 28px;
                margin: 15px 0;
                text-align: left;
                flex-grow: 0;
                min-width: 200px;
            }
            
            .navbar-toggle {
                display: none;
                margin-right: 0;
                border: 1px solid white;
                padding: 9px 10px;
                background-color: transparent;
                cursor: pointer;
            }
            
            .icon-bar {
                display: block;
                width: 22px;
                height: 2px;
                background-color: white;
                margin: 4px 0;
            }
            
            .nav-links {
                flex: 1;
                display: flex;
                justify-content: flex-end;
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
                .navbar-content {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .welcome-text {
                    text-align: center;
                    margin: 10px 0;
                    width: 100%;
                }
                
                .navbar-toggle {
                    display: block;
                    position: absolute;
                    top: 10px;
                    right: 10px;
                }
                
                .nav-links {
                    display: none;
                    width: 100%;
                }
                
                .nav-links.active {
                    display: block;
                }
                
                .navbar-right {
                    flex-direction: column;
                    width: 100%;
                }
                
                .navbar-right li {
                    display: block;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
            }
        `;

        // Create navbar structure
        const navbar = document.createElement("nav");
        navbar.classList.add("navbar", "navbar-default");
        navbar.innerHTML = `
            <div class="container-fluid">
                <div class="navbar-content">
                    <h5 id="userNameDisplay" class="welcome-text"></h5>
                    <button type="button" class="navbar-toggle">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <div class="nav-links" id="navbar-collapse">
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
    }

    connectedCallback() {
        // Setup toggle functionality
        const toggleButton = this.shadowRoot.querySelector(".navbar-toggle");
        const collapse = this.shadowRoot.querySelector(".collapse");

        toggleButton.addEventListener("click", () => {
            const navLinks = this.shadowRoot.querySelector(".nav-links");
            navLinks.classList.toggle("active");
        });

        // Setup logout functionality
        const logoutLink = this.shadowRoot.querySelector("#logoutLink");
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            // Dispatch a custom event that account.js can listen for
            this.dispatchEvent(new CustomEvent("logout-requested"));
        });

        // Check if we should show admin features (initially hidden)
        this.showAdminFeatures(false);
    }

    // Method to be called from outside to update username
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
}

// Register the custom element
customElements.define("logged-in-navbar", LoggedInNavbar);
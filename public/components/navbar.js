import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { auth } from "/config/firebaseConfig.js";

class CustomNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // ✅ Use styles that match your existing navbar
        const style = document.createElement("style");
        style.textContent = `
           /* Navbar Styles */
            .navbar {
              background-color: #5B0000;
              border: none;
              border-radius: 0;
              margin-bottom: 0;
            }
            
            .navbar .container {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              justify-content: space-between;
            }
            
            .navbar-header {
              display: flex;
              align-items: center;
            }
            
            .navbar-brand {
              display: flex;
              align-items: center;
              color: #FFFFFF;
              font-family: "DejaVu Sans Light", sans-serif;
              font-size: 20px;
              text-decoration: none;
            }
            
            .navbar-brand img {
              height: 40px;
              margin-right: 10px;
            }
            
            .navbar-toggle {
              display: none;
              background-color: #FFFFFF;
              border: none;
              padding: 8px;
              cursor: pointer;
            }
            
            .navbar-toggle .icon-bar {
              display: block;
              width: 22px;
              height: 2px;
              background-color: #5B0000;
              margin: 4px 0;
            }
            
            .navbar-collapse {
              display: flex;
              flex-basis: 100%;
              flex-grow: 1;
              align-items: center;
              justify-content: flex-end;
            }
            
            .navbar-nav {
              list-style: none;
              padding-left: 0;
              margin-bottom: 0;
              display: flex;
              flex-direction: row;
            }
            
            .navbar-nav li {
              margin-left: 15px;
            }
            
            .navbar-nav a {
              color: #FFFFFF;
              text-decoration: none;
              font-size: 16px;
              padding: 10px 15px;
            }
            
            .navbar-nav a:hover,
            .navbar-nav a:focus {
              background-color: #FFFFFF;
              color: #5B0000;
              border-radius: 4px;
            }
            
            @media (max-width: 768px) {
              .navbar-toggle {
                display: block;
              }
              .navbar-collapse {
                display: none;
                flex-basis: 100%;
                flex-direction: column;
              }
              .navbar-collapse.active {
                display: flex;
              }
              .navbar-nav {
                flex-direction: column;
                width: 100%;
              }
              .navbar-nav li {
                margin: 0;
              }
              .navbar-nav a {
                padding: 10px;
                text-align: center;
              }
            }
        `;

        // ✅ Create navbar structure using your existing HTML
        const navbar = document.createElement("nav");
        navbar.innerHTML = `
            <nav class="navbar">
              <div class="container">
                <div class="navbar-header">
                  <a class="navbar-brand" href="index.html">
                    <img src="assets/img/theta-tau/login-logo.png" alt="Theta Tau Crest Logo">
                    <span>THETA TAU | MIAMI UNIVERSITY</span>
                  </a>
                  <button type="button" class="navbar-toggle" aria-label="Toggle navigation">
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                  </button>
                </div>
                <div class="navbar-collapse">
                  <ul class="nav navbar-nav navbar-right">
                    <li><a href="index.html">HOME</a></li>
                    <li><a href="gallery.html">GALLERY</a></li>
                    <li><a href="events.html">EVENTS</a></li>
                    <li><a href="leadership.html">LEADERSHIP</a></li>
                    <li><a href="recruitment.html">RECRUITMENT</a></li>
                    <li><a href="contact.html">CONTACT</a></li>
                    <li id="whenSignedOutNav"><a href="login.html">LOGIN</a></li>
                    <li id="whenSignedInNav" style="display: none;"><a href="account.html">ACCOUNT</a></li>
                  </ul>
                </div>
              </div>
            </nav>
        `;

        // ✅ Append styles and navbar to shadow root
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(navbar);
    }

    connectedCallback() {
        this.applyAuthState();
        this.setupMobileMenu();
    }

    applyAuthState() {
        const whenSignedOutNav = this.shadowRoot.querySelector("#whenSignedOutNav");
        const whenSignedInNav = this.shadowRoot.querySelector("#whenSignedInNav");

        if (!whenSignedOutNav || !whenSignedInNav) {
            console.error("Navbar elements not found!");
            return;
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log(`User is logged in: ${user.uid}`);
                whenSignedOutNav.classList.remove("visible");
                whenSignedInNav.classList.add("visible");
            } else {
                console.log("User is not logged in");
                whenSignedInNav.classList.remove("visible");
                whenSignedOutNav.classList.add("visible");
            }
        });
    }

    setupMobileMenu() {
        const toggleButton = this.shadowRoot.querySelector(".mobile-toggle");
        const navLinks = this.shadowRoot.querySelector(".nav-links");

        toggleButton.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }
}

// ✅ Register custom element
customElements.define("custom-navbar", CustomNavbar);
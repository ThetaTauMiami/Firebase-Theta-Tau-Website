// First Login Component (public/components/firstLogin.js)
class FirstLoginComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Debug mode attribute
        this.debug = this.hasAttribute('debug');

        // Create styles
        const style = document.createElement("style");
        style.textContent = `
            * {
                box-sizing: border-box;
            }
            :host {
                display: block;
                width: 100%;
                font-family: Arial, sans-serif;
            }
            :host([hidden]) {
                display: none;
            }
            .debug-banner {
                background-color: #FFA500;
                color: #000;
                text-align: center;
                padding: 5px;
                font-weight: bold;
                margin-bottom: 10px;
                border-radius: 3px;
            }
            .form-group {
                margin-bottom: 15px;
                display: flex;
                flex-wrap: wrap;
            }
            .control-label {
                width: 30%;
                padding-top: 7px;
                text-align: right;
                padding-right: 15px;
            }
            .form-control-container {
                width: 70%;
            }
            .form-control {
                width: 95%;
                padding: 8px;
                margin: auto;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            .text-center {
                text-align: center;
            }
            .text-right {
                text-align: right;
            }
            .btn {
                display: inline-block;
                padding: 6px 12px;
                margin-bottom: 0;
                font-size: 14px;
                font-weight: 700;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                cursor: pointer;
                border: 1px solid transparent;
            }
            .btn-warning {
                color: #fff;
                background-color: #f0ad4e;
                border-color: #eea236;
            }
            .btn-lg {
                padding: 10px 16px;
                font-size: 18px;
                line-height: 1.3333333;
            }
            .btn-warning:hover {
                background-color: #ec971f;
                border-color: #d58512;
            }
            legend {
                width: 100%;
                padding: 0;
                margin-bottom: 20px;
                font-size: 21px;
                line-height: inherit;
                border: 0;
                border-bottom: 1px solid #e5e5e5;
            }
            fieldset {
                padding: 0;
                margin: 0;
                border: 0;
            }
            .placeholderInvalid::placeholder {
                color: black;
                font-weight: bold;
                opacity: 65%;
            }
        `;

        // Create container for prompt and form
        this.container = document.createElement("div");

        // Add debug banner if in debug mode
        if (this.debug) {
            const debugBanner = document.createElement("div");
            debugBanner.className = "debug-banner";
            debugBanner.textContent = "DEBUG MODE: First Login Form Forcibly Displayed";
            this.container.appendChild(debugBanner);
        }

        // Add form content
        const formContent = document.createElement("div");
        formContent.innerHTML = `
            <div id="firstLoginPrompt" class="text-center">
                <h5>Looks like this is your first time logging in, please enter your information below:</h5>
                <h4>(*NOTE: These choices can be changed later in your account settings)</h4>
            </div>
            <div id="firstLoginForm">
                <form class="form-horizontal">
                    <fieldset>
                        <legend>Account Setup</legend>
                        <!-- Firstname input-->
                        <div class="form-group">
                            <label class="control-label" for="firstname">First Name</label>
                            <div class="form-control-container">
                                <input id="txtFirstname" name="firstname" type="text" placeholder="Enter your first name" class="form-control" required>
                            </div>
                        </div>

                        <!-- Lastname input-->
                        <div class="form-group">
                            <label class="control-label" for="lastname">Last Name</label>
                            <div class="form-control-container">
                                <input id="txtLastname" name="lastname" type="text" placeholder="Enter your last name" class="form-control" required>
                            </div>
                        </div>

                        <!-- College Major input-->
                        <div class="form-group">
                            <label class="control-label" for="major">Current Major</label>
                            <div class="form-control-container">
                                <input id="txtMajor" name="major" type="text" placeholder="Enter your current college major (Separate by commas if multiple)" class="form-control" required>
                            </div>
                        </div>

                        <!-- College Minor input-->
                        <div class="form-group">
                            <label class="control-label" for="minor">Current Minor (Optional)</label>
                            <div class="form-control-container">
                                <input id="txtMinor" name="minor" type="text" placeholder="Enter your current college minor (Separate by commas if multiple)" class="form-control">
                            </div>
                        </div>

                        <!-- Expected Grad Year input-->
                        <div class="form-group">
                            <label class="control-label" for="gradYear">Graduation Year</label>
                            <div class="form-control-container">
                                <input id="txtGradYear" name="gradYear" type="number" placeholder="Enter your expected graduation year" class="form-control" min="1980" max="2050" required>
                            </div>
                        </div>

                        <!-- Fraternity Class input-->
                        <div class="form-group">
                            <label class="control-label" for="fratClass">Fraternity Class</label>
                            <div class="form-control-container">
                                <input id="txtFratClass" name="fratClass" type="text" placeholder="Enter your fraternity class (Ex: Mu)" class="form-control" required>
                            </div>
                        </div>

                        <!-- LinkedIn Input-->
                        <div class="form-group">
                            <label class="control-label" for="linkedinURL">LinkedIn (Optional)</label>
                            <div class="form-control-container">
                                <input id="txtLinkedin" name="linkedinURL" type="url" placeholder="Enter your full LinkedIn URL" class="form-control">
                            </div>
                        </div>

                        <!-- Personal Website Input-->
                        <div class="form-group">
                            <label class="control-label" for="personalWebURL">Personal Website (Optional)</label>
                            <div class="form-control-container">
                                <input id="txtPersonalWeb" name="personalWebURL" type="url" placeholder="Enter your full personal website URL" class="form-control">
                            </div>
                        </div>

                        <!-- GitHub Input-->
                        <div class="form-group">
                            <label class="control-label" for="personalGitHubURL">Personal GitHub (Optional)</label>
                            <div class="form-control-container">
                                <input id="txtGithub" name="personalGitHubURL" type="url" placeholder="Enter your full personal GitHub URL" class="form-control">
                            </div>
                        </div>

                        <!-- Submission Button -->
                        <div class="form-group">
                            <div class="text-right" style="width: 100%;">
                                <button id="btnMakeAccountDetails" type="button" class="btn btn-warning btn-lg">Submit</button>
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>
        `;

        this.container.appendChild(formContent);

        // Append to shadow DOM
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this.container);

        // Initialize as hidden by default, unless in debug mode
        if (!this.debug) {
            this.setAttribute('hidden', '');
        }
    }

    connectedCallback() {
        // Add event listener to submit button
        this.submitButton = this.shadowRoot.getElementById('btnMakeAccountDetails');
        this.submitButton.addEventListener('click', this.handleSubmission.bind(this));

        // Log debug status
        if (this.debug) {
            console.log('First Login Component in DEBUG mode. Form will be displayed regardless of user state.');
        }
    }

    disconnectedCallback() {
        // Remove event listeners when component is removed
        if (this.submitButton) {
            this.submitButton.removeEventListener('click', this.handleSubmission.bind(this));
        }
    }

    // Handle when attributes change
    static get observedAttributes() {
        return ['debug', 'hidden'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'debug') {
            this.debug = this.hasAttribute('debug');
            // If debug mode is true, always show the component
            if (this.debug && this.hasAttribute('hidden')) {
                this.removeAttribute('hidden');

                // Add debug banner if not already present
                if (!this.shadowRoot.querySelector('.debug-banner')) {
                    const debugBanner = document.createElement("div");
                    debugBanner.className = "debug-banner";
                    debugBanner.textContent = "DEBUG MODE: First Login Form Forcibly Displayed";
                    this.shadowRoot.querySelector('div').prepend(debugBanner);
                }
            }
        }
    }

    // Validate a form field
    validateField(inputElement, errorMessage) {
        if (!inputElement.checkValidity()) {
            inputElement.style.backgroundColor = "#FFCCCB";
            inputElement.placeholder = errorMessage;
            inputElement.classList.add('placeholderInvalid');
            inputElement.value = "";
            return false;
        }
        inputElement.style.backgroundColor = "";
        return true;
    }

    // Handle form submission
    handleSubmission() {
        const txtFirstname = this.shadowRoot.getElementById('txtFirstname');
        const txtLastname = this.shadowRoot.getElementById('txtLastname');
        const txtMajor = this.shadowRoot.getElementById('txtMajor');
        const txtMinor = this.shadowRoot.getElementById('txtMinor');
        const txtGradYear = this.shadowRoot.getElementById('txtGradYear');
        const txtFratClass = this.shadowRoot.getElementById('txtFratClass');
        const txtLinkedin = this.shadowRoot.getElementById('txtLinkedin');
        const txtPersonalWeb = this.shadowRoot.getElementById('txtPersonalWeb');
        const txtGithub = this.shadowRoot.getElementById('txtGithub');

        // Validate required fields
        let isValid = true;
        isValid = this.validateField(txtFirstname, "You must input a valid first name!") && isValid;
        isValid = this.validateField(txtLastname, "You must input a valid last name!") && isValid;
        isValid = this.validateField(txtMajor, "You must input a valid major!") && isValid;
        isValid = this.validateField(txtGradYear, "You must input a valid graduation year! (1980-2050)") && isValid;
        isValid = this.validateField(txtFratClass, "You must input a valid fraternity class! (Ex: Kappa)") && isValid;

        // Only validate optional URL fields if they have content
        if (txtLinkedin.value) {
            isValid = this.validateField(txtLinkedin, "You must input a valid LinkedIn URL!") && isValid;
        }
        if (txtPersonalWeb.value) {
            isValid = this.validateField(txtPersonalWeb, "You must input a valid personal website URL!") && isValid;
        }
        if (txtGithub.value) {
            isValid = this.validateField(txtGithub, "You must input a valid GitHub URL!") && isValid;
        }

        if (!isValid) return;

        // If validation passes, dispatch custom event with form data
        const formData = {
            firstname: txtFirstname.value,
            lastname: txtLastname.value,
            major: txtMajor.value,
            minor: txtMinor.value,
            gradYear: txtGradYear.value,
            fratclass: txtFratClass.value,
            linkedin: txtLinkedin.value,
            personalWeb: txtPersonalWeb.value,
            github: txtGithub.value
        };

        // Dispatch the event
        const event = new CustomEvent('firstLoginSubmit', {
            detail: formData,
            bubbles: true,
            composed: true // allows the event to pass through the shadow DOM boundary
        });
        this.dispatchEvent(event);
    }

    // Method to show the component - uses standard HTML attribute
    show() {
        this.removeAttribute('hidden');
    }

    // Method to hide the component - uses standard HTML attribute
    hide() {
        // Only hide if not in debug mode
        if (!this.debug) {
            this.setAttribute('hidden', '');
        }
    }

    // Method to enable debug mode
    enableDebug() {
        this.setAttribute('debug', '');
        this.debug = true;
        this.show();
    }

    // Method to disable debug mode
    disableDebug() {
        this.removeAttribute('debug');
        this.debug = false;

        // Remove debug banner if it exists
        const debugBanner = this.shadowRoot.querySelector('.debug-banner');
        if (debugBanner) {
            debugBanner.remove();
        }
    }
}

// Only register the component once
if (!customElements.get('first-login-component')) {
    customElements.define('first-login-component', FirstLoginComponent);
}
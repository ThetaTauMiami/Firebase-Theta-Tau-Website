class CustomJumbotron extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Get attributes from the element
        const backgroundImage = this.getAttribute("background") || "assets/img/miami/banner.png";
        const title = this.getAttribute("title") || "Welcome!";
        const height = this.getAttribute("height") || "300px";

        // Define styles
        const style = document.createElement("style");
        style.textContent = `
            * {
                box-sizing: border-box;
                border-radius: 0 !important;
            }
            :host {
                display: block;
                width: 100%;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .jumbotron {
                width: 100%;
                min-height: ${height};  /* Ensures it fills while allowing content expansion */
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                color: #FFFFFF;
                font-family: "DejaVu Sans Light", sans-serif;
                margin: 0; /* Remove unwanted margins */
            }
            .jumbotron h1 {
                font-size: 63px;
                text-shadow: 1px 1px 10px black;
            }
        `;

        // Define HTML structure
        const jumbotron = document.createElement("div");
        jumbotron.classList.add("jumbotron");

        // ✅ Apply background image dynamically (fixes white space issue)
        jumbotron.style.backgroundImage = `url('${backgroundImage}')`;

        jumbotron.innerHTML = `<h1>${title}</h1>`;

        // Append elements to shadow root
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(jumbotron);
    }
}

// ✅ Register custom element
customElements.define("custom-jumbotron", CustomJumbotron);
// Sample usage:
//              <custom-jumbotron title="Text on screen"></custom-jumbotron>
class CustomJumbotron extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Get attributes from the element
        const backgroundImage = this.getAttribute("background") || "assets/img/miami/banner.png";
        const title = this.getAttribute("title") || "Welcome!";

        // Define styles
        const style = document.createElement("style");
        style.textContent = `
            .jumbotron {
                width: 100%;
                height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-size: cover;
                background-position: center;
                color: white;
                text-align: center;
                font-size: 2rem;
                font-weight: bold;
                padding: 20px;
                box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.3); /* Dark overlay */
            }
        `;

        // Define HTML structure
        const jumbotron = document.createElement("div");
        jumbotron.classList.add("jumbotron");
        jumbotron.style.backgroundImage = `url('${backgroundImage}')`;
        jumbotron.innerHTML = `<h1>${title}</h1>`;

        // Append elements to shadow root
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(jumbotron);
    }
}

// ✅ Corrected Custom Element Name
customElements.define("custom-jumbotron", CustomJumbotron);
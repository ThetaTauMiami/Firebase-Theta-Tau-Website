class CustomJumbotron extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Get attributes
        const backgroundImage = this.getAttribute("background") || "assets/img/miami/banner.png";
        const title = this.getAttribute("title") || "Welcome!";

        // Use documentFragment for faster DOM updates
        const fragment = document.createDocumentFragment();

        // Create styles
        const style = document.createElement("style");
        style.textContent = `
            * {
                box-sizing: border-box;
                border-radius: 0 !important;
            }
            :host {
                display: block;
                width: 100%;
                padding: 0;
                margin: 0;
                overflow-x: hidden;
                will-change: transform, opacity; 
            }
            body {
                margin: 0;
                padding: 0;
            }
            .jumbotron {
                width: 100%;
                min-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                color: #FFFFFF;
                font-family: "DejaVu Sans Light", sans-serif;
                margin: 0;
                opacity: 0; /* Start invisible for fade-in */
                transform: translateY(10px); /* Start slightly off-screen */
                transition: opacity 0.5s ease-out, transform 0.5s ease-out; /* Smooth animations */
            }
            .jumbotron h1 {
                font-size: 63px;
                text-shadow: 1px 1px 10px black;
            }
        `;

        // Create jumbotron element
        const jumbotron = document.createElement("div");
        jumbotron.classList.add("jumbotron");
        jumbotron.style.backgroundImage = `url('${backgroundImage}')`;

        const h1 = document.createElement("h1");
        h1.textContent = title
        jumbotron.appendChild(h1);

        // Append to fragment (minimizing DOM operations)
        fragment.appendChild(style);
        fragment.appendChild(jumbotron);
        this.shadowRoot.appendChild(fragment);

        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            jumbotron.style.opacity = "1";
            jumbotron.style.transform = "translateY(0)";
        });
    }
}

// Register custom element
customElements.define("custom-jumbotron", CustomJumbotron);
function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error(`Error loading ${file}: ${response.statusText}`);
            return response.text();
        })
        .then(html => {
            const container = document.getElementById(id);
            if (!container) {
                console.error(`Element with ID '${id}' not found.`);
                return;
            }
            container.innerHTML = html;

            // Extract and execute scripts inside the loaded component
            const scripts = container.querySelectorAll("script");
            scripts.forEach((script) => {
                const newScript = document.createElement("script");

                if (script.type) newScript.type = script.type;
                if (script.src) {
                    newScript.src = script.src;
                    newScript.async = false; // Ensures scripts run in order
                } else {
                    newScript.textContent = script.textContent;
                }

                // If it's a module script, append to head to execute properly
                if (newScript.type === "module") {
                    document.head.appendChild(newScript);
                } else {
                    document.body.appendChild(newScript);
                }
            });
        })
        .catch(error => console.error("Error loading component:", error));
}

// Load components when the DOM is fully ready
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("styles-placeholder", "/components/styles.html");
    loadComponent("nav-placeholder", "/components/navbar.html");
    loadComponent("footer-placeholder", "/components/footer.html");
    loadComponent("scripts-placeholder", "/components/scripts.html");
});
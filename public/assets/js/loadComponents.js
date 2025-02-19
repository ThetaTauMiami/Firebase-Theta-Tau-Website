function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error(`Error loading ${file}`);
            return response.text();
        })
        .then(html => {
            const container = document.getElementById(id);
            container.innerHTML = html;

            // Find and execute scripts inside the loaded component
            const scripts = container.querySelectorAll("script");
            scripts.forEach((script) => {
                const newScript = document.createElement("script");
                if (script.type) newScript.type = script.type;
                if (script.src) {
                    newScript.src = script.src;
                    newScript.async = true;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            });
        })
        .catch(error => console.error(error));
}

// Load components
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("nav-placeholder", "/public/components/navbar.html");
    loadComponent("footer-placeholder", "/public/components/footer.html");
    loadComponent("styles-placeholder", "/public/components/styles.html");
    loadComponent("scripts-placeholder", "/public/components/scripts.html");
});
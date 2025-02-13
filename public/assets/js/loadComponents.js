function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error(`Error loading ${file}`);
            return response.text();
        })
        .then(html => {
            document.getElementById(id).innerHTML = html;
        })
        .catch(error => console.error(error));
}

// Load navbar
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("nav-placeholder", "/public/components/navbar.js");
    loadComponent("footer-placeholder", "/public/components/footer.html");
    loadComponent("styles-placeholder", "/public/components/styles.html");
    loadComponent("scripts-placeholder", "/public/components/scripts.html");
});
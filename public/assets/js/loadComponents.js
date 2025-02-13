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
    loadComponent("nav-placeholder", "/src/components/navbar.html");
    loadComponent("footer-placeholder", "/src/components/footer.html");
});
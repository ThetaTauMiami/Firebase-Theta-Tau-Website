import fs from "fs";
import path from "path";

const root = path.resolve("public");
const indexPath = path.join(root, "index.html");
const stylesPath = path.join(root, "components", "styles.html");
const navPath = path.join(root, "components", "navbar.html");
const footerPath = path.join(root, "components", "footer.html");

let index = fs.readFileSync(indexPath, "utf8");
const styles = fs.existsSync(stylesPath) ? fs.readFileSync(stylesPath, "utf8") : "";
const nav = fs.existsSync(navPath) ? fs.readFileSync(navPath, "utf8") : "";
const footer = fs.existsSync(footerPath) ? fs.readFileSync(footerPath, "utf8") : "";

// Replace placeholders with the actual content
index = index
  .replace('<div id="styles-placeholder"></div>', styles)
  .replace('<div id="nav-placeholder"></div>', nav)
  .replace("<div id='footer-placeholder'></div>", footer)
  .replace('<div id="scripts-placeholder"></div>', "");

// Remove any loadComponents.js references since they’re no longer needed
index = index.replace(/<script[^>]*loadComponents\.js[^>]*><\/script>/gi, "");

// Optional: remove the “hide until ready” CSS and script
index = index.replace(/body\s*\{[^}]*opacity[^}]*}/g, "body { opacity: 1; visibility: visible; }");
index = index.replace(/window\.addEventListener\([^)]*whenReady[^)]*\);/g, "");

fs.writeFileSync(indexPath, index, "utf8");
console.log("✅ Built index.html with components embedded.");

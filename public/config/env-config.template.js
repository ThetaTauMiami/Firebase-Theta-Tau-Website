// /public/config/env-config.template.js
// This is a template. Copy to env-config.js and fill in values

// This gets built in firebase-deploy.yml for deployment
// The values are replaced with the actual values from the secrets in github
const ENV = {
    FIREBASE_API_KEY: "YOUR_API_KEY",
    FIREBASE_AUTH_DOMAIN: "YOUR_AUTH_DOMAIN",
    FIREBASE_PROJECT_ID: "YOUR_PROJECT_ID",
    FIREBASE_STORAGE_BUCKET: "YOUR_STORAGE_BUCKET",
    FIREBASE_MESSAGING_SENDER_ID: "YOUR_MESSAGING_SENDER_ID",
    FIREBASE_APP_ID: "YOUR_APP_ID",
    FIREBASE_MEASUREMENT_ID: "YOUR_MEASUREMENT_ID"
};

export default ENV;
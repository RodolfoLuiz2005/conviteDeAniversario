// Import the functions you need from Firebase CDN modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Load Firebase configuration from window object (injected via HTML)
const firebaseConfig = window.firebaseConfig;

if (
  !firebaseConfig?.apiKey ||
  !firebaseConfig?.projectId ||
  Object.values(firebaseConfig).some(
    (value) => typeof value === "string" && value.includes("__")
  )
) {
  throw new Error("Firebase config ausente ou nao injetado.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

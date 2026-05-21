// Import the functions you need from Firebase CDN modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Load Firebase configuration from window object (injected via HTML)
const firebaseConfig = window.firebaseConfig;
const firebaseConfigInvalido =
  !firebaseConfig?.apiKey ||
  !firebaseConfig?.projectId ||
  Object.values(firebaseConfig).some(
    (value) => typeof value === "string" && value.includes("__")
  );

let auth = null;
let db = null;

if (firebaseConfigInvalido) {
  console.warn("Firebase config ausente ou nao injetado.");
} else {
  // Initialize Firebase only when config is valid.
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export function isFirebaseReady() {
  return !firebaseConfigInvalido && Boolean(auth) && Boolean(db);
}

export { auth, db };

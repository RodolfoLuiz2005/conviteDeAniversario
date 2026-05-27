/* eslint-disable no-console */
/* eslint-disable no-undef */
// Import Firebase CDN modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getFirestore,
  enableIndexedDbPersistence,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Firebase config injected from HTML
const firebaseConfig = window.firebaseConfig;

// Validate config
const firebaseConfigInvalido =
  !firebaseConfig ||
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  Object.values(firebaseConfig).some(
    (value) => typeof value === "string" && (value.includes("__") || value.trim() === "")
  );

let app = null;
let db = null;

// Initialize Firebase
try {
  if (firebaseConfigInvalido) {
    console.warn("Firebase config ausente ou inválido.");
  } else {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    // Optional offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
      console.warn("Persistência offline não ativada:", err.code);
    });

    console.log("Firebase iniciado com sucesso.");
  }
} catch (error) {
  console.error("Erro ao iniciar Firebase:", error);
}

// Check if Firebase is ready
export function isFirebaseReady() {
  return Boolean(app && db);
}

export { db };
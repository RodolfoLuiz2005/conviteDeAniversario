// Import the functions you need from Firebase CDN modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDa0z9JQp0vM4eq72RqWYykzrJpLweKB_M",
  authDomain: "convite-de-aniversario-b449f.firebaseapp.com",
  projectId: "convite-de-aniversario-b449f",
  storageBucket: "convite-de-aniversario-b449f.firebasestorage.app",
  messagingSenderId: "414479206342",
  appId: "1:414479206342:web:5e437dd4ac2a15ab8894c7",
  measurementId: "G-9NQFCB8E1V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

/* firebase deploy --only hosting:convite-de-aniversario-b449f-9ebf6 */



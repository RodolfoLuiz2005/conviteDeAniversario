import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBo0kv0XW9PbL18Vr4gQzPy8rBj1zWjGPQ",
  authDomain: "convite-de-aniversario-d57c1.firebaseapp.com",
  projectId: "convite-de-aniversario-d57c1",
  storageBucket: "convite-de-aniversario-d57c1.firebasestorage.app",
  messagingSenderId: "30192356882",
  appId: "1:30192356882:web:12520ddf9d051f445cd2cb",
  measurementId: "G-2ZFCTQBF1B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testWrite() {
  try {
    const docRef = await addDoc(collection(db, "convidados"), {
      nome: "Teste",
      timestamp: new Date().toISOString()
    });
    console.log("Documento gravado com ID:", docRef.id);
  } catch (e) {
    console.error("Erro ao gravar documento:", e);
  }
}

testWrite();

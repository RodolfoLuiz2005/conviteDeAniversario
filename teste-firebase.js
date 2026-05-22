/* import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFmYTGekZeJYOMyk6PyGN_gzIpPnf3rNk",
  authDomain: "convitedeaniversario.firebaseapp.com",
  projectId: "convitedeaniversario",
  storageBucket: "convitedeaniversario.firebasestorage.app",
  messagingSenderId: "989751109190",
  appId: "1:989751109190:web:40cceaaa4e37f92d9ecc47",
  measurementId: "G-BY0V4SSQNE"
};

async function testarConexao() {
  console.log("Iniciando teste de gravação no Firebase com as credenciais atuais...");
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const colRef = collection(db, "confirmacoes");

    console.log("Tentando gravar um documento de teste...");
    const docRef = await addDoc(colRef, {
      nome: "Teste de Sistema",
      whatsapp: "(81) 99999-9999",
      createdAt: new Date()
    });

    console.log("SUCESSO: Documento gravado com ID:", docRef.id);
  } catch (error) {
    console.error("FALHA AO GRAVAR: Ocorreu o seguinte erro de conexão/autenticação:");
    console.error(error.message);
  }
}

testarConexao(); */

import {db} from "./database/db.mjs";
import {get, ref, set, push} from "firebase/database";

export async function salvarResposta(resposta) {
  const respostasRef = ref(db, "respostas");
  const novaRespostaRef = push(respostasRef);
  await set(novaRespostaRef, resposta);
}
try {
    const dbRef = ref(db, "respostas");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
        const respostas = snapshot.val();
        console.log("Respostas encontradas:", respostas);
    } else {
        console.log("Nenhuma resposta encontrada.");
    }
} catch (error) {
    console.error("Erro ao acessar o banco de dados:", error);
}



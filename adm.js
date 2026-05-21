import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { validarWhatsapp, sanitizarEntrada, mostrarToast, exportarCSV } from "./utils.js";

const confirmacoesCollection = collection(db, "confirmacoes");
const convidadosCollection = collection(db, "convidados");
const authSection = document.getElementById("authSection");
const adminApp = document.getElementById("adminApp");
const authStatus = document.getElementById("authStatus");
const adminLoginForm = document.getElementById("adminLoginForm");
const btnLogout = document.getElementById("btnLogout");

let convidados = [];
let confirmacoes = [];
let unsubscribeConvidados = null;
let unsubscribeConfirmacoes = null;
let adminAppInicializado = false;

function setAuthStatus(texto, tipo = "") {
  if (!authStatus) return;
  authStatus.textContent = texto;
  authStatus.className = `auth-status${tipo ? ` ${tipo}` : ""}`;
}

function mostrarTelaLogin() {
  if (authSection) authSection.hidden = false;
  if (adminApp) adminApp.hidden = true;
}

function mostrarPainel() {
  if (authSection) authSection.hidden = true;
  if (adminApp) adminApp.hidden = false;
}

function limparEstadoAdmin() {
  convidados = [];
  confirmacoes = [];

  if (unsubscribeConvidados) {
    unsubscribeConvidados();
    unsubscribeConvidados = null;
  }

  if (unsubscribeConfirmacoes) {
    unsubscribeConfirmacoes();
    unsubscribeConfirmacoes = null;
  }

  adminAppInicializado = false;
}

async function validarPermissaoAdmin() {
  const q = query(convidadosCollection, limit(1));
  await getDocs(q);
}

async function carregarConfirmacaoPrincipal() {
  const statusEl = document.getElementById("ultConfirmacaoStatus");
  const nomeEl = document.getElementById("ultConfirmNome");
  const whatsappEl = document.getElementById("ultConfirmWhatsapp");

  if (!statusEl || !nomeEl || !whatsappEl) {
    console.error("Elementos do DOM nao encontrados");
    return;
  }

  try {
    const q = query(confirmacoesCollection, orderBy("createdAt", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      statusEl.textContent = "Ultima confirmacao registrada no banco de dados:";
      nomeEl.textContent = `Nome: ${data.nome || "N/A"}`;
      whatsappEl.textContent = `WhatsApp: ${data.whatsapp || "N/A"}`;
      return;
    }
  } catch (error) {
    console.error("Erro ao carregar ultima confirmacao do Firestore:", error);
    statusEl.textContent = "Erro ao carregar confirmacoes.";
    throw error;
  }

  statusEl.textContent = "Ainda nao ha confirmacoes realizadas pelo painel principal.";
  nomeEl.textContent = "";
  whatsappEl.textContent = "";
}

async function limparConfirmacaoPrincipal() {
  const confirmacaoDocId = localStorage.getItem("confirmacaoDocId");
  const existiaConfirmacao = localStorage.getItem("jaConfirmou") === "sim";

  if (confirmacaoDocId) {
    try {
      await deleteDoc(doc(confirmacoesCollection, confirmacaoDocId));
    } catch (error) {
      console.error("Erro ao remover confirmacao do Firestore:", error);
    }
  }

  localStorage.removeItem("nomeConfirmado");
  localStorage.removeItem("whatsappConfirmado");
  localStorage.removeItem("jaConfirmou");
  localStorage.removeItem("confirmados");
  localStorage.removeItem("confirmacaoDocId");

  await carregarConfirmacaoPrincipal();

  if (existiaConfirmacao) {
    mostrarToast("Ultima confirmacao removida", "sucesso");
  } else {
    mostrarToast("Nao havia confirmacao para remover", "aviso");
  }
}

async function carregarConvidados() {
  const q = query(convidadosCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  convidados = snapshot.docs.map((docItem) => ({
    ...docItem.data(),
    docId: docItem.id,
  }));
  atualizarLista();
  atualizarEstatisticas();
}

async function carregarConfirmacoes() {
  const q = query(confirmacoesCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  confirmacoes = snapshot.docs.map((docItem) => ({
    ...docItem.data(),
    docId: docItem.id,
  }));
}

function listenConvidados() {
  const q = query(convidadosCollection, orderBy("createdAt", "desc"));
  unsubscribeConvidados = onSnapshot(
    q,
    (snapshot) => {
      convidados = snapshot.docs.map((docItem) => ({
        ...docItem.data(),
        docId: docItem.id,
      }));
      atualizarLista();
      atualizarEstatisticas();
    },
    (error) => {
      console.error("Erro no listener de convidados Firestore:", error);
      mostrarToast("Conexao com banco perdida", "erro");
    }
  );
}

function listenConfirmacoes() {
  const q = query(confirmacoesCollection, orderBy("createdAt", "desc"));
  unsubscribeConfirmacoes = onSnapshot(
    q,
    (snapshot) => {
      confirmacoes = snapshot.docs.map((docItem) => ({
        ...docItem.data(),
        docId: docItem.id,
      }));
      carregarConfirmacaoPrincipal().catch((error) => {
        console.error("Erro ao atualizar confirmacao principal:", error);
      });
    },
    (error) => {
      console.error("Erro no listener de confirmacoes:", error);
    }
  );
}

function atualizarLista() {
  const lista = document.getElementById("listaConvidados");
  if (!lista) {
    console.error("Elemento listaConvidados nao encontrado");
    return;
  }

  const filtroEl = document.getElementById("filtro");
  const filtro = filtroEl ? filtroEl.value.toLowerCase() : "";

  const convidadosFiltrados = convidados.filter((convidado) =>
    (convidado.nome || "").toLowerCase().includes(filtro)
  );

  if (convidadosFiltrados.length === 0) {
    lista.innerHTML = `
      <div class="vazio">
        <i class="bi bi-inbox"></i>
        <p>Nenhum convidado encontrado</p>
      </div>
    `;
    return;
  }

  lista.innerHTML = convidadosFiltrados
    .map(
      (convidado) => `
    <div class="convidado-item">
      <div class="convidado-info">
        <div class="convidado-nome">${sanitizarEntrada(convidado.nome || "")}</div>
        <div class="convidado-status">
          ${
            convidado.confirmado
              ? '<span class="status-confirmado"><i class="bi bi-check-circle-fill"></i> Confirmado</span>'
              : '<span class="status-nao-confirmado"><i class="bi bi-x-circle-fill"></i> Pendente</span>'
          }
          ${convidado.telefone ? `<span>(${sanitizarEntrada(convidado.telefone)})</span>` : ""}
          ${convidado.notas ? `<span>${sanitizarEntrada(convidado.notas)}</span>` : ""}
        </div>
      </div>
      <div class="convidado-acoes">
        ${
          !convidado.confirmado
            ? `<button class="btn btn-success btn-pequeno" onclick="confirmarConvidado('${convidado.docId}')">
              <i class="bi bi-check"></i> Confirmar
            </button>`
            : ""
        }
        <button class="btn btn-danger btn-pequeno" onclick="deletarConvidado('${convidado.docId}')">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function sincronizarConfirmados() {
  const confirmadosCount = convidados.filter((convidado) => convidado.confirmado).length;
  localStorage.setItem("confirmados", confirmadosCount);
}

function atualizarEstatisticas() {
  const total = convidados.length;
  const confirmadosCount = convidados.filter((convidado) => convidado.confirmado).length;
  const pendentes = total - confirmadosCount;
  const percentual = total === 0 ? 0 : Math.round((confirmadosCount / total) * 100);

  const totalConvidadosEl = document.getElementById("totalConvidados");
  const totalConfirmadosEl = document.getElementById("totalConfirmados");
  const totalPendentesEl = document.getElementById("totalPendentes");
  const percentualConfirmacaoEl = document.getElementById("percentualConfirmacao");

  if (totalConvidadosEl) totalConvidadosEl.textContent = total;
  if (totalConfirmadosEl) totalConfirmadosEl.textContent = confirmadosCount;
  if (totalPendentesEl) totalPendentesEl.textContent = pendentes;
  if (percentualConfirmacaoEl) percentualConfirmacaoEl.textContent = `${percentual}%`;

  sincronizarConfirmados();
}

async function adicionarConvidado() {
  const nomeEl = document.getElementById("nomeConvidado");
  const telefoneEl = document.getElementById("telefonConvidado");
  const statusEl = document.getElementById("statusConvidado");
  const notasEl = document.getElementById("notasConvidado");

  if (!nomeEl || !telefoneEl || !statusEl || !notasEl) {
    mostrarToast("Erro: elementos do formulario nao encontrados", "erro");
    return;
  }

  const nome = sanitizarEntrada(nomeEl.value || "");
  const telefone = sanitizarEntrada(telefoneEl.value || "");
  const status = statusEl.value;
  const notas = sanitizarEntrada(notasEl.value || "");

  if (!nome || nome.length < 3) {
    mostrarToast("Nome deve ter pelo menos 3 caracteres", "aviso");
    nomeEl.focus();
    return;
  }

  if (telefone && !validarWhatsapp(telefone)) {
    mostrarToast("WhatsApp invalido. Use formato: (81) 99999-9999", "aviso");
    telefoneEl.focus();
    return;
  }

  const novoConvidado = {
    nome,
    telefone,
    confirmado: status === "confirmado",
    notas,
    dataAdicao: new Date().toLocaleDateString("pt-BR"),
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(convidadosCollection, novoConvidado);
    convidados.unshift({ ...novoConvidado, docId: docRef.id });
    mostrarToast("Convidado adicionado com sucesso!", "sucesso");
    atualizarLista();
    atualizarEstatisticas();
    nomeEl.value = "";
    telefoneEl.value = "";
    statusEl.value = "pendente";
    notasEl.value = "";
  } catch (error) {
    console.error("Erro ao adicionar convidado no Firestore:", error);
    mostrarToast("Erro ao adicionar convidado", "erro");
  }
}

async function confirmarConvidado(docId) {
  const convidado = convidados.find((item) => item.docId === docId);

  if (!convidado?.docId) {
    mostrarToast("Erro: convidado nao encontrado", "erro");
    return;
  }

  try {
    await updateDoc(doc(convidadosCollection, convidado.docId), {
      confirmado: true,
    });
    mostrarToast(`${convidado.nome} confirmado!`, "sucesso");
  } catch (error) {
    console.error("Erro ao confirmar convidado:", error);
    mostrarToast("Erro ao confirmar convidado", "erro");
  }
}

async function deletarConvidado(docId) {
  const convidado = convidados.find((item) => item.docId === docId);

  if (!convidado?.docId) {
    mostrarToast("Erro: convidado nao encontrado", "erro");
    return;
  }

  if (confirm(`Deseja deletar ${convidado.nome}?`)) {
    try {
      await deleteDoc(doc(convidadosCollection, convidado.docId));
      mostrarToast(`${convidado.nome} removido!`, "sucesso");
    } catch (error) {
      console.error("Erro ao deletar convidado:", error);
      mostrarToast("Erro ao remover convidado", "erro");
    }
  }
}

async function resetarContadoresFesta() {
  if (confirm("Deseja resetar todas as confirmacoes? Isso nao pode ser desfeito!")) {
    try {
      const batch = writeBatch(db);
      convidados.forEach((item) => {
        if (item.docId) {
          batch.update(doc(convidadosCollection, item.docId), {
            confirmado: false,
          });
        }
      });
      await batch.commit();
      mostrarToast("Confirmacoes resetadas!", "sucesso");
    } catch (error) {
      console.error("Erro ao resetar confirmacoes:", error);
      mostrarToast("Erro ao resetar confirmacoes", "erro");
    }
  }
}

async function limparTodosDados() {
  if (confirm("Deseja limpar TODOS os convidados? Isso nao pode ser desfeito!")) {
    try {
      const snapshot = await getDocs(convidadosCollection);
      const batch = writeBatch(db);
      snapshot.docs.forEach((docItem) => {
        batch.delete(doc(convidadosCollection, docItem.id));
      });
      await batch.commit();
      localStorage.removeItem("jaConfirmou");
      mostrarToast("Todos os dados foram limpos!", "sucesso");
    } catch (error) {
      console.error("Erro ao limpar todos os convidados:", error);
      mostrarToast("Erro ao limpar convidados", "erro");
    }
  }
}

function exportarDados() {
  const dados = convidados.map((convidado) => ({
    nome: convidado.nome,
    whatsapp: convidado.telefone,
    confirmado: convidado.confirmado ? "Sim" : "Nao",
    notas: convidado.notas,
    "data de adicao": convidado.dataAdicao,
  }));

  exportarCSV(dados, `convidados-${new Date().toISOString().split("T")[0]}.csv`);
  mostrarToast("Dados exportados como CSV!", "sucesso");
}

const filtroEl = document.getElementById("filtro");
if (filtroEl) {
  filtroEl.addEventListener("input", atualizarLista);
}

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("adminEmail")?.value?.trim() || "";
  const senha = document.getElementById("adminPassword")?.value || "";

  if (!email || !senha) {
    setAuthStatus("Preencha email e senha para entrar.", "erro");
    return;
  }

  setAuthStatus("Entrando...", "sucesso");

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    setAuthStatus("");
  } catch (error) {
    console.error("Erro ao autenticar administrador:", error);
    setAuthStatus("Nao foi possivel entrar. Verifique as credenciais.", "erro");
  }
});

btnLogout?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    mostrarToast("Sessao encerrada com sucesso.", "sucesso");
  } catch (error) {
    console.error("Erro ao sair do painel:", error);
    mostrarToast("Erro ao encerrar sessao.", "erro");
  }
});

async function iniciarPainelAdmin() {
  if (adminAppInicializado) {
    mostrarPainel();
    return;
  }

  await validarPermissaoAdmin();
  await carregarConvidados();
  await carregarConfirmacaoPrincipal();
  await carregarConfirmacoes();
  listenConvidados();
  listenConfirmacoes();
  adminAppInicializado = true;
  mostrarPainel();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    limparEstadoAdmin();
    mostrarTelaLogin();
    setAuthStatus("Entre com uma conta autorizada para abrir o painel.");
    return;
  }

  setAuthStatus("Validando acesso...", "sucesso");

  try {
    await iniciarPainelAdmin();
    setAuthStatus("");
  } catch (error) {
    console.error("Acesso administrativo negado:", error);
    await signOut(auth).catch(() => {});
    mostrarTelaLogin();
    setAuthStatus(
      "Sua conta autenticou, mas nao tem permissao no Firestore. Autorize o UID em admins/{uid}.",
      "erro"
    );
  }
});

window.addEventListener("beforeunload", () => {
  limparEstadoAdmin();
});

window.adicionarConvidado = adicionarConvidado;
window.confirmarConvidado = confirmarConvidado;
window.deletarConvidado = deletarConvidado;
window.resetarContadoresFesta = resetarContadoresFesta;
window.limparTodosDados = limparTodosDados;
window.limparConfirmacaoPrincipal = limparConfirmacaoPrincipal;
window.carregarConfirmacaoPrincipal = carregarConfirmacaoPrincipal;
window.exportarDados = exportarDados;

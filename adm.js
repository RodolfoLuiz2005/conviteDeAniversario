import { db, isFirebaseReady } from "./firebase.js";
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

const firebaseDisponivel = isFirebaseReady();
const usandoFirebase = firebaseDisponivel && Boolean(db);
const confirmacoesCollection = usandoFirebase
  ? collection(db, "confirmacoes")
  : null;
const convidadosCollection = usandoFirebase
  ? collection(db, "convidados")
  : null;
const authSection = document.getElementById("authSection");
const adminApp = document.getElementById("adminApp");
const authStatus = document.getElementById("authStatus");
const btnLogout = document.getElementById("btnLogout");
const adminAuthPassword = window.adminAuthConfig?.password?.trim() || "Cf182026";
const adminSessionKey = "adminAutenticado";
const convidadosStorageKey = "adminConvidados";
const confirmacoesStorageKey = "adminConfirmacoes";

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

function painelDisponivel() {
  if (usandoFirebase && confirmacoesCollection && convidadosCollection) {
    return true;
  }

  return true;
}

function garantirAdminAuthConfig() {
  if (adminAuthPassword && !adminAuthPassword.includes("__")) {
    return true;
  }

  mostrarTelaLogin();
  setAuthStatus("Senha administrativa nao configurada. Defina ADMIN_PASSWORD para liberar o painel.", "erro");
  return false;
}

function adminAutenticado() {
  return sessionStorage.getItem(adminSessionKey) === "sim";
}

function salvarSessaoAdmin(autenticado) {
  if (autenticado) {
    sessionStorage.setItem(adminSessionKey, "sim");
    return;
  }

  sessionStorage.removeItem(adminSessionKey);
}

async function solicitarAcessoAdmin() {
  if (!garantirAdminAuthConfig()) {
    return false;
  }

  const senha = window.prompt("Digite a senha do painel administrativo:");

  if (senha === null) {
    setAuthStatus("Acesso cancelado.");
    window.location.href = "index.html";
    return false;
  }

  if (senha !== adminAuthPassword) {
    setAuthStatus("Senha incorreta.");
    mostrarToast("Senha administrativa incorreta.", "erro");
    return false;
  }

  salvarSessaoAdmin(true);
  setAuthStatus("");
  return true;
}

function lerColecaoLocal(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    const dados = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(dados) ? dados : [];
  } catch (error) {
    console.error(`Erro ao ler dados locais de ${chave}:`, error);
    return [];
  }
}

function salvarColecaoLocal(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

function gerarIdLocal(prefixo) {
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function ordenarPorCriacaoDesc(lista) {
  return [...lista].sort((a, b) => {
    const dataA = new Date(a.createdAt || a.dataAdicao || 0).getTime();
    const dataB = new Date(b.createdAt || b.dataAdicao || 0).getTime();
    return dataB - dataA;
  });
}

function mostrarTelaLogin() {
  if (authSection) authSection.hidden = true;
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
  if (!usandoFirebase) {
    return;
  }

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

  if (!usandoFirebase) {
    const ultimaConfirmacao = ordenarPorCriacaoDesc(confirmacoes)[0];

    if (ultimaConfirmacao) {
      statusEl.textContent = "Ultima confirmacao registrada localmente:";
      nomeEl.textContent = `Nome: ${ultimaConfirmacao.nome || "N/A"}`;
      whatsappEl.textContent = `WhatsApp: ${ultimaConfirmacao.whatsapp || "N/A"}`;
      return;
    }

    statusEl.textContent = "Ainda nao ha confirmacoes realizadas pelo painel principal.";
    nomeEl.textContent = "";
    whatsappEl.textContent = "";
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

  if (!usandoFirebase) {
    confirmacoes = [];
    salvarColecaoLocal(confirmacoesStorageKey, confirmacoes);
  } else if (confirmacaoDocId && confirmacoesCollection) {
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
  if (!usandoFirebase) {
    convidados = ordenarPorCriacaoDesc(lerColecaoLocal(convidadosStorageKey));
    atualizarLista();
    atualizarEstatisticas();
    return;
  }

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
  if (!usandoFirebase) {
    confirmacoes = ordenarPorCriacaoDesc(lerColecaoLocal(confirmacoesStorageKey));
    return;
  }

  const q = query(confirmacoesCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  confirmacoes = snapshot.docs.map((docItem) => ({
    ...docItem.data(),
    docId: docItem.id,
  }));
}

function listenConvidados() {
  if (!usandoFirebase) {
    return;
  }

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
  if (!usandoFirebase) {
    return;
  }

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
    createdAt: new Date().toISOString(),
  };

  try {
    if (usandoFirebase) {
      const docRef = await addDoc(convidadosCollection, {
        ...novoConvidado,
        createdAt: serverTimestamp(),
      });
      convidados.unshift({ ...novoConvidado, docId: docRef.id });
    } else {
      const convidadoLocal = { ...novoConvidado, docId: gerarIdLocal("convidado") };
      convidados.unshift(convidadoLocal);
      salvarColecaoLocal(convidadosStorageKey, convidados);
    }

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
    if (usandoFirebase) {
      await updateDoc(doc(convidadosCollection, convidado.docId), {
        confirmado: true,
      });
    } else {
      convidados = convidados.map((item) =>
        item.docId === convidado.docId ? { ...item, confirmado: true } : item
      );
      salvarColecaoLocal(convidadosStorageKey, convidados);
      atualizarLista();
      atualizarEstatisticas();
    }

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
      if (usandoFirebase) {
        await deleteDoc(doc(convidadosCollection, convidado.docId));
      } else {
        convidados = convidados.filter((item) => item.docId !== convidado.docId);
        salvarColecaoLocal(convidadosStorageKey, convidados);
        atualizarLista();
        atualizarEstatisticas();
      }

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
      if (usandoFirebase) {
        const batch = writeBatch(db);
        convidados.forEach((item) => {
          if (item.docId) {
            batch.update(doc(convidadosCollection, item.docId), {
              confirmado: false,
            });
          }
        });
        await batch.commit();
      } else {
        convidados = convidados.map((item) => ({ ...item, confirmado: false }));
        salvarColecaoLocal(convidadosStorageKey, convidados);
        atualizarLista();
        atualizarEstatisticas();
      }

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
      if (usandoFirebase) {
        const snapshot = await getDocs(convidadosCollection);
        const batch = writeBatch(db);
        snapshot.docs.forEach((docItem) => {
          batch.delete(doc(convidadosCollection, docItem.id));
        });
        await batch.commit();
      } else {
        convidados = [];
        confirmacoes = [];
        salvarColecaoLocal(convidadosStorageKey, convidados);
        salvarColecaoLocal(confirmacoesStorageKey, confirmacoes);
        atualizarLista();
        atualizarEstatisticas();
        await carregarConfirmacaoPrincipal();
      }

      localStorage.removeItem("jaConfirmou");
      localStorage.removeItem("confirmados");
      localStorage.removeItem("confirmacaoDocId");
      localStorage.removeItem("nomeConfirmado");
      localStorage.removeItem("whatsappConfirmado");
      mostrarToast("Todos os dados foram limpos!", "sucesso");
    } catch (error) {
      console.error("Erro ao limpar todos os convidados:", error);
      mostrarToast("Erro ao limpar convidados", "erro");
    }
  }
}

function exportarDados() {
  if (!convidados.length) {
    mostrarToast("Nao ha convidados para exportar.", "aviso");
    return;
  }

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

btnLogout?.addEventListener("click", async () => {
  salvarSessaoAdmin(false);
  limparEstadoAdmin();
  mostrarTelaLogin();
  mostrarToast("Sessao encerrada com sucesso.", "sucesso");

  const acessoLiberado = await solicitarAcessoAdmin();
  if (acessoLiberado) {
    await iniciarPainelAdmin();
  }
});

async function iniciarPainelAdmin() {
  if (!painelDisponivel()) {
    return;
  }

  if (!adminAutenticado()) {
    const acessoLiberado = await solicitarAcessoAdmin();
    if (!acessoLiberado) {
      return;
    }
  }

  if (adminAppInicializado) {
    mostrarPainel();
    if (!usandoFirebase) {
      setAuthStatus("Painel em modo local. Os dados sao salvos neste navegador.", "sucesso");
    }
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
  if (!usandoFirebase) {
    setAuthStatus("Painel em modo local. Os dados sao salvos neste navegador.", "sucesso");
  }
}

if (garantirAdminAuthConfig()) {
  iniciarPainelAdmin().catch((error) => {
    console.error("Erro ao iniciar painel administrativo:", error);
    mostrarTelaLogin();
    setAuthStatus("Nao foi possivel carregar o painel administrativo.", "erro");
  });
} else {
  mostrarTelaLogin();
}

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

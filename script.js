import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import {
  validarWhatsapp,
  formatarWhatsapp,
  validarNome,
  sanitizarEntrada,
  mostrarToast,
  RateLimiter,
  inicializarDarkMode,
} from "./utils.js";

const confirmacoesCollection = collection(db, "confirmacoes");

// Dark Mode
const darkMode = inicializarDarkMode();

// Rate Limiter
const rateLimiter = new RateLimiter(3, 3600000); // 3 tentativas por hora

// DATA DO EVENTO
const dataEvento = new Date("September 19, 2026 12:00:00").getTime();

// Validacao de injecao de variaveis
function validarFirebaseConfig() {
  if (!window.firebaseConfig?.projectId || window.firebaseConfig.projectId.includes("__")) {
    console.warn("Firebase config nao injetado. Verifique as variaveis de ambiente.");
  }
}

validarFirebaseConfig();

let isConfirmando = false;

const atualizarContador = () => {
  const agora = new Date().getTime();
  const distancia = dataEvento - agora;

  const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

  const diasEl = document.getElementById("dias");
  const horasEl = document.getElementById("horas");
  const minutosEl = document.getElementById("minutos");
  const segundosEl = document.getElementById("segundos");

  if (diasEl) diasEl.innerHTML = String(dias).padStart(2, "0");
  if (horasEl) horasEl.innerHTML = String(horas).padStart(2, "0");
  if (minutosEl) minutosEl.innerHTML = String(minutos).padStart(2, "0");
  if (segundosEl) segundosEl.innerHTML = String(segundos).padStart(2, "0");

  if (distancia < 0) {
    const contadorEl = document.querySelector(".contador");
    if (contadorEl) {
      contadorEl.innerHTML = "<h2>A festa comecou!</h2>";
    }
  }
};

setInterval(atualizarContador, 1000);
atualizarContador();

// CONFIRMAR PRESENCA
const btnConfirmar = document.getElementById("btnConfirmar");
const nomeConfirmacao = document.getElementById("nomeConfirmacao");
const whatsappConfirmacao = document.getElementById("whatsappConfirmacao");
const contadorPessoas = document.getElementById("contadorPessoas");
const jaConfirmou = localStorage.getItem("jaConfirmou");

let totalConfirmados = Number(localStorage.getItem("confirmados")) || 0;

if (contadorPessoas) {
  contadorPessoas.innerHTML = jaConfirmou === "sim" ? String(totalConfirmados) : "Privado";
}

if (jaConfirmou === "sim") {
  if (btnConfirmar) {
    btnConfirmar.innerHTML = "Presenca Confirmada";
    btnConfirmar.disabled = true;
    btnConfirmar.style.opacity = ".7";
  }

  const nomeSalvo = localStorage.getItem("nomeConfirmado") || "";
  const whatsappSalvo = localStorage.getItem("whatsappConfirmado") || "";

  if (nomeConfirmacao) {
    nomeConfirmacao.value = nomeSalvo;
    nomeConfirmacao.disabled = true;
  }

  if (whatsappConfirmacao) {
    whatsappConfirmacao.value = whatsappSalvo;
    whatsappConfirmacao.disabled = true;
  }
}

const btnPainelAdm = document.getElementById("btnPainelAdm");
const btnAbrirAdmFooter = document.getElementById("btnAbrirAdmFooter");

function abrirPainelAdm() {
  window.location.href = "adm.html";
}

btnPainelAdm?.addEventListener("click", abrirPainelAdm);
btnAbrirAdmFooter?.addEventListener("click", abrirPainelAdm);

// FUNCAO PARA REINICIALIZAR O CONTADOR
async function resetarContador() {
  const confirmacaoDocId = localStorage.getItem("confirmacaoDocId");

  if (confirmacaoDocId) {
    try {
      await deleteDoc(doc(confirmacoesCollection, confirmacaoDocId));
    } catch (error) {
      console.error("Erro ao remover confirmacao do Firestore:", error);
    }
  }

  localStorage.removeItem("confirmados");
  localStorage.removeItem("jaConfirmou");
  localStorage.removeItem("nomeConfirmado");
  localStorage.removeItem("whatsappConfirmado");
  localStorage.removeItem("confirmacaoDocId");
  totalConfirmados = 0;
  if (contadorPessoas) contadorPessoas.innerHTML = "Privado";
  if (btnConfirmar) {
    btnConfirmar.innerHTML = '<i class="bi bi-check-circle-fill"></i> Confirmar Presenca';
    btnConfirmar.disabled = false;
    btnConfirmar.style.opacity = "1";
  }
  if (nomeConfirmacao) nomeConfirmacao.disabled = false;
  if (whatsappConfirmacao) whatsappConfirmacao.disabled = false;
  console.log("Contador de confirmados reiniciado!");
}

window.resetarContador = resetarContador;

if (btnConfirmar) {
  btnConfirmar.addEventListener("click", async () => {
    const nome = sanitizarEntrada(nomeConfirmacao?.value || "");
    const whatsapp = sanitizarEntrada(whatsappConfirmacao?.value || "");

    if (!validarNome(nome)) {
      mostrarToast("Nome deve ter entre 3 e 100 caracteres", "aviso");
      nomeConfirmacao?.focus();
      return;
    }

    if (!validarWhatsapp(whatsapp)) {
      mostrarToast("WhatsApp invalido. Use formato: (81) 99999-9999", "aviso");
      whatsappConfirmacao?.focus();
      return;
    }

    if (!rateLimiter.permitir("confirmacao")) {
      mostrarToast("Voce atingiu o limite de tentativas. Tente novamente em 1 hora", "erro");
      return;
    }

    if (isConfirmando) {
      mostrarToast("Aguarde a confirmacao ser processada...", "aviso");
      return;
    }

    if (localStorage.getItem("jaConfirmou") === "sim") {
      mostrarToast("Voce ja confirmou sua presenca!", "aviso");
      return;
    }

    isConfirmando = true;
    btnConfirmar.disabled = true;
    const originalText = btnConfirmar.innerHTML;
    btnConfirmar.innerHTML = "Salvando...";

    try {
      const docRef = await addDoc(confirmacoesCollection, {
        nome,
        whatsapp: formatarWhatsapp(whatsapp),
        createdAt: serverTimestamp(),
      });

      totalConfirmados += 1;
      localStorage.setItem("confirmados", totalConfirmados);
      localStorage.setItem("confirmacaoDocId", docRef.id);
      localStorage.setItem("jaConfirmou", "sim");
      localStorage.setItem("nomeConfirmado", nome);
      localStorage.setItem("whatsappConfirmado", whatsapp);

      if (nomeConfirmacao) {
        nomeConfirmacao.disabled = true;
      }
      if (whatsappConfirmacao) {
        whatsappConfirmacao.disabled = true;
      }

      if (contadorPessoas) {
        contadorPessoas.innerHTML = String(totalConfirmados);
        contadorPessoas.classList.add("pulse");
        setTimeout(() => {
          contadorPessoas.classList.remove("pulse");
        }, 500);
      }

      btnConfirmar.innerHTML = "Presenca Confirmada";
      btnConfirmar.style.opacity = ".7";

      mostrarToast("Presenca confirmada com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao confirmar presenca:", error);
      mostrarToast("Erro ao confirmar presenca. Tente novamente.", "erro");
      btnConfirmar.disabled = false;
      btnConfirmar.innerHTML = originalText;
      isConfirmando = false;
    }
  });
}

// MODAL PRESENTES
const abrirPresentes = document.getElementById("abrirPresentes");
const modalPresentes = document.getElementById("modalPresentes");
const fecharModal = document.getElementById("fecharModal");

if (abrirPresentes) {
  abrirPresentes.addEventListener("click", () => {
    if (modalPresentes) {
      modalPresentes.classList.add("ativo");
    }
  });
}

if (fecharModal) {
  fecharModal.addEventListener("click", () => {
    if (modalPresentes) {
      modalPresentes.classList.remove("ativo");
    }
  });
}

// FECHAR CLICANDO FORA
if (modalPresentes) {
  modalPresentes.addEventListener("click", (e) => {
    if (e.target === modalPresentes) {
      modalPresentes.classList.remove("ativo");
    }
  });
}

// Dark Mode Toggle
const darkModeButton = document.getElementById("darkModeToggle");
if (darkModeButton) {
  darkModeButton.addEventListener("click", () => {
    darkMode.toggle();
    darkModeButton.innerHTML = darkMode.isDark() ? "Light" : "Dark";
  });
  darkModeButton.innerHTML = darkMode.isDark() ? "Light" : "Dark";
}

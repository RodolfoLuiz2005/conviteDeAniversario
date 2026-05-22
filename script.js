/* eslint-disable no-console */
console.log("=== SCRIPT.JS INICIANDO ===");

// Helper para pegar elementos
const el = (id) => {
  const element = document.getElementById(id);
  console.log(`el("${id}"):`, element ? "✅ Encontrado" : "❌ NÃO ENCONTRADO");
  return element;
};

// Esperar DOM estar pronto
document.addEventListener("DOMContentLoaded", () => {
  console.log("\n🚀 === DOM PRONTO ===\n");

  // ============================================
  // CONTADOR REGRESSIVO
  // ============================================
  console.log("📍 Inicializando contador regressivo...");
  function updateCounter() {
    const target = new Date("2026-09-19T12:00:00").getTime();
    const now = Date.now();
    const diff = target - now;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const dias = el("dias");
    const horas = el("horas");
    const minutos = el("minutos");
    const segundos = el("segundos");

    if (dias) dias.textContent = String(d).padStart(2, "0");
    if (horas) horas.textContent = String(h).padStart(2, "0");
    if (minutos) minutos.textContent = String(m).padStart(2, "0");
    if (segundos) segundos.textContent = String(s).padStart(2, "0");
  }

  updateCounter();
  setInterval(updateCounter, 1000);
  console.log("✅ Contador regressivo iniciado\n");

  // ============================================
  // VERIFICAR SE JÁ CONFIRMOU
  // ============================================
  console.log("📍 Verificando se já confirmou...");
  const jaConfirmou = localStorage.getItem("jaConfirmou");
  console.log("localStorage.getItem('jaConfirmou'):", jaConfirmou);
  
  const nomeConfirmado = localStorage.getItem("nomeConfirmado");
  const whatsappConfirmado = localStorage.getItem("whatsappConfirmado");
  console.log("nomeConfirmado:", nomeConfirmado);
  console.log("whatsappConfirmado:", whatsappConfirmado);

  if (jaConfirmou === "sim") {
    console.log("✅ Usuário JÁ CONFIRMOU anteriormente\n");
    
    const nomeInput = el("nomeConfirmacao");
    const whatsappInput = el("whatsappConfirmacao");
    const btnConfirmar = el("btnConfirmar");

    if (nomeInput) {
      nomeInput.value = nomeConfirmado || "";
      nomeInput.disabled = true;
      console.log("✅ Nome input preenchido e desabilitado");
    }

    if (whatsappInput) {
      whatsappInput.value = whatsappConfirmado || "";
      whatsappInput.disabled = true;
      console.log("✅ WhatsApp input preenchido e desabilitado");
    }

    if (btnConfirmar) {
      btnConfirmar.innerHTML = "💙 Presença Confirmada";
      btnConfirmar.disabled = true;
      btnConfirmar.style.opacity = "0.7";
      console.log("✅ Botão confirmado desabilitado\n");
    }
  } else {
    console.log("❌ Usuário NÃO confirmou ainda\n");
  }

  // ============================================
  // CONTADOR DE CONFIRMADOS
  // ============================================
  console.log("📍 Inicializando contador de confirmados...");
  let confirmados = parseInt(localStorage.getItem("confirmados") || "0");
  console.log("Valor atual no localStorage:", confirmados);

  const contadorEl = el("contadorPessoas");
  if (contadorEl) {
    contadorEl.textContent = confirmados;
    console.log("✅ Contador UI atualizado para:", confirmados, "\n");
  }

  // ============================================
  // BOTÃO CONFIRMAR PRESENÇA
  // ============================================
  console.log("📍 Configurando botão CONFIRMAR...");
  const btnConfirmar = el("btnConfirmar");
  const nomeInput = el("nomeConfirmacao");
  const whatsappInput = el("whatsappConfirmacao");

  if (btnConfirmar && !btnConfirmar.disabled) {
    btnConfirmar.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("\n🔘 === BOTÃO CONFIRMAR CLICADO ===");

      const nome = (nomeInput?.value || "").trim();
      const whatsapp = (whatsappInput?.value || "").trim();

      console.log("Nome inserido:", nome);
      console.log("WhatsApp inserido:", whatsapp);

      // Validações
      if (!nome || nome.length < 3) {
        console.log("❌ Nome inválido!");
        alert("Nome deve ter pelo menos 3 caracteres!");
        return;
      }

      if (!whatsapp || whatsapp.length < 10) {
        console.log("❌ WhatsApp inválido!");
        alert("WhatsApp inválido! Use formato: (81) 99999-9999");
        return;
      }

      console.log("✅ Validações passadas!");

      // SALVAR NO LOCALSTORAGE
      console.log("\n📝 === SALVANDO NO LOCALSTORAGE ===");
      
      confirmados++;
      localStorage.setItem("confirmados", String(confirmados));
      console.log("✅ Salvou 'confirmados':", confirmados);

      localStorage.setItem("jaConfirmou", "sim");
      console.log("✅ Salvou 'jaConfirmou': sim");

      localStorage.setItem("nomeConfirmado", nome);
      console.log("✅ Salvou 'nomeConfirmado':", nome);

      localStorage.setItem("whatsappConfirmado", whatsapp);
      console.log("✅ Salvou 'whatsappConfirmado':", whatsapp);

      // Verificar se foi salvo
      console.log("\n🔍 === VERIFICANDO DADOS SALVOS ===");
      console.log("localStorage.getItem('confirmados'):", localStorage.getItem("confirmados"));
      console.log("localStorage.getItem('jaConfirmou'):", localStorage.getItem("jaConfirmou"));
      console.log("localStorage.getItem('nomeConfirmado'):", localStorage.getItem("nomeConfirmado"));
      console.log("localStorage.getItem('whatsappConfirmado'):", localStorage.getItem("whatsappConfirmado"));

      // Atualizar UI
      console.log("\n🎨 === ATUALIZANDO UI ===");
      if (contadorEl) {
        contadorEl.textContent = confirmados;
        contadorEl.classList.add("pulse");
        setTimeout(() => contadorEl.classList.remove("pulse"), 500);
        console.log("✅ Contador UI atualizado para:", confirmados);
      }

      if (nomeInput) {
        nomeInput.disabled = true;
        console.log("✅ Nome input desabilitado");
      }

      if (whatsappInput) {
        whatsappInput.disabled = true;
        console.log("✅ WhatsApp input desabilitado");
      }

      btnConfirmar.innerHTML = "💙 Presença Confirmada!";
      btnConfirmar.disabled = true;
      btnConfirmar.style.opacity = "0.7";
      console.log("✅ Botão desabilitado\n");

      alert("✅ Presença confirmada com sucesso!\nNome: " + nome + "\nWhatsApp: " + whatsapp);
      console.log("✅ === CONFIRMAÇÃO COMPLETA ===\n");
    });

    console.log("✅ Event listener do botão CONFIRMAR adicionado\n");
  } else {
    console.log("❌ Botão CONFIRMAR não encontrado ou já desabilitado\n");
  }

  // ============================================
  // PAINEL ADMINISTRATIVO
  // ============================================
  console.log("📍 Configurando PAINEL ADMINISTRATIVO...");
  const btnAdmin = el("btnAbrirAdmFooter");
  const senhaModal = el("modalSenhaAdmin");
  const inputSenha = el("inputSenhaAdmin");
  const btnConfirmSenha = el("btnConfirmarSenhaAdmin");
  const btnCancelSenha = el("btnCancelarSenhaAdmin");
  const tentativas = el("tentativasRestantes");

  if (btnAdmin) {
    btnAdmin.addEventListener("click", () => {
      console.log("\n🔐 === BOTÃO PAINEL ADMIN CLICADO ===");
      if (senhaModal) {
        senhaModal.style.display = "flex";
        console.log("✅ Modal aberta (display: flex)");
        if (inputSenha) {
          inputSenha.focus();
          console.log("✅ Input senha focado\n");
        }
        if (tentativas) {
          tentativas.textContent = "Tentativas: 3";
          console.log("✅ Tentativas resetadas para 3");
        }
      }
    });
    console.log("✅ Event listener do botão ADMIN adicionado\n");
  }

  if (btnConfirmSenha) {
    let tries = 3;
    btnConfirmSenha.addEventListener("click", () => {
      const senha = (inputSenha?.value || "").trim();
      console.log("🔑 Validando senha inserida:", senha);

      if (senha === "Cf182026") {
        console.log("✅ SENHA CORRETA!");
        alert("✅ Acesso concedido!");
        sessionStorage.setItem("adminAutenticado", "sim");
        window.location.href = "adm.html";
      } else {
        tries--;
        console.log("❌ Senha incorreta! Tentativas restantes:", tries);
        
        if (tries > 0) {
          alert(`❌ Senha incorreta!\n${tries} tentativa${tries !== 1 ? "s" : ""} restante${tries !== 1 ? "s" : ""}`);
          if (inputSenha) inputSenha.value = "";
          if (tentativas) tentativas.textContent = `Tentativas: ${tries}`;
          if (inputSenha) inputSenha.focus();
        } else {
          console.log("❌ TENTATIVAS ESGOTADAS!");
          alert("❌ Acesso negado! Tentativas esgotadas.");
          if (senhaModal) senhaModal.style.display = "none";
        }
      }
    });
    console.log("✅ Event listener de confirmação de senha adicionado\n");
  }

  if (btnCancelSenha) {
    btnCancelSenha.addEventListener("click", () => {
      console.log("❌ Admin cancelado pelo usuário");
      if (senhaModal) senhaModal.style.display = "none";
    });
  }

  // ============================================
  // MODAL PRESENTES
  // ============================================
  console.log("📍 Configurando MODAL PRESENTES...");
  const btnPresentes = el("abrirPresentes");
  const modalPresentes = el("modalPresentes");
  const btnFechar = el("fecharModal");

  if (btnPresentes && modalPresentes) {
    btnPresentes.addEventListener("click", () => {
      console.log("🎁 Abrindo modal presentes");
      modalPresentes.classList.add("ativo");
    });
  }

  if (btnFechar && modalPresentes) {
    btnFechar.addEventListener("click", () => {
      console.log("❌ Fechando modal presentes");
      modalPresentes.classList.remove("ativo");
    });
  }

  if (modalPresentes) {
    modalPresentes.addEventListener("click", (e) => {
      if (e.target === modalPresentes) {
        console.log("❌ Modal presentes fechada (clique fora)");
        modalPresentes.classList.remove("ativo");
      }
    });
  }

  console.log("✅ Modal presentes configurada\n");

  // ============================================
  // DARK MODE
  // ============================================
  console.log("📍 Configurando DARK MODE...");
  const darkToggle = el("darkModeToggle");
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      const html = document.documentElement;
      const isDark = html.getAttribute("data-theme") === "dark";
      html.setAttribute("data-theme", isDark ? "light" : "dark");
      localStorage.setItem("darkMode", String(!isDark));
      darkToggle.textContent = isDark ? "🌙" : "☀️";
      console.log("🌙 Dark mode toggled para:", isDark ? "light" : "dark");
    });
    console.log("✅ Dark mode configurado\n");
  }

  // ============================================
  // FINAL
  // ============================================
  console.log("=" .repeat(50));
  console.log("🎉 === APLICAÇÃO TOTALMENTE CARREGADA ===");
  console.log("=" .repeat(50));
  console.log("\n💡 DICAS PARA TESTES:");
  console.log("1. Preencha NOME e WHATSAPP");
  console.log("2. Clique 'CONFIRMAR PRESENÇA'");
  console.log("3. Recarregue a página (F5)");
  console.log("4. Os dados devem estar preenchidos e o botão desabilitado");
  console.log("5. Abra DevTools → Application → Storage → localStorage");
  console.log("6. Você verá: confirmados, jaConfirmou, nomeConfirmado, whatsappConfirmado\n");
});

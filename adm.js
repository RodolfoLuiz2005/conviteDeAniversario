console.log("=== ADM.JS INICIANDO ===");

// Verificar autenticação
const adminAuth = sessionStorage.getItem("adminAutenticado");
console.log("Admin autenticado:", adminAuth);

if (adminAuth !== "sim") {
  console.log("❌ Usuário não autenticado! Redirecionando...");
  alert("Acesso negado! Use a senha correta.");
  window.location.href = "index.html";
}

console.log("✅ Usuário autenticado!\n");

// Helper para pegar elementos
const el = (id) => document.getElementById(id);

// Esperar DOM estar pronto
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 === DOM PRONTO ===\n");

  // ============================================
  // CARREGAR DADOS DO LOCALSTORAGE
  // ============================================
  console.log("📍 Carregando dados do localStorage...");

  // Tentar carregar confirmados
  let confirmados = parseInt(localStorage.getItem("confirmados") || "0");
  let convidados = JSON.parse(localStorage.getItem("convidados_local") || "[]");
  
  console.log("Confirmados salvos:", confirmados);
  console.log("Convidados salvos:", convidados.length);

  // ============================================
  // ÚLTIMA CONFIRMAÇÃO
  // ============================================
  console.log("\n📍 Mostrando última confirmação...");

  const nomeUltimo = localStorage.getItem("nomeConfirmado");
  const whatsappUltimo = localStorage.getItem("whatsappConfirmado");

  const ultConfStatus = el("ultConfirmacaoStatus");
  const ultConfNome = el("ultConfirmNome");
  const ultConfWhatsapp = el("ultConfirmWhatsapp");

  if (nomeUltimo && whatsappUltimo) {
    console.log("✅ Última confirmação encontrada!");
    console.log("Nome:", nomeUltimo);
    console.log("WhatsApp:", whatsappUltimo);

    if (ultConfStatus) ultConfStatus.textContent = "Última confirmação do convite:";
    if (ultConfNome) ultConfNome.textContent = `👤 Nome: ${nomeUltimo}`;
    if (ultConfWhatsapp) ultConfWhatsapp.textContent = `📱 WhatsApp: ${whatsappUltimo}`;
  } else {
    console.log("❌ Nenhuma confirmação encontrada ainda");
    if (ultConfStatus) ultConfStatus.textContent = "Ainda não há confirmações";
  }

  // ============================================
  // DASHBOARD - ESTATÍSTICAS
  // ============================================
  console.log("\n📍 Atualizando dashboard de estatísticas...");

  const totalConfirmadosEl = el("totalConfirmados");
  const totalConvidadosEl = el("totalConvidados");
  const totalPendentesEl = el("totalPendentes");
  const percentualEl = el("percentualConfirmacao");

  if (totalConfirmadosEl) totalConfirmadosEl.textContent = confirmados;
  if (totalConvidadosEl) totalConvidadosEl.textContent = convidados.length;
  if (totalPendentesEl) totalPendentesEl.textContent = convidados.length - confirmados;

  if (convidados.length > 0) {
    const percent = Math.round((confirmados / convidados.length) * 100);
    if (percentualEl) percentualEl.textContent = percent + "%";
    console.log(`📊 Taxa: ${confirmados}/${convidados.length} = ${percent}%`);
  } else {
    if (percentualEl) percentualEl.textContent = "0%";
  }

  console.log("✅ Dashboard atualizado\n");

  // ============================================
  // LISTAR CONVIDADOS
  // ============================================
  console.log("📍 Listando convidados salvos...");

  const listaEl = el("listaConvidados");

  if (convidados.length === 0) {
    console.log("❌ Nenhum convidado salvo");
    if (listaEl) {
      listaEl.innerHTML = `
        <div class="vazio">
          <i class="bi bi-inbox"></i>
          <p>Nenhum convidado confirmado ainda</p>
        </div>
      `;
    }
  } else {
    console.log(`✅ Encontrados ${convidados.length} convidados`);
    
    let html = "";
    convidados.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.nome} - ${c.whatsapp}`);
      html += `
        <div class="convidado-item">
          <div class="convidado-info">
            <div class="convidado-nome">${c.nome || "N/A"}</div>
            <div class="convidado-status">
              <span class="status-confirmado">
                <i class="bi bi-check-circle-fill"></i> Confirmado
              </span>
              <span>${c.whatsapp || "N/A"}</span>
              ${c.dataAdicao ? `<span>${c.dataAdicao}</span>` : ""}
            </div>
          </div>
          <div class="convidado-acoes">
            <button class="btn btn-danger btn-pequeno" onclick="deletarConvidado(${idx})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
    });

    if (listaEl) listaEl.innerHTML = html;
  }

  // ============================================
  // FUNÇÕES GLOBAIS
  // ============================================
  console.log("\n📍 Configurando funções globais...");

  window.carregarConfirmacaoPrincipal = () => {
    console.log("🔄 Recarregando última confirmação...");
    location.reload();
  };

  window.limparConfirmacaoPrincipal = () => {
    console.log("🗑️ Limpando última confirmação...");
    localStorage.removeItem("nomeConfirmado");
    localStorage.removeItem("whatsappConfirmado");
    localStorage.removeItem("jaConfirmou");
    
    if (ultConfStatus) ultConfStatus.textContent = "Confirmação removida";
    if (ultConfNome) ultConfNome.textContent = "";
    if (ultConfWhatsapp) ultConfWhatsapp.textContent = "";
    
    alert("✅ Confirmação removida!");
  };

  window.adicionarConvidado = () => {
    console.log("➕ Adicionando novo convidado...");

    const nomeInput = el("nomeConvidado");
    const telefoneInput = el("telefonConvidado");
    const statusSelect = el("statusConvidado");
    const notasInput = el("notasConvidado");

    const nome = (nomeInput?.value || "").trim();
    const telefone = (telefoneInput?.value || "").trim();
    const status = statusSelect?.value || "pendente";
    const notas = (notasInput?.value || "").trim();

    if (!nome || nome.length < 3) {
      alert("Nome deve ter pelo menos 3 caracteres!");
      return;
    }

    console.log("Novo convidado:", { nome, telefone, status, notas });

    const novoConvidado = {
      nome,
      whatsapp: telefone,
      confirmado: status === "confirmado",
      notas,
      dataAdicao: new Date().toLocaleDateString("pt-BR"),
      hora: new Date().toLocaleTimeString("pt-BR"),
    };

    convidados.push(novoConvidado);
    localStorage.setItem("convidados_local", JSON.stringify(convidados));

    console.log("✅ Convidado adicionado!");
    alert("✅ Convidado adicionado com sucesso!");

    // Limpar form
    if (nomeInput) nomeInput.value = "";
    if (telefoneInput) telefoneInput.value = "";
    if (notasInput) notasInput.value = "";
    if (statusSelect) statusSelect.value = "pendente";

    // Recarregar
    location.reload();
  };

  window.deletarConvidado = (idx) => {
    console.log("❌ Deletando convidado:", idx);

    if (confirm(`Deseja deletar ${convidados[idx]?.nome || "este convidado"}?`)) {
      convidados.splice(idx, 1);
      localStorage.setItem("convidados_local", JSON.stringify(convidados));
      console.log("✅ Convidado deletado!");
      alert("✅ Convidado removido!");
      location.reload();
    }
  };

  window.resetarContadoresFesta = () => {
    console.log("🔄 Resetando contadores...");

    if (confirm("Deseja resetar todas as confirmações?")) {
      convidados.forEach(c => c.confirmado = false);
      localStorage.setItem("convidados_local", JSON.stringify(convidados));
      localStorage.setItem("confirmados", "0");
      console.log("✅ Contadores resetados!");
      alert("✅ Confirmações resetadas!");
      location.reload();
    }
  };

  window.limparTodosDados = () => {
    console.log("🗑️ Limpando TODOS os dados...");

    if (confirm("⚠️ Deseja limpar TODOS os dados? Isso não pode ser desfeito!")) {
      localStorage.clear();
      console.log("✅ Todos os dados limpados!");
      alert("✅ Todos os dados foram limpos!");
      location.reload();
    }
  };

  window.exportarDados = () => {
    console.log("📥 Exportando dados como CSV...");

    if (convidados.length === 0) {
      alert("Nenhum convidado para exportar!");
      return;
    }

    let csv = "Nome,WhatsApp,Status,Data\n";
    convidados.forEach(c => {
      csv += `"${c.nome}","${c.whatsapp}","${c.confirmado ? "Confirmado" : "Pendente"}","${c.dataAdicao}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `convidados-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    console.log("✅ CSV exportado!");
    alert("✅ Dados exportados como CSV!");
  };

  console.log("✅ Funções globais configuradas\n");

  // ============================================
  // FINAL
  // ============================================
  console.log("=" .repeat(50));
  console.log("🎉 === PAINEL ADMINISTRATIVO CARREGADO ===");
  console.log("=" .repeat(50));
  console.log("\n📊 RESUMO:");
  console.log(`  Confirmações: ${confirmados}`);
  console.log(`  Total convidados: ${convidados.length}`);
  console.log(`  Taxa: ${convidados.length > 0 ? Math.round((confirmados / convidados.length) * 100) : 0}%\n`);
});

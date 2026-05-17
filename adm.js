const adminPassword = "Cf182025";

function verificarSenhaAdm() {
    if (sessionStorage.getItem("adminAutorizado") === "sim") {
        return;
    }

    const senha = prompt("Senha do painel administrativo:");

    if (senha === adminPassword) {
        sessionStorage.setItem("adminAutorizado", "sim");
        return;
    }

    alert("Senha incorreta. Redirecionando para a página principal.");
    window.location.href = "index.html";
}

verificarSenhaAdm();

function carregarConfirmacaoPrincipal() {
    const nome = localStorage.getItem("nomeConfirmado");
    const whatsapp = localStorage.getItem("whatsappConfirmado");
    const confirmado = localStorage.getItem("jaConfirmou") === "sim";

    const statusEl = document.getElementById("ultConfirmacaoStatus");
    const nomeEl = document.getElementById("ultConfirmNome");
    const whatsappEl = document.getElementById("ultConfirmWhatsapp");

    if (confirmado && nome && whatsapp) {
        statusEl.textContent = "Uma confirmação foi enviada pelo painel principal:";
        nomeEl.textContent = `Nome: ${nome}`;
        whatsappEl.textContent = `WhatsApp: ${whatsapp}`;
    } else {
        statusEl.textContent = "Ainda não há confirmações realizadas pelo painel principal.";
        nomeEl.textContent = "";
        whatsappEl.textContent = "";
    }
}

function limparConfirmacaoPrincipal() {
    const existiaConfirmacao = localStorage.getItem("jaConfirmou") === "sim";
    localStorage.removeItem("nomeConfirmado");
    localStorage.removeItem("whatsappConfirmado");
    localStorage.removeItem("jaConfirmou");
    localStorage.removeItem("confirmados");

    carregarConfirmacaoPrincipal();

    if (existiaConfirmacao) {
        mostrarMensagem("Última confirmação do painel principal removida.", "sucesso");
    } else {
        mostrarMensagem("Não havia confirmação do painel principal para remover.", "erro");
    }
}

 // CARREGAR DADOS DO LOCALSTORAGE
        let convidados = JSON.parse(localStorage.getItem("convidados")) || [];

        // ATUALIZAR VISUALIZAÇÃO
        function atualizarLista() {
            const lista = document.getElementById("listaConvidados");
            const filtro = document.getElementById("filtro").value.toLowerCase();

            const convidadosFiltrados = convidados.filter(c => 
                c.nome.toLowerCase().includes(filtro)
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

            lista.innerHTML = convidadosFiltrados.map((convidado, index) => `
                <div class="convidado-item">
                    <div class="convidado-info">
                        <div class="convidado-nome">${convidado.nome}</div>
                        <div class="convidado-status">
                            ${convidado.confirmado ? 
                                '<span class="status-confirmado"><i class="bi bi-check-circle-fill"></i> Confirmado</span>' :
                                '<span class="status-nao-confirmado"><i class="bi bi-x-circle-fill"></i> Pendente</span>'
                            }
                            ${convidado.telefone ? `<span>(${convidado.telefone})</span>` : ''}
                            ${convidado.notas ? `<span>${convidado.notas}</span>` : ''}
                        </div>
                    </div>
                    <div class="convidado-acoes">
                        ${!convidado.confirmado ? 
                            `<button class="btn btn-success btn-pequeno" onclick="confirmarConvidado(${convidados.indexOf(convidado)})">
                                <i class="bi bi-check"></i> Confirmar
                            </button>` : ''
                        }
                        <button class="btn btn-danger btn-pequeno" onclick="deletarConvidado(${convidados.indexOf(convidado)})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `).join("");
        }

        // ATUALIZAR ESTATÍSTICAS
        function atualizarEstatisticas() {
            const total = convidados.length;
            const confirmados = convidados.filter(c => c.confirmado).length;
            const pendentes = total - confirmados;
            const percentual = total === 0 ? 0 : Math.round((confirmados / total) * 100);

            document.getElementById("totalConvidados").textContent = total;
            document.getElementById("totalConfirmados").textContent = confirmados;
            document.getElementById("totalPendentes").textContent = pendentes;
            document.getElementById("percentualConfirmacao").textContent = percentual + "%";
        }

        // ADICIONAR CONVIDADO
        function adicionarConvidado() {
            const nome = document.getElementById("nomeConvidado").value.trim();
            const telefone = document.getElementById("telefonConvidado").value.trim();
            const status = document.getElementById("statusConvidado").value;
            const notas = document.getElementById("notasConvidado").value.trim();

            if (!nome) {
                mostrarMensagem("Por favor, insira um nome", "erro");
                return;
            }

            const novoConvidado = {
                id: Date.now(),
                nome,
                telefone,
                confirmado: status === "confirmado",
                notas,
                dataAdicao: new Date().toLocaleDateString("pt-BR")
            };

            convidados.push(novoConvidado);
            salvarDados();

            document.getElementById("nomeConvidado").value = "";
            document.getElementById("telefonConvidado").value = "";
            document.getElementById("statusConvidado").value = "pendente";
            document.getElementById("notasConvidado").value = "";

            mostrarMensagem("Convidado adicionado com sucesso!", "sucesso");
            atualizarLista();
            atualizarEstatisticas();
        }

        // CONFIRMAR CONVIDADO
        function confirmarConvidado(index) {
            convidados[index].confirmado = true;
            salvarDados();
            atualizarLista();
            atualizarEstatisticas();
            mostrarMensagem(`${convidados[index].nome} confirmado!`, "sucesso");
        }

        // DELETAR CONVIDADO
        function deletarConvidado(index) {
            if (confirm(`Deseja deletar ${convidados[index].nome}?`)) {
                const nome = convidados[index].nome;
                convidados.splice(index, 1);
                salvarDados();
                atualizarLista();
                atualizarEstatisticas();
                mostrarMensagem(`${nome} removido!`, "sucesso");
            }
        }

        // RESETAR CONFIRMAÇÕES
        function resetarContadoresFesta() {
            if (confirm("Deseja resetar todas as confirmações? Isso não pode ser desfeito!")) {
                localStorage.removeItem("confirmados");
                localStorage.removeItem("jaConfirmou");
                convidados.forEach(c => c.confirmado = false);
                salvarDados();
                atualizarLista();
                atualizarEstatisticas();
                mostrarMensagem("Confirmações resetadas!", "sucesso");
            }
        }

        // LIMPAR TUDO
        function limparTodosDados() {
            if (confirm("Deseja limpar TODOS os convidados? Isso não pode ser desfeito!")) {
                convidados = [];
                localStorage.removeItem("convidados");
                localStorage.removeItem("confirmados");
                localStorage.removeItem("jaConfirmou");
                salvarDados();
                atualizarLista();
                atualizarEstatisticas();
                mostrarMensagem("Todos os dados foram limpos!", "sucesso");
            }
        }

        // SALVAR DADOS
        function salvarDados() {
            localStorage.setItem("convidados", JSON.stringify(convidados));
        }

        // MOSTRAR MENSAGEM
        function mostrarMensagem(texto, tipo) {
            const mensagem = document.getElementById("mensagem");
            mensagem.textContent = texto;
            mensagem.className = `mensagem ${tipo}`;
            setTimeout(() => {
                mensagem.className = "mensagem";
            }, 3000);
        }

        // FILTRO EM TEMPO REAL
        document.getElementById("filtro").addEventListener("input", atualizarLista);

        // CARREGAR DADOS AO ABRIR
        atualizarLista();
        atualizarEstatisticas();
        carregarConfirmacaoPrincipal();
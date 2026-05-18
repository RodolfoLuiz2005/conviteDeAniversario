import { db } from "./firebase.js";
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

const adminPassword = "Cf182025";
const confirmacoesCollection = collection(db, "confirmacoes");
const convidadosCollection = collection(db, "convidados");
let convidados = [];

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

async function carregarConfirmacaoPrincipal() {
    const statusEl = document.getElementById("ultConfirmacaoStatus");
    const nomeEl = document.getElementById("ultConfirmNome");
    const whatsappEl = document.getElementById("ultConfirmWhatsapp");

    try {
        const q = query(confirmacoesCollection, orderBy("createdAt", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            statusEl.textContent = "Última confirmação registrada no banco de dados:";
            nomeEl.textContent = `Nome: ${data.nome}`;
            whatsappEl.textContent = `WhatsApp: ${data.whatsapp}`;
            return;
        }
    } catch (error) {
        console.warn("Não foi possível carregar a última confirmação do Firestore:", error);
    }

    statusEl.textContent = "Ainda não há confirmações realizadas pelo painel principal.";
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
            console.warn("Não foi possível remover a confirmação do Firestore:", error);
        }
    }

    localStorage.removeItem("nomeConfirmado");
    localStorage.removeItem("whatsappConfirmado");
    localStorage.removeItem("jaConfirmou");
    localStorage.removeItem("confirmados");
    localStorage.removeItem("confirmacaoDocId");

    carregarConfirmacaoPrincipal();

    if (existiaConfirmacao) {
        mostrarMensagem("Última confirmação do painel principal removida.", "sucesso");
    } else {
        mostrarMensagem("Não havia confirmação do painel principal para remover.", "erro");
    }
}

        async function carregarConvidados() {
            try {
                const q = query(convidadosCollection, orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                convidados = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    docId: doc.id,
                }));
                atualizarLista();
                atualizarEstatisticas();
            } catch (error) {
                console.warn("Não foi possível carregar convidados do Firestore:", error);
                convidados = [];
                atualizarLista();
                atualizarEstatisticas();
            }
        }

        function listenConvidados() {
            const q = query(convidadosCollection, orderBy("createdAt", "desc"));
            onSnapshot(q, (snapshot) => {
                convidados = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    docId: doc.id,
                }));
                atualizarLista();
                atualizarEstatisticas();
            }, (error) => {
                console.warn("Erro no listener de convidados Firestore:", error);
            });
        }

        function listenUltimaConfirmacao() {
            const q = query(confirmacoesCollection, orderBy("createdAt", "desc"), limit(1));
            onSnapshot(q, (snapshot) => {
                const statusEl = document.getElementById("ultConfirmacaoStatus");
                const nomeEl = document.getElementById("ultConfirmNome");
                const whatsappEl = document.getElementById("ultConfirmWhatsapp");

                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    statusEl.textContent = "Última confirmação registrada no banco de dados:";
                    nomeEl.textContent = `Nome: ${data.nome}`;
                    whatsappEl.textContent = `WhatsApp: ${data.whatsapp}`;
                } else {
                    statusEl.textContent = "Ainda não há confirmações realizadas pelo painel principal.";
                    nomeEl.textContent = "";
                    whatsappEl.textContent = "";
                }
            }, (error) => {
                console.warn("Erro no listener de confirmações Firestore:", error);
            });
        }

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

        function sincronizarConfirmados() {
            const confirmados = convidados.filter(c => c.confirmado).length;
            localStorage.setItem("confirmados", confirmados);
        }

        function atualizarEstatisticas() {
            const total = convidados.length;
            const confirmados = convidados.filter(c => c.confirmado).length;
            const pendentes = total - confirmados;
            const percentual = total === 0 ? 0 : Math.round((confirmados / total) * 100);

            document.getElementById("totalConvidados").textContent = total;
            document.getElementById("totalConfirmados").textContent = confirmados;
            document.getElementById("totalPendentes").textContent = pendentes;
            document.getElementById("percentualConfirmacao").textContent = percentual + "%";
            
            sincronizarConfirmados();
        }

        async function adicionarConvidado() {
            const nome = document.getElementById("nomeConvidado").value.trim();
            const telefone = document.getElementById("telefonConvidado").value.trim();
            const status = document.getElementById("statusConvidado").value;
            const notas = document.getElementById("notasConvidado").value.trim();

            if (!nome) {
                mostrarMensagem("Por favor, insira um nome", "erro");
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
                mostrarMensagem("Convidado adicionado com sucesso!", "sucesso");
                atualizarLista();
                atualizarEstatisticas();
            } catch (error) {
                console.error("Erro ao adicionar convidado no Firestore:", error);
                mostrarMensagem("Erro ao adicionar convidado.", "erro");
            }

            document.getElementById("nomeConvidado").value = "";
            document.getElementById("telefonConvidado").value = "";
            document.getElementById("statusConvidado").value = "pendente";
            document.getElementById("notasConvidado").value = "";
        }

        async function confirmarConvidado(index) {
            const convidado = convidados[index];
            if (!convidado?.docId) {
                return;
            }

            try {
                await updateDoc(doc(convidadosCollection, convidado.docId), {
                    confirmado: true,
                });
                convidados[index].confirmado = true;
                atualizarLista();
                atualizarEstatisticas();
                mostrarMensagem(`${convidado.nome} confirmado!`, "sucesso");
            } catch (error) {
                console.error("Erro ao confirmar convidado:", error);
                mostrarMensagem("Erro ao confirmar convidado.", "erro");
            }
        }

        async function deletarConvidado(index) {
            const convidado = convidados[index];
            if (!convidado?.docId) {
                return;
            }

            if (confirm(`Deseja deletar ${convidado.nome}?`)) {
                try {
                    await deleteDoc(doc(convidadosCollection, convidado.docId));
                    convidados.splice(index, 1);
                    atualizarLista();
                    atualizarEstatisticas();
                    mostrarMensagem(`${convidado.nome} removido!`, "sucesso");
                } catch (error) {
                    console.error("Erro ao deletar convidado:", error);
                    mostrarMensagem("Erro ao remover convidado.", "erro");
                }
            }
        }

        async function resetarContadoresFesta() {
            if (confirm("Deseja resetar todas as confirmações? Isso não pode ser desfeito!")) {
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
                    convidados = convidados.map((item) => ({ ...item, confirmado: false }));
                    atualizarLista();
                    atualizarEstatisticas();
                    mostrarMensagem("Confirmações resetadas!", "sucesso");
                } catch (error) {
                    console.error("Erro ao resetar confirmações:", error);
                    mostrarMensagem("Erro ao resetar confirmações.", "erro");
                }
            }
        }

        async function limparTodosDados() {
            if (confirm("Deseja limpar TODOS os convidados? Isso não pode ser desfeito!")) {
                try {
                    const snapshot = await getDocs(convidadosCollection);
                    const batch = writeBatch(db);
                    snapshot.docs.forEach((docItem) => {
                        batch.delete(doc(convidadosCollection, docItem.id));
                    });
                    await batch.commit();
                    convidados = [];
                    localStorage.removeItem("jaConfirmou");
                    sincronizarConfirmados();
                    atualizarLista();
                    atualizarEstatisticas();
                    mostrarMensagem("Todos os dados foram limpos!", "sucesso");
                } catch (error) {
                    console.error("Erro ao limpar todos os convidados:", error);
                    mostrarMensagem("Erro ao limpar convidados.", "erro");
                }
            }
        }

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
        carregarConvidados();
        carregarConfirmacaoPrincipal();
        listenConvidados();
        listenUltimaConfirmacao();

        // Tornar estas funções disponíveis para os handlers inline do HTML
        window.adicionarConvidado = adicionarConvidado;
        window.confirmarConvidado = confirmarConvidado;
        window.deletarConvidado = deletarConvidado;
        window.resetarContadoresFesta = resetarContadoresFesta;
        window.limparTodosDados = limparTodosDados;
        window.limparConfirmacaoPrincipal = limparConfirmacaoPrincipal;
        window.carregarConfirmacaoPrincipal = carregarConfirmacaoPrincipal;
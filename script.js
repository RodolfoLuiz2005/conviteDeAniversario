
        // DATA DO EVENTO

        const dataEvento = new Date(
            "September 19, 2026 12:00:00"
        ).getTime();

        const atualizarContador = () => {

            const agora = new Date().getTime();

            const distancia = dataEvento - agora;

            const dias = Math.floor(
                distancia / (1000 * 60 * 60 * 24)
            );

            const horas = Math.floor(
                (distancia % (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60)
            );

            const minutos = Math.floor(
                (distancia % (1000 * 60 * 60)) /
                (1000 * 60)
            );

            const segundos = Math.floor(
                (distancia % (1000 * 60)) / 1000
            );

            document.getElementById("dias").innerHTML = dias;
            document.getElementById("horas").innerHTML = horas;
            document.getElementById("minutos").innerHTML = minutos;
            document.getElementById("segundos").innerHTML = segundos;

            if (distancia < 0) {

                document.querySelector(".contador").innerHTML =
                    "<h2>🎉 A festa começou!</h2>";

            }

        }

        setInterval(atualizarContador, 1000);

        // CONFIRMAR PRESENÇA

        const btnConfirmar =
            document.getElementById("btnConfirmar");

        const nomeConfirmacao =
            document.getElementById("nomeConfirmacao");

        const whatsappConfirmacao =
            document.getElementById("whatsappConfirmacao");

        const contadorPessoas =
            document.getElementById("contadorPessoas");

        let totalConfirmados =
            localStorage.getItem("confirmados") || 0;

        contadorPessoas.innerHTML =
            totalConfirmados;

        const jaConfirmou =
            localStorage.getItem("jaConfirmou");

        if (jaConfirmou === "sim") {

            btnConfirmar.innerHTML =
                "💙 Presença Confirmada";

            btnConfirmar.disabled = true;

            btnConfirmar.style.opacity = ".7";

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

        // SINCRONIZAR CONTADOR COM MUDANÇAS DO PAINEL ADMINISTRATIVO
        window.addEventListener("storage", (e) => {
            if (e.key === "confirmados") {
                totalConfirmados = e.newValue || 0;
                contadorPessoas.innerHTML = totalConfirmados;
                contadorPessoas.classList.add("pulse");
                setTimeout(() => {
                    contadorPessoas.classList.remove("pulse");
                }, 500);
            }
        });

        const adminPassword = "Cf182025";
        const btnPainelAdm = document.getElementById("btnPainelAdm");
        const btnAbrirAdmFooter = document.getElementById("btnAbrirAdmFooter");

        function abrirPainelAdm() {
            const senha = prompt("Digite a senha do painel administrativo:");
            if (senha === adminPassword) {
                sessionStorage.setItem("adminAutorizado", "sim");
                window.location.href = "adm.html";
            } else {
                alert("Senha incorreta. Acesso negado.");
            }
        }

        btnPainelAdm?.addEventListener("click", abrirPainelAdm);
        btnAbrirAdmFooter?.addEventListener("click", abrirPainelAdm);

        // FUNÇÃO PARA REINICIALIZAR O CONTADOR
        function resetarContador() {
            localStorage.removeItem("confirmados");
            localStorage.removeItem("jaConfirmou");
            totalConfirmados = 0;
            contadorPessoas.innerHTML = "0";
            btnConfirmar.innerHTML = "<i class=\"bi bi-check-circle-fill\"></i> Confirmar Presença";
            btnConfirmar.disabled = false;
            btnConfirmar.style.opacity = "1";
            console.log("Contador de confirmados reiniciado!");
        }

        btnConfirmar.addEventListener("click", () => {
            const nome = nomeConfirmacao?.value.trim() || "";
            const whatsapp = whatsappConfirmacao?.value.trim() || "";

            if (!nome) {
                alert("Por favor, informe seu nome completo antes de confirmar a presença.");
                nomeConfirmacao?.focus();
                return;
            }

            if (!whatsapp) {
                alert("Por favor, informe seu número de WhatsApp antes de confirmar a presença.");
                whatsappConfirmacao?.focus();
                return;
            }

            totalConfirmados++;

            localStorage.setItem(
                "confirmados",
                totalConfirmados
            );

            localStorage.setItem(
                "jaConfirmou",
                "sim"
            );

            localStorage.setItem("nomeConfirmado", nome);
            localStorage.setItem("whatsappConfirmado", whatsapp);

            contadorPessoas.innerHTML =
                totalConfirmados;

            if (nomeConfirmacao) {
                nomeConfirmacao.disabled = true;
            }

            if (whatsappConfirmacao) {
                whatsappConfirmacao.disabled = true;
            }

            contadorPessoas.classList.add("pulse");

            setTimeout(() => {

                contadorPessoas.classList.remove("pulse");

            }, 500);

            btnConfirmar.innerHTML =
                "💙 Presença Confirmada";

            btnConfirmar.disabled = true;

            btnConfirmar.style.opacity = ".7";

        });

        // MODAL PRESENTES

        const abrirPresentes =
            document.getElementById("abrirPresentes");

        const modalPresentes =
            document.getElementById("modalPresentes");

        const fecharModal =
            document.getElementById("fecharModal");

        abrirPresentes.addEventListener("click", () => {

            modalPresentes.classList.add("ativo");

        });

        fecharModal.addEventListener("click", () => {

            modalPresentes.classList.remove("ativo");

        });

        // FECHAR CLICANDO FORA

        modalPresentes.addEventListener("click", (e) => {

            if (e.target === modalPresentes) {

                modalPresentes.classList.remove("ativo");

            }

        });
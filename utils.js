// Validação e Formatting de Dados
export function validarWhatsapp(numero) {
  const regex = /^(\+55|55)?[\s]?(\(?\d{2}\)?)?[\s]?(9)?[\s]?(\d{4})-?(\d{4})$/;
  return regex.test(numero.replace(/\D/g, ""));
}

export function formatarWhatsapp(numero) {
  const apenasNumeros = numero.replace(/\D/g, "");
  const numeros = apenasNumeros.slice(-11);
  
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }
  return numero;
}

export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarNome(nome) {
  return nome.trim().length >= 3 && nome.trim().length <= 100;
}

export function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function sanitizarEntrada(texto) {
  return escapeHtml(texto.trim());
}

// Toast Notifications
export function mostrarToast(mensagem, tipo = "info", duracao = 3000) {
  const cores = {
    sucesso: "#4CAF50",
    erro: "#f44336",
    aviso: "#ff9800",
    info: "#2196F3",
  };

  const div = document.createElement("div");
  div.textContent = mensagem;
  div.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: ${cores[tipo] || cores.info};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(div);

  setTimeout(() => {
    div.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => div.remove(), 300);
  }, duracao);
}

// Adicionar estilos de animação
if (!document.getElementById("toast-styles")) {
  const style = document.createElement("style");
  style.id = "toast-styles";
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Export de dados
export function exportarCSV(dados, nomeArquivo = "dados.csv") {
  const headers = Object.keys(dados[0]);
  const csv = [
    headers.join(","),
    ...dados.map((obj) => headers.map((h) => JSON.stringify(obj[h])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportarJSON(dados, nomeArquivo = "dados.json") {
  const json = JSON.stringify(dados, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Rate Limiting Client-side
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  permitir(chave) {
    const agora = Date.now();
    const ultimaTentativa = this.attempts.get(chave) || [];

    // Remover tentativas fora da janela
    const tentativasValidas = ultimaTentativa.filter((t) => agora - t < this.windowMs);

    if (tentativasValidas.length >= this.maxAttempts) {
      return false;
    }

    tentativasValidas.push(agora);
    this.attempts.set(chave, tentativasValidas);
    return true;
  }

  reset(chave) {
    this.attempts.delete(chave);
  }
}

// Dark Mode
export function inicializarDarkMode() {
  const html = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("darkMode");
  const isDark = saved ? saved === "true" : prefersDark;

  if (isDark) {
    html.setAttribute("data-theme", "dark");
  }

  return {
    toggle: () => {
      const atualmente = html.getAttribute("data-theme") === "dark";
      html.setAttribute("data-theme", atualmente ? "light" : "dark");
      localStorage.setItem("darkMode", !atualmente);
    },
    isDark: () => html.getAttribute("data-theme") === "dark",
  };
}

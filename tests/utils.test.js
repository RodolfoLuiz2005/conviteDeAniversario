import { validarWhatsapp, validarEmail, validarNome, RateLimiter, escapeHtml } from "../utils.js";

describe("Validação de Dados", () => {
  test("validarWhatsapp deve aceitar número válido", () => {
    expect(validarWhatsapp("(81) 99999-9999")).toBe(true);
    expect(validarWhatsapp("81999999999")).toBe(true);
  });

  test("validarWhatsapp deve rejeitar número inválido", () => {
    expect(validarWhatsapp("123")).toBe(false);
    expect(validarWhatsapp("abc")).toBe(false);
  });

  test("validarEmail deve aceitar email válido", () => {
    expect(validarEmail("teste@example.com")).toBe(true);
  });

  test("validarEmail deve rejeitar email inválido", () => {
    expect(validarEmail("teste@")).toBe(false);
    expect(validarEmail("teste.com")).toBe(false);
  });

  test("validarNome deve aceitar nome válido", () => {
    expect(validarNome("João Silva")).toBe(true);
  });

  test("validarNome deve rejeitar nome muito curto", () => {
    expect(validarNome("Jo")).toBe(false);
  });
});

describe("Rate Limiter", () => {
  test("deve permitir até o limite", () => {
    const limiter = new RateLimiter(3, 60000);
    expect(limiter.permitir("teste")).toBe(true);
    expect(limiter.permitir("teste")).toBe(true);
    expect(limiter.permitir("teste")).toBe(true);
    expect(limiter.permitir("teste")).toBe(false);
  });

  test("deve resetar corretamente", () => {
    const limiter = new RateLimiter(2, 60000);
    limiter.permitir("teste");
    limiter.permitir("teste");
    limiter.reset("teste");
    expect(limiter.permitir("teste")).toBe(true);
  });
});

describe("HTML Escape", () => {
  test("deve escapar tags perigosas", () => {
    expect(escapeHtml("<script>alert('XSS')</script>")).toBe(
      "&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;"
    );
  });

  test("deve escapar quotes", () => {
    expect(escapeHtml('foo"bar')).toBe('foo&quot;bar');
  });
});

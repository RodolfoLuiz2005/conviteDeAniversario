export default {
  testEnvironment: "jsdom",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["utils.js", "script.js", "adm.js", "!node_modules/**"],
};

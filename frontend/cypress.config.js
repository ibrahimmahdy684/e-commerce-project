const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // frontend URL (matches Vite dev server)
    env: {
      apiUrl: "http://localhost:5000", // backend URL
    },
  },
});

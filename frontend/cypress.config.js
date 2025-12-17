const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5174", // frontend URL (matches Vite dev server)
    env: {
      apiUrl: "http://localhost:5000/api", // backend URL
    },
  },
});

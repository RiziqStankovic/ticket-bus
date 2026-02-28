const { createProxyMiddleware } = require("http-proxy-middleware");

// Target API - dari env atau localhost
const apiUrl = process.env.REACT_APP_API_URL || "";
const target = apiUrl
  ? apiUrl.replace(/\/$/, "")
  : "http://localhost:5000";

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};

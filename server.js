const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use("/", createProxyMiddleware({
  target: "https://hailuoai.video",
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Optional: inject cookie for session-based access
    proxyReq.setHeader('cookie', 'proxy_server=2');
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

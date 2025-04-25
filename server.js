const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware");
const path = require("path");

const app = express();

// Block specific paths like /logout
app.use("/logout", (req, res) => {
  res.status(403).send("🚫 Logout blocked by proxy.");
});

app.use("/manage-account", (req, res) => {
  res.status(403).send("🚫 Account settings blocked.");
});

// Reverse proxy with response modification
app.use("/", createProxyMiddleware({
  target: "https://hailuoai.video",
  changeOrigin: true,
  selfHandleResponse: true, // Let us modify HTML
  onProxyReq: (proxyReq, req, res) => {
    // Inject the session cookie here if needed
    proxyReq.setHeader('cookie', 'proxy_server=2');
  },
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    const contentType = proxyRes.headers['content-type'] || "";
    if (contentType.includes("text/html")) {
      let body = responseBuffer.toString("utf8");

      // Inject JS to hide logout and settings options
      body = body.replace("</body>", `
        <script>
          setInterval(() => {
            const elements = document.querySelectorAll("*");
            elements.forEach(el => {
              if (el.innerText && (
                  el.innerText.includes("Log out") ||
                  el.innerText.includes("Manage Account") ||
                  el.innerText.includes("Manage Subscription")
              )) {
                el.style.display = "none";
              }
            });
          }, 500);
        </script>
      </body>`);

      return body;
    }

    return responseBuffer;
  }),
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});

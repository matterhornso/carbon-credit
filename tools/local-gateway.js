// Minimal local stand-in for the API gateway this monorepo's services assume
// sits in front of them (carbon-credit-webapp/src/api/configs/Endpoints.ts
// builds every URL as `{BASE_URL}{service}/api/v1/{route}`, and carbon-credit's
// own Auth/User/Role.service.ts wrappers hardcode the same `/xxx/api/v1/...`
// shape) — but no gateway exists in this checkout. Each backend service
// already serves its own routes under `/api/v1/...` natively (confirmed via
// each service's generated routes.ts); the gateway's only real job is
// stripping the leading `/{serviceName}` routing segment. This proxy does
// just that, for local dev only.
const http = require("http");

const ROUTES = [
  { prefix: "/auth", target: "http://localhost:3601" },
  { prefix: "/user", target: "http://localhost:3600" },
  { prefix: "/rbac", target: "http://localhost:3602" },
  { prefix: "/carbon", target: "http://localhost:4001" },
];

const PORT = process.env.GATEWAY_PORT || 3699;

const server = http.createServer((req, res) => {
  const route = ROUTES.find((r) => req.url.startsWith(r.prefix));
  if (!route) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "no local-gateway route for " + req.url }));
    return;
  }
  const targetUrl = new URL(route.target + req.url.slice(route.prefix.length));
  const proxyReq = http.request(
    {
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: { ...req.headers, host: targetUrl.host },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on("error", (err) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "local-gateway upstream error: " + err.message }));
  });
  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log("local-gateway listening on " + PORT);
  ROUTES.forEach((r) => console.log("  " + r.prefix + "/* -> " + r.target + "/*"));
});

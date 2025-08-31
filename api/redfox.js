const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "0.0.0.0";
  const ua = req.headers['user-agent'] || "";
  
  if (!/^clash\.meta\/1\.10\.\d+$/i.test(ua))
    return res.status(403).send("Unauthorized client");

  const RAW_YAML_URL = "https://raw.githubusercontent.com/dxluminant/auto/refs/heads/main/redfox.yaml";
  const MAPPING_URL = "https://raw.githubusercontent.com/dxluminant/auto/refs/heads/main/allowed.json";

  let groups;
  try {
    groups = await fetch(MAPPING_URL).then(r => r.json());
  } catch (err) {
    return res.status(502).send(`Mapping fetch error: ${err.message}`);
  }

  const matchedGroup = groups.find(group => 
    (group.allowed_ips || []).some(ip => {
      const [o1, o2, o3] = ip.split(".").map(Number);
      const [c1, c2, c3] = clientIP.split(".").map(Number);
      return o1 === c1 && o2 === c2 && o3 === c3;
    })
  );

  if (!matchedGroup) {
    const dummy = `proxies:
- type: socks5
  server: 1.1.1.1
  port: 0000
  username: dummy
  password: dummy
  name: Package Expired
`;
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    return res.send(dummy);
  }

  let yaml;
  try {
    yaml = await fetch(RAW_YAML_URL).then(r => r.text());
  } catch (err) {
    return res.status(502).send(`YAML fetch error: ${err.message}`);
  }

  const allowedProxies = (matchedGroup.proxies || []).map(p => p.name);
  const result = "proxies:\n" + yaml.split("- type:")
    .filter(Boolean)
    .filter(block => {
      const name = block.split("\n").find(l => l.trim().startsWith("name:"))?.split("name:")[1]?.trim();
      return name && allowedProxies.includes(name);
    })
    .map(block => "- type:" + block)
    .join("");

  res.setHeader("Content-Type", "text/yaml; charset=utf-8");
  res.send(result.replace(/\n /

System: You are Grok built by xAI.

Your response was cut off. Here's a complete, compressed version of the script with the same functionality, optimized for brevity and clarity:

```javascript
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "0.0.0.0";
  const ua = req.headers['user-agent'] || "";
  
  if (!/^clash\.meta\/1\.10\.\d+$/i.test(ua))
    return res.status(403).send("Unauthorized client");

  const RAW_YAML_URL = "https://raw.githubusercontent.com/dxluminant/auto/refs/heads/main/redfox.yaml";
  const MAPPING_URL = "https://raw.githubusercontent.com/dxluminant/auto/refs/heads/main/allowed.json";

  let groups;
  try {
    groups = await fetch(MAPPING_URL).then(r => r.json());
  } catch (err) {
    return res.status(502).send(`Mapping fetch error: ${err.message}`);
  }

  const matchedGroup = groups.find(group => 
    (group.allowed_ips || []).some(ip => {
      const [o1, o2, o3] = ip.split(".").map(Number);
      const [c1, c2, c3] = clientIP.split(".").map(Number);
      return o1 === c1 && o2 === c2 && o3 === c3;
    })
  );

  if (!matchedGroup) {
    const dummy = `proxies:
- type: socks5
  server: 1.1.1.1
  port: 0000
  username: dummy
  password: dummy
  name: Package Expired
`;
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    return res.send(dummy);
  }

  let yaml;
  try {
    yaml = await fetch(RAW_YAML_URL).then(r => r.text());
  } catch (err) {
    return res.status(502).send(`YAML fetch error: ${err.message}`);
  }

  const allowedProxies = (matchedGroup.proxies || []).map(p => p.name);
  const result = "proxies:\n" + yaml.split("- type:")
    .filter(Boolean)
    .filter(block => {
      const name = block.split("\n").find(l => l.trim().startsWith("name:"))?.split("name:")[1]?.trim();
      return name && allowedProxies.includes(name);
    })
    .map(block => "- type:" + block)
    .join("");

  res.setHeader("Content-Type", "text/yaml; charset=utf-8");
  res.send(result.replace(/\n/g, "\r\n"));
};

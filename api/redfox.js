const fetch = require("node-fetch"); // v2 style require

module.exports = async function handler(req, res) {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "0.0.0.0";
  const ua = req.headers['user-agent'] || "";

  if (!/^clash\.meta\/1\.10\.\d+$/i.test(ua)) {
    return res.status(403).send("Unauthorized client");
  }

  const RAW_YAML_URL = "https://raw.githubusercontent.com/dxluminant/auto/refs/heads/main/redfox.yaml";
  const MAPPING_URL = "https://raw.githubusercontent.com/dxluminant/auto/refs/heads/main/allowed.json";

  let GROUPS = [];
  try {
    GROUPS = await fetch(MAPPING_URL).then(r => r.json());
  } catch (err) {
    return res.status(502).send("Mapping fetch error: " + err.message);
  }

  let matchedGroup = null;
  for (const group of GROUPS) {
    const allowedIPs = group.allowed_ips || [];
    const ipAllowed = allowedIPs.some(ip => {
      const octets = ip.split(".").map(n => parseInt(n,10));
      const clientOctets = clientIP.split(".").map(n => parseInt(n,10));
      if (octets.length !==4 || clientOctets.length !==4) return false;
      return octets[0]===clientOctets[0] && octets[1]===clientOctets[1] && octets[2]===clientOctets[2];
    });
    if (ipAllowed) { matchedGroup = group; break; }
  }

  if (!matchedGroup) {
    const dummy = `proxies:
- type: "socks5"
  server: "1.1.1.1"
  port: "0000"
  username: "dummy"
  password: "dummy"
  name: Package Expired
`;
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    return res.send(dummy);
  }

  const allowedProxyNames = (matchedGroup.proxies || []).map(p=>p.name);

  let yamlText = "";
  try {
    yamlText = await fetch(RAW_YAML_URL).then(r=>r.text());
  } catch (err) {
    return res.status(502).send("YAML fetch error: "+err.message);
  }

  const blocks = yamlText.split("- type:").filter(Boolean);
  let result = "proxies:\n";
  blocks.forEach(block=>{
    const nameLine = block.split("\n").find(l=>l.trim().startsWith("name:"));
    if(!nameLine) return;
    const proxyName = nameLine.split("name:")[1].trim();
    if(allowedProxyNames.includes(proxyName)) result += "- type:"+block;
  });

  res.setHeader("Content-Type","text/yaml; charset=utf-8");
  res.send(result.replace(/\n/g,"\r\n"));
}

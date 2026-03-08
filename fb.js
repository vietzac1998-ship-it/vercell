const https = require('https');

function fbFetch(fbPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.facebook.com',
      path: fbPath,
      method: 'GET',
      headers: { 'User-Agent': 'LARA-Ads-Dashboard/1.0' }
    };
    let raw = '';
    const req = https.request(options, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('Parse error')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const { path: fbPath } = req.query;
  if (!fbPath) {
    res.status(400).json({ error: 'Thiếu tham số path' });
    return;
  }

  try {
    const data = await fbFetch(decodeURIComponent(fbPath));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

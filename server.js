// Ava chat server. Node 18+, zero dependencies.  Run:  ANTHROPIC_API_KEY=sk-ant-... node server.js
// Then set window.NPC_API="http://localhost:8787/chat" in index.html (or your deployed URL).
const http = require('http');
const { persona } = require('./persona');
const API_KEY = '';   // <- put your Anthropic key between the quotes
const KEY = API_KEY || process.env.ANTHROPIC_API_KEY, MODEL = process.env.MODEL || 'claude-sonnet-5-5';
const PORT = process.env.PORT || 8787, ORIGIN = process.env.ALLOW_ORIGIN || '*';   // set ALLOW_ORIGIN to your site in production
if (!KEY) { console.error('Set ANTHROPIC_API_KEY'); process.exit(1); }
const hits = new Map();   // tiny per-IP rate limit: 20 requests / minute
const limited = ip => { const n = Date.now(), a = (hits.get(ip) || []).filter(t => n - t < 60000); a.push(n); hits.set(ip, a); return a.length > 20; };
const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST,OPTIONS' };
http.createServer(async (req, res) => {
  const send = (c, o) => { res.writeHead(c, { ...cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
  if (req.method === 'OPTIONS') return send(204, {});
  if (req.method !== 'POST' || req.url !== '/chat') return send(404, { error: 'not found' });
  if (limited(req.socket.remoteAddress)) return send(429, { error: 'slow down' });
  let body = ''; for await (const c of req) { body += c; if (body.length > 20000) return send(413, { error: 'too big' }); }
  try {
    const { messages = [], ctx = {} } = JSON.parse(body);
    const clean = messages.slice(-12).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 500) }));
    while (clean.length && clean[0].role !== 'user') clean.shift();
    if (!clean.length) return send(400, { error: 'no messages' });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system: persona(ctx), messages: clean })
    });
    const j = await r.json();
    if (!r.ok) { console.error(j); return send(502, { error: 'upstream' }); }
    send(200, { reply: (j.content || []).map(b => b.text || '').join('').trim() });
  } catch (e) { console.error(e); send(500, { error: 'server' }); }
}).listen(PORT, () => console.log('Ava server on http://localhost:' + PORT + '/chat'));

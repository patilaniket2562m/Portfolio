const { persona } = require('../persona');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(404).json({ error: 'not found' });

  try {
    const { messages = [], ctx = {} } = req.body || {};
    const clean = messages.slice(-12)
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 500) }));
    while (clean.length && clean[0].role !== 'user') clean.shift();
    if (!clean.length) return res.status(400).json({ error: 'no messages' });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.MODEL || 'claude-sonnet-5-5',
        max_tokens: 300,
        system: persona(ctx),
        messages: clean
      })
    });
    const j = await r.json();
    if (!r.ok) { console.error(j); return res.status(502).json({ error: 'upstream' }); }
    res.status(200).json({ reply: (j.content || []).map(b => b.text || '').join('').trim() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server' });
  }
};

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

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: persona(ctx) }] },
          contents: clean.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          generationConfig: { maxOutputTokens: 800, temperature: 0.8 }
        })
      }
    );
    const j = await r.json();
    if (!r.ok) { console.error(j); return res.status(502).json({ error: 'upstream' }); }
    const reply = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [])
      .map(p => p.text || '').join('').trim();
    if (!reply) { console.error(j); return res.status(502).json({ error: 'empty' }); }
    res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server' });
  }
};

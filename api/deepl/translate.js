import { forwardTextsToDeepL } from '../../deepl-server-forward.js';

function resolveKey() {
  return String(process.env.DEEPL_API_KEY || process.env.VITE_DEEPL_API_KEY || '').trim();
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = resolveKey();
  if (!key) {
    return res.status(503).json({ error: 'DEEPL_KEY_MISSING', message: 'DeepL API key not configured on server' });
  }

  let body = req.body;
  if (body == null || body === '') {
    return res.status(400).json({ error: 'Missing body' });
  }
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const texts = body?.texts;
  if (!Array.isArray(texts)) {
    return res.status(400).json({ error: 'Expected { texts: string[] }' });
  }

  try {
    const translated = await forwardTextsToDeepL(texts, key);
    return res.status(200).json({ translations: translated.map((text) => ({ text })) });
  } catch (e) {
    const status = e.status && Number(e.status) >= 400 ? Number(e.status) : 502;
    return res.status(status).json({
      error: e.code || 'DEEPL_ERROR',
      message: e.message || String(e),
    });
  }
}

export default async function handler(req, res) {
  res.status(410).json({
    error: 'Gone',
    message:
      'Chat-ul PULS nu mai trece prin n8n. Asistentul apelează Groq direct din aplicație.',
  });
}

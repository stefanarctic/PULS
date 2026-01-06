export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the external webhook server URL from environment variable or use default
    const webhookServerUrl = process.env.WEBHOOK_SERVER_URL || 'http://13.61.39.82:5678';
    const webhookPath = '/webhook/chat';
    const targetUrl = `${webhookServerUrl}${webhookPath}`;

    console.log('Proxying request to:', targetUrl);
    console.log('Request body:', JSON.stringify(req.body));

    // Forward the request to the external webhook server
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Get the response text
    const responseText = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response text length:', responseText.length);

    // Forward the status code
    res.status(response.status);

    // Forward the content type if available
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Send the response back to the client
    res.send(responseText);
  } catch (error) {
    console.error('Error proxying webhook request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}


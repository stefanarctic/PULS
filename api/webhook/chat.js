export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the external webhook server URL from environment variable or use default
    // Default to the production webhook server URL
    const webhookServerUrl = process.env.WEBHOOK_SERVER_URL || 'https://automations.puls-fizica.ro';
    const webhookPath = '/webhook/chat';
    const targetUrl = `${webhookServerUrl}${webhookPath}`;

    console.log('Proxying request to:', targetUrl);
    console.log('Request body:', JSON.stringify(req.body));

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Forward the request to the external webhook server
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle specific fetch errors
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout:', targetUrl);
        return res.status(504).json({ 
          error: 'Gateway timeout',
          message: 'Request to webhook server timed out after 30 seconds'
        });
      }
      
      // Handle network errors
      if (fetchError.code === 'ECONNREFUSED' || fetchError.code === 'ENOTFOUND' || fetchError.code === 'ETIMEDOUT') {
        console.error('Network error:', fetchError.code, fetchError.message);
        return res.status(502).json({ 
          error: 'Bad gateway',
          message: `Cannot connect to webhook server: ${fetchError.message}`,
          code: fetchError.code
        });
      }
      
      throw fetchError; // Re-throw if it's not a handled error
    }
  } catch (error) {
    console.error('Error proxying webhook request:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
}


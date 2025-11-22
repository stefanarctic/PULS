import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT
});

export default function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('ImageKit auth request received');
    console.log('ImageKit config:', {
      publicKey: imagekit.options.publicKey,
      urlEndpoint: imagekit.options.urlEndpoint
    });

    const authParams = imagekit.getAuthenticationParameters();
    console.log('Generated auth params:', {
      hasSignature: !!authParams.signature,
      hasExpire: !!authParams.expire,
      hasToken: !!authParams.token,
      expire: authParams.expire ? new Date(authParams.expire * 1000) : 'missing'
    });
    
    // Validate that we have the required parameters
    if (!authParams.signature || !authParams.expire || !authParams.token) {
      console.error('ImageKit authentication parameters are missing:', authParams);
      return res.status(500).json({ error: 'Failed to generate authentication parameters' });
    }

    console.log('ImageKit auth successful, expire:', new Date(authParams.expire * 1000));
    res.status(200).json(authParams);
  } catch (error) {
    console.error('Error in ImageKit auth endpoint:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

import ImageKit from "imagekit";

// Note: Private key should NEVER be in client-side code
// This client-side instance only uses public key for generating auth params
// For operations requiring private key, use the server-side API endpoint
const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT
});

// Funcție pentru a obține parametrii de autentificare ImageKit
export const getImageKitAuth = () => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    
    // Validate that we have the required parameters
    if (!authParams.signature || !authParams.expire || !authParams.token) {
      throw new Error('Failed to generate authentication parameters');
    }
    
    return authParams;
  } catch (error) {
    console.error('Error generating ImageKit auth:', error);
    throw error;
  }
};


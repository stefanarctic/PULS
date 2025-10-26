import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: "public_6rkxL+q+51xT8d2+GHpJeNSzOTE=",
  privateKey: "private_oJjrNiZncRmpFuzBumLFxAk1NWg=",
  urlEndpoint: "https://ik.imagekit.io/v0wqjmdfc"
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


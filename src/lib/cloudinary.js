// Cloudinary configuration pentru upload direct din browser
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  // Opțional: setează folder implicit din preset; dacă presetul are deja folder, nu mai trimitem din client
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER
};

// Funcție pentru a obține URL-ul de upload Cloudinary
export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
};

// Funcție pentru a face upload la Cloudinary
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  // Trimite folder doar dacă nu e definit deja în preset. Dacă presetul gestionează folderul, poți elimina linia de mai jos.
  if (CLOUDINARY_CONFIG.folder) {
    formData.append('folder', CLOUDINARY_CONFIG.folder);
  }
  // Notă: Pentru upload-urile unsigned, transformările trebuie configurate în preset (nu din client).
  
  try {
    const response = await fetch(getCloudinaryUploadUrl(), {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      const message = (data && data.error && data.error.message) ? data.error.message : `Upload failed: ${response.status}`;
      throw new Error(message);
    }

    return data.secure_url; // Returnează URL-ul securizat
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};


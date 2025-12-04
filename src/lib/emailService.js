/**
 * Email service for sending problem suggestions
 * Uses EmailJS to send emails from the client side
 */

import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Initialize EmailJS (will be loaded from CDN)
let emailjsInitialized = false;

const initializeEmailJS = () => {
  if (typeof window !== 'undefined' && window.emailjs && !emailjsInitialized) {
    // EmailJS is already loaded, just mark as initialized
    emailjsInitialized = true;
    return Promise.resolve();
  }
  
  // Load EmailJS from CDN if not already loaded
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('EmailJS can only be used in browser environment'));
      return;
    }

    if (window.emailjs) {
      emailjsInitialized = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      if (window.emailjs) {
        // Initialize EmailJS with public key (you'll need to set this in env)
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
        if (publicKey) {
          window.emailjs.init(publicKey);
        }
        emailjsInitialized = true;
        resolve();
      } else {
        reject(new Error('Failed to load EmailJS'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load EmailJS script'));
    document.head.appendChild(script);
  });
};

/**
 * Generate URL with problem data encoded as query parameters
 * @param {Object} problemData - The problem data to encode
 * @returns {string} URL with encoded problem data
 */
const generateAddProblemURL = (problemData) => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : import.meta.env.VITE_APP_URL; // Fallback pentru server-side
  
  const params = new URLSearchParams();
  params.set('addProblem', '1');
  params.set('titlu', problemData.titlu || '');
  params.set('descriere', problemData.descriere || '');
  params.set('categorie', problemData.categorie || '');
  params.set('dificultate', problemData.dificultate || '');
  params.set('continut', problemData.continut || '');
  params.set('punctajTotal', problemData.punctajTotal || 0);
  
  // Encode complex data as base64 JSON
  if (problemData.formule && problemData.formule.length > 0) {
    params.set('formule', btoa(JSON.stringify(problemData.formule)));
  }
  
  if (problemData.date && Object.keys(problemData.date).length > 0) {
    params.set('date', btoa(JSON.stringify(problemData.date)));
  }
  
  if (problemData.subpuncte && problemData.subpuncte.length > 0) {
    params.set('subpuncte', btoa(JSON.stringify(problemData.subpuncte)));
  }
  
  return `${baseUrl}/probleme?${params.toString()}`;
};

/**
 * Fetch user profile data from Firestore
 * @param {Object} user - The Firebase auth user object
 * @returns {Promise<Object>} User profile data
 */
const fetchUserProfile = async (user) => {
  if (!user?.uid) {
    return null;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Send a problem suggestion email to admins
 * @param {Object} problemData - The problem data to send
 * @param {Object} user - The user submitting the suggestion
 * @returns {Promise<void>}
 */
export const sendProblemSuggestion = async (problemData, user) => {
  const startTime = Date.now();
  console.log('📧 [Problem Suggestion] Starting email send process...', {
    problemTitle: problemData.titlu,
    userId: user?.uid,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  try {
    console.log('📧 [Problem Suggestion] Step 1/4: Initializing EmailJS...');
    await initializeEmailJS();

    if (!window.emailjs) {
      console.error('❌ [Problem Suggestion] EmailJS is not available');
      throw new Error('EmailJS is not available');
    }
    console.log('✅ [Problem Suggestion] EmailJS initialized successfully');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';

    if (!serviceId || !templateId) {
      console.error('❌ [Problem Suggestion] EmailJS configuration missing', {
        hasServiceId: !!serviceId,
        hasTemplateId: !!templateId
      });
      throw new Error('Serviciul de email nu este configurat. Te rugăm să contactezi administratorii la pulsphysics@gmail.com pentru a configura serviciul.');
    }
    console.log('✅ [Problem Suggestion] EmailJS configuration validated', {
      serviceId: serviceId.substring(0, 10) + '...',
      templateId: templateId.substring(0, 10) + '...'
    });

    // Fetch user profile data
    console.log('📧 [Problem Suggestion] Step 2/4: Fetching user profile...');
    const userProfile = await fetchUserProfile(user);
    console.log('✅ [Problem Suggestion] User profile fetched', {
      hasProfile: !!userProfile,
      userName: userProfile?.name || 'N/A',
      userAlias: userProfile?.alias || 'N/A',
      solvedProblems: userProfile?.solvedProblems?.length || 0
    });

    // Prepare email parameters with individual fields for EmailJS template
    console.log('📧 [Problem Suggestion] Step 3/4: Preparing email data...');
    const joinedDate = userProfile?.joinedDate ? new Date(userProfile.joinedDate).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A';
    
    const emailParams = {
      to_email: 'pulsphysics@gmail.com',
      from_name: userProfile?.name || user?.displayName || user?.email || 'Utilizator anonim',
      from_email: user?.email || 'noreply@pulsphysics.com',
      subject: `Sugestie problemă nouă: ${problemData.titlu || 'Fără titlu'}`,
      
      // User info
      user_name: userProfile?.name || user?.displayName || user?.email || 'Utilizator anonim',
      user_email: user?.email || 'N/A',
      user_alias: userProfile?.alias || 'N/A',
      user_description: userProfile?.description || '',
      user_profile_pic: userProfile?.profilePic || user?.photoURL || '',
      user_joined_date: joinedDate,
      user_solved_count: userProfile?.solvedProblems?.length || 0,
      user_favorites_count: userProfile?.favorites?.length || 0,
      user_id: user?.uid || 'N/A',
      
      // Problem info
      problem_titlu: problemData.titlu || 'N/A',
      problem_descriere: problemData.descriere || 'N/A',
      problem_categorie: problemData.categorie || 'N/A',
      problem_dificultate: problemData.dificultate || 'N/A',
      problem_continut: problemData.continut || 'N/A',
      problem_formule: problemData.formule?.filter(f => f.trim()).join('\n') || '',
      problem_date: problemData.date ? Object.entries(problemData.date).map(([k, v]) => `${k} = ${v}`).join('\n') : '',
      problem_subpuncte: problemData.subpuncte?.map((s, i) => `${i + 1}. ${s.cerinta || 'N/A'} (${s.punctaj || 0} puncte)`).join('\n') || '',
      problem_punctaj_total: problemData.punctajTotal || 0,
      problem_poze_count: problemData.poze?.length || 0,
      problem_index: problemData.index || 'N/A',
      submission_date: new Date().toLocaleString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      
      // URL for adding problem directly in PULS
      add_problem_url: generateAddProblemURL(problemData),
    };
    console.log('✅ [Problem Suggestion] Email data prepared', {
      subject: emailParams.subject,
      fromName: emailParams.from_name,
      fromEmail: emailParams.from_email,
      problemTitle: emailParams.problem_titlu,
      userEmail: emailParams.user_email
    });

    console.log('📧 [Problem Suggestion] Step 4/4: Sending email via EmailJS...');
    const response = await window.emailjs.send(serviceId, templateId, emailParams);
    
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      console.log('✅ [Problem Suggestion] Email sent successfully!', {
        status: response.status,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      return { success: true, duration };
    } else {
      console.error('❌ [Problem Suggestion] EmailJS returned non-200 status', {
        status: response.status,
        response: response
      });
      throw new Error(`EmailJS returned status ${response.status}`);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [Problem Suggestion] Error sending email', {
      error: error.message,
      errorName: error.name,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Format problem data into a beautiful HTML email
 */
const formatProblemDataAsHTML = (problemData, user, userProfile) => {
  const userName = userProfile?.name || user?.displayName || user?.email || 'Utilizator anonim';
  const userEmail = user?.email || 'N/A';
  const userId = user?.uid || 'N/A';
  const userAlias = userProfile?.alias || 'N/A';
  const userDescription = userProfile?.description || '';
  const profilePic = userProfile?.profilePic || user?.photoURL || '';
  const joinedDate = userProfile?.joinedDate ? new Date(userProfile.joinedDate).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';
  const solvedProblemsCount = userProfile?.solvedProblems?.length || 0;
  const favoritesCount = userProfile?.favorites?.length || 0;
  
  const submissionDate = new Date().toLocaleString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Format text with line breaks
  const formatText = (text) => {
    if (!text) return 'N/A';
    return escapeHtml(text).replace(/\n/g, '<br>');
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'ușor': '#4caf50',
      'mediu': '#ff9800',
      'dificil': '#f44336',
      'concurs': '#9c27b0'
    };
    return colors[difficulty?.toLowerCase()] || '#757575';
  };

  const difficultyColor = getDifficultyColor(problemData.dificultate);

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sugestie Problemă Nouă</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                📚 Sugestie Problemă Nouă
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                O nouă problemă a fost sugerată pentru platforma PULS
              </p>
            </td>
          </tr>

          <!-- User Info Section -->
          <tr>
            <td style="padding: 20px;">
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    ${profilePic ? `
                    <td style="width: 80px; vertical-align: top; padding-right: 15px;">
                      <img src="${escapeHtml(profilePic)}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea;" />
                    </td>
                    ` : ''}
                    <td style="vertical-align: top;">
                      <h3 style="margin: 0 0 10px; color: #212529; font-size: 18px; font-weight: 600;">
                        ${escapeHtml(userName)}
                      </h3>
                      ${userAlias !== 'N/A' && userAlias ? `
                      <p style="margin: 0 0 8px; color: #495057; font-size: 14px;">
                        <strong style="color: #667eea;">Alias:</strong> ${escapeHtml(userAlias)}
                      </p>
                      ` : ''}
                      <p style="margin: 0 0 8px; color: #495057; font-size: 14px;">
                        <strong style="color: #212529;">Email:</strong> ${escapeHtml(userEmail)}
                      </p>
                      ${userDescription ? `
                      <p style="margin: 10px 0 0; color: #6c757d; font-size: 13px; font-style: italic; border-top: 1px solid #dee2e6; padding-top: 10px;">
                        "${escapeHtml(userDescription)}"
                      </p>
                      ` : ''}
                    </td>
                  </tr>
                </table>
                
                <!-- User Stats -->
                <table role="presentation" style="width: 100%; margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0 10px 0 0; vertical-align: top;">
                      <p style="margin: 0; color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Membru din</p>
                      <p style="margin: 5px 0 0; color: #212529; font-size: 14px; font-weight: 600;">${joinedDate}</p>
                    </td>
                    <td style="padding: 0 10px; vertical-align: top;">
                      <p style="margin: 0; color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Probleme rezolvate</p>
                      <p style="margin: 5px 0 0; color: #212529; font-size: 14px; font-weight: 600;">${solvedProblemsCount}</p>
                    </td>
                    <td style="padding: 0 0 0 10px; vertical-align: top;">
                      <p style="margin: 0; color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Favorite</p>
                      <p style="margin: 5px 0 0; color: #212529; font-size: 14px; font-weight: 600;">${favoritesCount}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Problem Details -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <h2 style="margin: 0 0 15px; color: #212529; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                Detalii Problemă
              </h2>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #495057; font-weight: 600; width: 120px;">Titlu:</td>
                  <td style="padding: 8px 0; color: #212529;">${formatText(problemData.titlu)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #495057; font-weight: 600;">Descriere:</td>
                  <td style="padding: 8px 0; color: #212529;">${formatText(problemData.descriere || 'N/A')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #495057; font-weight: 600;">Categorie:</td>
                  <td style="padding: 8px 0; color: #212529;">
                    <span style="display: inline-block; background-color: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 12px; font-size: 13px;">
                      ${formatText(problemData.categorie)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #495057; font-weight: 600;">Dificultate:</td>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; background-color: ${difficultyColor}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">
                      ${formatText(problemData.dificultate)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Problem Content -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <h2 style="margin: 0 0 15px; color: #212529; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                Conținut / Enunț
              </h2>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
                <p style="margin: 0; color: #212529; white-space: pre-wrap;">${formatText(problemData.continut)}</p>
              </div>
            </td>
          </tr>

          ${problemData.formule && problemData.formule.length > 0 && problemData.formule[0] ? `
          <!-- Formulas -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <h2 style="margin: 0 0 15px; color: #212529; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                Formule
              </h2>
              <div style="background-color: #fff3e0; padding: 15px; border-radius: 6px; border-left: 4px solid #ff9800;">
                ${problemData.formule.filter(f => f.trim()).map((formula, index) => `
                  <p style="margin: ${index > 0 ? '10px' : '0'} 0 0; color: #212529; font-family: 'Courier New', monospace;">
                    <strong style="color: #ff9800;">${index + 1}.</strong> ${formatText(formula)}
                  </p>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          ${problemData.date && Object.keys(problemData.date).length > 0 ? `
          <!-- Variables/Data -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <h2 style="margin: 0 0 15px; color: #212529; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                Date / Variabile
              </h2>
              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; border-left: 4px solid #4caf50;">
                ${Object.entries(problemData.date).map(([key, value]) => `
                  <p style="margin: 0 0 8px; color: #212529; font-family: 'Courier New', monospace;">
                    <strong style="color: #2e7d32;">${escapeHtml(key)}</strong> = ${escapeHtml(value)}
                  </p>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          ${problemData.subpuncte && problemData.subpuncte.length > 0 ? `
          <!-- Subpoints -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <h2 style="margin: 0 0 15px; color: #212529; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                Cerințe (Subpuncte)
              </h2>
              <div style="background-color: #f3e5f5; padding: 15px; border-radius: 6px; border-left: 4px solid #9c27b0;">
                ${problemData.subpuncte.map((subpunct, index) => `
                  <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: ${index < problemData.subpuncte.length - 1 ? '1px solid #e1bee7' : 'none'};">
                    <p style="margin: 0 0 5px; color: #212529;">
                      <strong style="color: #7b1fa2;">${index + 1}.</strong> ${formatText(subpunct.cerinta || 'N/A')}
                    </p>
                    <p style="margin: 5px 0 0; color: #6c757d; font-size: 13px;">
                      <strong>Punctaj:</strong> ${subpunct.punctaj || 0} puncte
                    </p>
                  </div>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          ${problemData.punctajTotal ? `
          <!-- Total Score -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <div style="background-color: #fff9c4; padding: 15px; border-radius: 6px; border-left: 4px solid #fbc02d; text-align: center;">
                <p style="margin: 0; color: #212529; font-size: 18px; font-weight: 600;">
                  Punctaj Total: <span style="color: #f57f17; font-size: 24px;">${problemData.punctajTotal}</span> puncte
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          ${problemData.poze && problemData.poze.length > 0 ? `
          <!-- Images -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <h2 style="margin: 0 0 15px; color: #212529; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                Imagini Atașate
              </h2>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center;">
                <p style="margin: 0; color: #495057;">
                  <strong>${problemData.poze.length}</strong> ${problemData.poze.length === 1 ? 'imagine' : 'imagini'} ${problemData.poze.length === 1 ? 'atașată' : 'atașate'}
                </p>
                <p style="margin: 10px 0 0; color: #6c757d; font-size: 13px;">
                  (Imaginile sunt incluse în datele problemei)
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Metadata -->
          <tr>
            <td style="padding: 20px; background-color: #f8f9fa; border-top: 2px solid #e9ecef;">
              <h3 style="margin: 0 0 15px; color: #495057; font-size: 16px; font-weight: 600;">
                Informații Tehnice
              </h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-size: 13px; width: 140px;">Index propus:</td>
                  <td style="padding: 5px 0; color: #212529; font-size: 13px; font-weight: 500;">${problemData.index || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-size: 13px;">Data trimiterii:</td>
                  <td style="padding: 5px 0; color: #212529; font-size: 13px;">${submissionDate}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6c757d; font-size: 13px;">ID Utilizator:</td>
                  <td style="padding: 5px 0; color: #212529; font-size: 13px; font-family: 'Courier New', monospace;">${escapeHtml(userId)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #ffffff; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                Această problemă a fost sugerată prin platforma PULS.<br>
                Te rugăm să revizuiți și să adăugați problema în baza de date dacă este aprobată.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Format problem data into a readable plain text email (fallback)
 */
const formatProblemDataForEmail = (problemData, user, userProfile) => {
  const userName = userProfile?.name || user?.displayName || user?.email || 'un utilizator';
  const userAlias = userProfile?.alias || '';
  const userDescription = userProfile?.description || '';
  const joinedDate = userProfile?.joinedDate ? new Date(userProfile.joinedDate).toLocaleDateString('ro-RO') : 'N/A';
  const solvedProblemsCount = userProfile?.solvedProblems?.length || 0;
  const favoritesCount = userProfile?.favorites?.length || 0;
  
  const lines = [
    `O nouă problemă a fost sugerată de ${userName}`,
    '',
    '=== INFORMATII UTILIZATOR ===',
    `Nume: ${userName}`,
    userAlias ? `Alias: ${userAlias}` : '',
    `Email: ${user?.email || 'N/A'}`,
    userDescription ? `Descriere: ${userDescription}` : '',
    `Membru din: ${joinedDate}`,
    `Probleme rezolvate: ${solvedProblemsCount}`,
    `Favorite: ${favoritesCount}`,
    '',
    '=== DETALII PROBLEMĂ ===',
    '',
    `Titlu: ${problemData.titlu || 'N/A'}`,
    `Descriere: ${problemData.descriere || 'N/A'}`,
    `Categorie: ${problemData.categorie || 'N/A'}`,
    `Dificultate: ${problemData.dificultate || 'N/A'}`,
    '',
    '=== CONȚINUT/ENUNȚ ===',
    problemData.continut || 'N/A',
    '',
  ];

  if (problemData.formule && problemData.formule.length > 0 && problemData.formule[0]) {
    lines.push('=== FORMULE ===');
    problemData.formule.forEach((formula, index) => {
      if (formula.trim()) {
        lines.push(`${index + 1}. ${formula}`);
      }
    });
    lines.push('');
  }

  if (problemData.date && Object.keys(problemData.date).length > 0) {
    lines.push('=== DATE/VARIABILE ===');
    Object.entries(problemData.date).forEach(([key, value]) => {
      lines.push(`${key} = ${value}`);
    });
    lines.push('');
  }

  if (problemData.subpuncte && problemData.subpuncte.length > 0) {
    lines.push('=== CERINȚE (SUBPUNCTE) ===');
    problemData.subpuncte.forEach((subpunct, index) => {
      lines.push(`${index + 1}. ${subpunct.cerinta || 'N/A'} (${subpunct.punctaj || 0} puncte)`);
    });
    lines.push('');
  }

  if (problemData.punctajTotal) {
    lines.push(`Punctaj total: ${problemData.punctajTotal}`);
    lines.push('');
  }

  if (problemData.poze && problemData.poze.length > 0) {
    lines.push(`=== POZE ===`);
    lines.push(`${problemData.poze.length} poze atașate (verificați email-ul pentru imagini)`);
    lines.push('');
  }

  lines.push('=== METADATE ===');
  lines.push(`Index propus: ${problemData.index || 'N/A'}`);
  lines.push(`Creat la: ${new Date().toLocaleString('ro-RO')}`);
  lines.push(`Utilizator: ${user?.email || 'N/A'} (${user?.uid || 'N/A'})`);

  return lines.join('\n');
};


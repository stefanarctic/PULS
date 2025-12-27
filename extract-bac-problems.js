import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Mistral AI client
const apiKey = process.env.MISTRAL_API_KEY;
let mistralClient = null;
if (apiKey) {
    mistralClient = new Mistral({ apiKey: apiKey });
} else {
    console.warn('⚠️  MISTRAL_API_KEY not set. AI extraction will be skipped.');
}

// Configuration
const INPUT_DIR = path.join(__dirname, 'variante_transcribed');
const OUTPUT_DIR = path.join(__dirname, 'extracted_problems');
const IMAGE_OUTPUT_DIR = path.join(__dirname, 'extracted_problems', 'images');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGE_OUTPUT_DIR)) {
    fs.mkdirSync(IMAGE_OUTPUT_DIR, { recursive: true });
}

/**
 * Extract metadata from folder name
 * Example: "2011_proba_e_d_fizica_var_09" -> { year: 2011, variant: 9, type: "proba_e_d" }
 */
function extractMetadata(folderName) {
    const parts = folderName.split('_');
    const year = parseInt(parts[0]);
    
    let variant = null;
    let subjectArea = null;
    let type = null;
    
    // Try to extract variant number
    const variantMatch = folderName.match(/var[_\s]*(\d+)/i);
    if (variantMatch) {
        variant = parseInt(variantMatch[1]);
    }
    
    // Try to extract subject area from markdown content
    const subjectAreas = {
        'MECANICĂ': 'Mecanică',
        'MECANICA': 'Mecanică',
        'TERMODINAMICĂ': 'Termodinamică',
        'TERMODINAMICA': 'Termodinamică',
        'CURENTULUI CONTINUU': 'Curent continuu',
        'CURENT CONTINUU': 'Curent continuu',
        'OPtică': 'Optică',
        'OPTICA': 'Optică'
    };
    
    // Extract type
    if (folderName.includes('tehnologic')) {
        type = 'tehnologic';
    } else if (folderName.includes('teoretic') || folderName.includes('vocational')) {
        type = 'teoretic';
    } else if (folderName.includes('model')) {
        type = 'model';
    } else if (folderName.includes('simulare')) {
        type = 'simulare';
    }
    
    return { year, variant, subjectArea, type, folderName };
}

/**
 * Extract Subject II or Subject III from markdown content
 */
function extractSubject(markdown, subjectNumber) {
    // Pattern to match Subject II or Subject III
    // More flexible pattern that handles various formats
    const patterns = {
        2: /###\s*II\.\s*Rezolvați\s+următoarea\s+problemă[:\s]*\((\d+)\s*puncte?\)\s*\n\n([\s\S]*?)(?=###\s*III\.|##\s*[A-Z]|Probă scrisă|$)/i,
        3: /###\s*III\.\s*Rezolvați\s+următoarea\s+problemă[:\s]*\((\d+)\s*puncte?\)\s*\n\n([\s\S]*?)(?=###\s*[IVX]+\.|##\s*[A-Z]|Probă scrisă|$)/i
    };
    
    const pattern = patterns[subjectNumber];
    if (!pattern) return null;
    
    const match = markdown.match(pattern);
    if (!match) return null;
    
    const punctaj = parseInt(match[1]) || 15;
    let content = match[2].trim();
    
    // Remove trailing "Probă scrisă" text if present
    content = content.replace(/\nProbă scrisă.*$/i, '').trim();
    
    // Extract images referenced in this section
    const imageRefs = [];
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let imageMatch;
    
    while ((imageMatch = imagePattern.exec(content)) !== null) {
        imageRefs.push({
            alt: imageMatch[1],
            path: imageMatch[2]
        });
    }
    
    // Remove image references from content (images are handled in poze array)
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();
    
    // Clean up multiple consecutive newlines that might result from removing images
    content = content.replace(/\n{3,}/g, '\n\n');
    
    return {
        content,
        punctaj,
        imageRefs
    };
}

/**
 * Get image base64 data from pages
 */
function getImageBase64(pages, imagePath) {
    for (const page of pages) {
        if (page.images && Array.isArray(page.images)) {
            for (const image of page.images) {
                if (image.imagePath === imagePath || image.id === imagePath) {
                    return image.imageBase64 || null;
                }
            }
        }
    }
    return null;
}

/**
 * Try to read image file from disk
 */
function readImageFile(folderPath, imagePath) {
    const fullPath = path.join(folderPath, imagePath);
    if (fs.existsSync(fullPath)) {
        const imageBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(imagePath).toLowerCase().replace('.', '') || 'jpeg';
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
        return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    }
    return null;
}

/**
 * Extract subpuncte (subpoints) from problem content
 */
function extractSubpuncte(content) {
    const subpuncte = [];
    // Pattern to match subpoints like "a.", "b.", "c.", "d." at start of line or after newline
    // More robust pattern that handles multi-line subpoints
    const subpunctPattern = /(?:^|\n)([a-z])\.\s*([^\n]+(?:\n(?!\s*[a-z]\.)[^\n]+)*)/gim;
    let match;
    
    while ((match = subpunctPattern.exec(content)) !== null) {
        const letter = match[1];
        let cerinta = match[2].trim();
        
        // Clean up the cerinta - remove trailing periods and extra whitespace
        cerinta = cerinta.replace(/\s+/g, ' ').trim();
        
        if (cerinta.length > 10) { // Filter out very short matches
            subpuncte.push({
                cerinta: cerinta,
                punctaj: 0 // Will need manual assignment
            });
        }
    }
    
    // If no subpuncte found, try simpler pattern
    if (subpuncte.length === 0) {
        const altPattern = /([a-z])\.\s*([^\n]+)/gi;
        while ((match = altPattern.exec(content)) !== null) {
            const cerinta = match[2].trim();
            if (cerinta.length > 10) {
                subpuncte.push({
                    cerinta: cerinta,
                    punctaj: 0
                });
            }
        }
    }
    
    // If still no subpuncte found, treat entire content as one subpoint
    return subpuncte.length > 0 ? subpuncte : [{
        cerinta: content.trim(),
        punctaj: 0
    }];
}

/**
 * Determine subject area from markdown content
 */
function determineSubjectArea(markdown) {
    const subjectAreas = {
        'MECANICĂ': 'Mecanică',
        'MECANICA': 'Mecanică',
        'TERMODINAMICĂ': 'Termodinamică',
        'TERMODINAMICA': 'Termodinamică',
        'CURENTULUI CONTINUU': 'Curent continuu',
        'CURENT CONTINUU': 'Curent continuu',
        'OPtică': 'Optică',
        'OPTICA': 'Optică'
    };
    
    for (const [key, value] of Object.entries(subjectAreas)) {
        if (markdown.includes(`## ${key}`) || markdown.includes(`# ${key}`)) {
            return value;
        }
    }
    
    return null;
}

/**
 * Extract LaTeX formula from MathJax format (remove \( and \))
 */
function extractLatexFormula(mathJaxFormula) {
    return mathJaxFormula
        .replace(/\\\(/g, '')
        .replace(/\\\)/g, '')
        .trim();
}

/**
 * Get relevant formulas for a subject area (from Resurse.jsx)
 */
function getFormulasForSubject(subjectArea) {
    // Formule din Resurse.jsx - Mecanică
    const mecanicaFormulas = [
        { title: "Legea a doua a lui Newton", formula: "\\( \\vec{F} = m\\vec{a} \\)" },
        { title: "Forța de greutate", formula: "\\( G = mg \\)" },
        { title: "Forța de frecare", formula: "\\( F_f = \\mu N \\)" },
        { title: "Energia cinetică", formula: "\\( E_c = \\frac{1}{2}mv^2 \\)" },
        { title: "Energia potențială gravitațională", formula: "\\( E_p = mgh \\)" },
        { title: "Energia potențială elastică", formula: "\\( E_p = \\frac{1}{2}kx^2 \\)" },
        { title: "Lucrul mecanic", formula: "\\( L = F \\cdot d \\cdot \\cos(\\alpha) \\)" },
        { title: "Teorema variației energiei cinetice", formula: "\\( L = \\Delta E_c = \\frac{1}{2}mv_2^2 - \\frac{1}{2}mv_1^2 \\)" },
        { title: "Conservarea energiei mecanice", formula: "\\( E_m = E_c + E_p = const. \\)" },
        { title: "Impulsul", formula: "\\( \\vec{p} = m\\vec{v} \\)" },
        { title: "Conservarea impulsului", formula: "\\( m_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f} \\)" },
        { title: "Coeficientul de restituire", formula: "\\( e = \\frac{v_{2f} - v_{1f}}{v_{1i} - v_{2i}} \\)" },
        { title: "Mișcare uniformă", formula: "\\( x(t) = x_0 + vt \\)" },
        { title: "Mișcare uniform variată", formula: "\\( x(t) = x_0 + v_0t + \\frac{1}{2}at^2 \\)" },
        { title: "Viteza în mișcare uniform variată", formula: "\\( v(t) = v_0 + at \\)" },
        { title: "Ecuația lui Galilei", formula: "\\( v^2 = v_0^2 + 2a(x - x_0) \\)" },
        { title: "Mișcare circulară uniformă - accelerația centripetă", formula: "\\( a_c = \\frac{v^2}{R} = \\omega^2 R \\)" },
        { title: "Viteza unghiulară", formula: "\\( \\omega = \\frac{2\\pi}{T} = 2\\pi f \\)" },
        { title: "Forța centripetă", formula: "\\( F_c = m\\frac{v^2}{R} = m\\omega^2 R \\)" },
        { title: "Legea mișcării oscilatorii pe OX", formula: "\\( x(t) = A \\sin(\\omega t + \\phi) \\)" },
        { title: "Legea vitezei oscilatorii", formula: "\\( v(t) = \\omega A \\cos(\\omega t + \\phi) \\)" },
        { title: "Legea accelerației oscilatorii", formula: "\\( a(t) = -\\omega^2 A \\sin(\\omega t + \\phi) \\)" },
        { title: "Viteza unghiulară (oscilator)", formula: "\\( \\omega = \\sqrt{\\frac{k}{m}} \\)" },
        { title: "Perioada oscilației", formula: "\\( T = 2\\pi \\sqrt{\\frac{m}{k}} \\)" },
        { title: "Perioada pendulului gravitațional", formula: "\\( T = 2\\pi \\sqrt{\\frac{l}{g}} \\)" },
        { title: "Forța pe plan înclinat (componenta paralelă)", formula: "\\( F_{||} = mg \\sin(\\alpha) \\)" },
        { title: "Forța pe plan înclinat (componenta perpendiculară)", formula: "\\( F_{\\perp} = mg \\cos(\\alpha) \\)" },
        { title: "Accelerația pe plan înclinat", formula: "\\( a = g(\\sin(\\alpha) - \\mu \\cos(\\alpha)) \\)" },
        { title: "Puterea mecanică", formula: "\\( P = \\frac{L}{t} = F \\cdot v \\)" },
    ];

    // Formule din Resurse.jsx - Termodinamică
    const termodinamicaFormulas = [
        { title: "Prima lege a termodinamicii", formula: "\\( \\Delta U = Q - L \\)" },
        { title: "Ecuația de stare pentru gazul ideal", formula: "\\( pV = nRT \\)" },
        { title: "Entropia (Boltzmann)", formula: "\\( S = k_B \\ln \\Omega \\)" },
        { title: "A doua lege a termodinamicii", formula: "\\( \\Delta S \\geq \\frac{Q}{T} \\)" },
        { title: "Energia internă pentru gazul ideal", formula: "\\( U = \\frac{f}{2}nRT \\)" },
        { title: "Lucrul mecanic în procese reversibile", formula: "\\( L = \\int_{V_1}^{V_2} p \\, dV \\)" },
        { title: "Căldura specifică la volum constant", formula: "\\( C_V = \\left(\\frac{\\partial U}{\\partial T}\\right)_V \\)" },
        { title: "Entalpia", formula: "\\( H = U + pV \\)" },
        { title: "Energia liberă Helmholtz", formula: "\\( F = U - TS \\)" },
        { title: "Energia liberă Gibbs", formula: "\\( G = H - TS \\)" },
        { title: "Eficiența motorului Carnot", formula: "\\( \\eta = 1 - \\frac{T_C}{T_H} \\)" },
    ];

    // Formule pentru Curent continuu (nu sunt în Resurse.jsx, le adăugăm manual)
    const curentContinuuFormulas = [
        { title: "Intensitatea curentului", formula: "\\( I = \\frac{Q}{t} \\)" },
        { title: "Legea lui Ohm", formula: "\\( U = RI \\)" },
        { title: "Puterea electrică", formula: "\\( P = UI = I^2R = \\frac{U^2}{R} \\)" },
        { title: "Lucrul mecanic electric", formula: "\\( W = UIt = I^2Rt = \\frac{U^2t}{R} \\)" },
        { title: "Rezistența electrică", formula: "\\( R = \\rho \\frac{l}{S} \\)" },
        { title: "Rezistențe în serie", formula: "\\( R_{serie} = R_1 + R_2 + ... \\)" },
        { title: "Rezistențe în paralel", formula: "\\( \\frac{1}{R_{paralel}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ... \\)" },
        { title: "Tensiunea la borne", formula: "\\( U = E - Ir \\)" },
        { title: "Intensitatea în circuit", formula: "\\( I = \\frac{E}{R + r} \\)" },
        { title: "Puterea maximă", formula: "\\( P_{max} = \\frac{E^2}{4r} \\)" },
        { title: "Randamentul", formula: "\\( \\eta = \\frac{R}{R + r} \\)" },
        { title: "Energia consumată", formula: "\\( W = I^2Rt \\)" },
    ];

    // Formule pentru Optică (nu sunt în Resurse.jsx, le adăugăm manual)
    const opticaFormulas = [
        { title: "Indicele de refracție", formula: "\\( n = \\frac{c}{v} \\)" },
        { title: "Legea refracției (Snell)", formula: "\\( n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2) \\)" },
        { title: "Formula lentilelor subțiri", formula: "\\( \\frac{1}{f} = \\frac{1}{x_1} + \\frac{1}{x_2} \\)" },
        { title: "Mărirea liniară", formula: "\\( \\beta = \\frac{x_2}{x_1} = \\frac{y_2}{y_1} \\)" },
        { title: "Convergența", formula: "\\( C = \\frac{1}{f} \\)" },
        { title: "Convergența sistemului", formula: "\\( C_{total} = C_1 + C_2 + ... \\)" },
        { title: "Energia fotonului", formula: "\\( E = h\\nu = \\frac{hc}{\\lambda} \\)" },
        { title: "Efectul fotoelectric", formula: "\\( E_c = h\\nu - W \\)" },
        { title: "Unghiul critic", formula: "\\( \\sin(\\theta_{crit}) = \\frac{n_2}{n_1} \\)" },
        { title: "Deviația în prismă", formula: "\\( \\delta = (n - 1)A \\)" },
    ];

    const formulasMap = {
        'Mecanică': mecanicaFormulas,
        'Termodinamică': termodinamicaFormulas,
        'Curent continuu': curentContinuuFormulas,
        'Optică': opticaFormulas
    };

    const formulas = formulasMap[subjectArea] || [];
    
    // Extract LaTeX formulas (keep MathJax format)
    return formulas.map(f => extractLatexFormula(f.formula));
}

/**
 * Use AI to extract data and formulas from problem content
 */
async function extractDataWithAI(content, subjectArea) {
    if (!mistralClient) {
        // Fallback to regex extraction if AI is not available
        return extractData(content);
    }

    try {
        const prompt = `Ești un expert în fizică. Analizează următoarea problemă de fizică și extrage:

1. DATELE NUMERICE: Toate valorile numerice date în enunț cu unitățile lor (ex: m = 4 kg, v = 10 m/s, R = 2 m, etc.)
2. FORMULELE RELEVANTE: Formulele fizice necesare pentru rezolvarea acestei probleme din domeniul ${subjectArea || 'fizică'}

Problema:
${content}

Răspunde DOAR cu un JSON valid în următorul format (ATENȚIE: în JSON, backslash-urile trebuie dublate):
{
  "date": {
    "nume_variabila": "valoare unitate",
    "m": "4 kg",
    "v": "10 m/s"
  },
  "formule": [
    "F = ma",
    "E_c = \\\\frac{1}{2}mv^2"
  ]
}

IMPORTANT: 
- Pentru date, folosește numele variabilelor exact cum apar în problemă (ex: m, M, v_o, v_t, h, R, etc.)
- Pentru formule, folosește format LaTeX MathJax FĂRĂ delimiters \\( și \\) (ex: "F = ma", "E_c = \\\\frac{1}{2}mv^2", "pV = nRT", "\\\\vec{F} = m\\\\vec{a}")
- ÎN JSON, toate backslash-urile din formule trebuie să fie ESCAPE-UITE (dublate): \\\\ în loc de \\
- Include DOAR datele și formulele care sunt relevante pentru rezolvarea problemei
- Nu include constante generale precum g, R, N_A dacă nu sunt date explicit în problemă
- Formulele trebuie să fie în format LaTeX complet, cu toate simbolurile matematice corecte`;

        const response = await mistralClient.chat.complete({
            model: 'mistral-large-latest',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            maxTokens: 2000
        });

        const aiResponse = response.choices[0]?.message?.content || '';
        
        // Try to extract data using regex instead of JSON parsing (more robust)
        const extractedData = {};
        const extractedFormulas = [];
        
        // Extract date section
        const dateMatch = aiResponse.match(/"date"\s*:\s*\{([^}]*)\}/s);
        if (dateMatch) {
            const dateContent = dateMatch[1];
            // Extract key-value pairs: "key": "value"
            const datePairs = dateContent.match(/"([^"]+)"\s*:\s*"([^"]*)"/g);
            if (datePairs) {
                for (const pair of datePairs) {
                    const match = pair.match(/"([^"]+)"\s*:\s*"([^"]*)"/);
                    if (match) {
                        extractedData[match[1]] = match[2];
                    }
                }
            }
        }
        
        // Extract formule section
        const formuleMatch = aiResponse.match(/"formule"\s*:\s*\[(.*?)\]/s);
        if (formuleMatch) {
            const formuleContent = formuleMatch[1];
            // Extract formula strings (handle escaped quotes and backslashes)
            // Match: "formula content" (including escaped quotes)
            const formulaPattern = /"((?:[^"\\]|\\.)*)"/g;
            let formulaMatch;
            while ((formulaMatch = formulaPattern.exec(formuleContent)) !== null) {
                // Unescape the formula string
                let formula = formulaMatch[1]
                    .replace(/\\"/g, '"')  // Unescape quotes
                    .replace(/\\\\/g, '\\'); // Unescape backslashes
                extractedFormulas.push(formula);
            }
        }
        
        // If we extracted data, return it
        if (Object.keys(extractedData).length > 0 || extractedFormulas.length > 0) {
            // Clean formulas (remove MathJax delimiters if present)
            const cleanFormulas = extractedFormulas.map(f => extractLatexFormula(f));
            
            return {
                date: extractedData,
                formule: cleanFormulas
            };
        }
        
        // Fallback: try JSON parsing
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                // Try to fix JSON by replacing problematic patterns
                let jsonStr = jsonMatch[0];
                
                // Replace unescaped backslashes in string values
                // Strategy: find strings and fix backslashes inside them
                jsonStr = jsonStr.replace(/"([^"]*)"/g, (match, content) => {
                    // Escape backslashes that aren't part of valid escape sequences
                    const fixed = content.replace(/\\(?!["\\/bfnrtu0-9x])/g, '\\\\');
                    return `"${fixed}"`;
                });
                
                const parsed = JSON.parse(jsonStr);
                
                const cleanFormulas = (parsed.formule || []).map(f => {
                    if (typeof f === 'string') {
                        return extractLatexFormula(f);
                    }
                    return String(f);
                });
                
                return {
                    date: parsed.date || {},
                    formule: cleanFormulas
                };
            } catch (e) {
                // Log for debugging
                const preview = aiResponse.substring(0, 500);
                console.warn(`  ⚠️  Failed to parse AI response: ${e.message}`);
                console.warn(`  📝 Response preview: ${preview}...`);
            }
        }
    } catch (error) {
        console.warn(`  ⚠️  AI extraction failed: ${error.message}, using fallback`);
    }

    // Fallback to regex extraction
    return {
        date: extractData(content),
        formule: extractRelevantFormulas(content, subjectArea)
    };
}

/**
 * Extract data (numerical values with units) from problem content (fallback method)
 */
function extractData(content) {
    const data = {};
    
    // Pattern to match: $variable = value unit$ or variable = value unit
    // Examples: $M = 40\,\mathrm{t}$, $R = 2$ m, masa $m = 0,5$ kg
    
    // Pattern 1: LaTeX format with \mathrm: $var = value\,\mathrm{unit}$
    // Handles: $h = 15\,\mathrm{m}$, $v_o = 10\,\mathrm{m/s}$, $m = 0,2\,\mathrm{kg}$
    const latexPattern1 = /\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\\?\,\\?mathrm\{([^}]+)\}/g;
    let match;
    
    while ((match = latexPattern1.exec(content)) !== null) {
        const varName = match[1];
        let value = match[2].replace(',', '.');
        const unit = match[3].trim();
        data[varName] = `${value} ${unit}`;
    }
    
    // Pattern 1b: LaTeX format with \mathrm and optional spaces: $var = value \,\mathrm{unit}$
    const latexPattern1b = /\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\s*\\?\,\\?mathrm\{([^}]+)\}/g;
    while ((match = latexPattern1b.exec(content)) !== null) {
        const varName = match[1];
        let value = match[2].replace(',', '.');
        const unit = match[3].trim();
        if (!data[varName]) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 2: LaTeX format: $var = value$ unit (outside LaTeX)
    const latexPattern2 = /\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\$\s*([A-Za-z\/\s·Ω°²³⁻¹]+)/g;
    while ((match = latexPattern2.exec(content)) !== null) {
        const varName = match[1];
        let value = match[2].replace(',', '.');
        const unit = match[3].trim();
        if (!data[varName] && unit.length > 0) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 2b: LaTeX format: $var = value$ followed by unit in text (with space)
    const latexPattern2b = /\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\$\s+([A-Za-z\/\s·Ω°²³⁻¹]+)/g;
    while ((match = latexPattern2b.exec(content)) !== null) {
        const varName = match[1];
        let value = match[2].replace(',', '.');
        const unit = match[3].trim();
        if (!data[varName] && unit.length > 0) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 3: Simple format: var = value unit (without LaTeX, requires space before unit)
    const simplePattern = /\b([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\s+([A-Za-z\/\s·Ω°²³⁻¹]+)/g;
    while ((match = simplePattern.exec(content)) !== null) {
        const varName = match[1];
        let value = match[2].replace(',', '.');
        const unit = match[3].trim();
        // Skip if already found or if it's a common word
        if (!data[varName] && !['are', 'este', 'sunt', 'se', 'de', 'la', 'cu', 'si', 'și'].includes(varName.toLowerCase()) && unit.length > 0) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 4: Text format: "masa m = value unit" or "temperatura T = value unit"
    const textPattern = /(?:masa|temperatura|presiunea|volumul|viteza|accelerația|forța|energia|puterea|rezistența|tensiunea|intensitatea|curentul|distanța|raza|lungimea|înălțimea|unghiul|coeficientul|constanta|mărimea|valoarea|mărime|valoare)\s+([A-Za-z_][A-Za-z0-9_]*)\s*[=:]\s*([0-9,\.]+)\s*([A-Za-z\/\s·Ω°²³⁻¹]+)/gi;
    while ((match = textPattern.exec(content)) !== null) {
        const varName = match[1];
        let value = match[2].replace(',', '.');
        const unit = match[3].trim();
        if (!data[varName] && unit.length > 0) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 5: Constants mentioned: g = 10 m/s², R = 8,31 J/(mol·K), etc.
    const constantPattern = /(?:Se consideră|se consideră|Considerați|considerați|cunoscut|Cunoscut|se cunoaște|se cunoaște)[^.]*?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\s*([A-Za-z\/\s·Ω°²³⁻¹]+)/gi;
    while ((match = constantPattern.exec(content)) !== null) {
        const varName = match[1];
        let value = match[2].replace(',', '.');
        const unit = match[3].trim();
        if (!data[varName] && unit.length > 0) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 6: Variables in context: "având masa $m = 0,2\,\mathrm{kg}$" or "cu viteza $v_o = 10\,\mathrm{m/s}$"
    const contextPattern = /(?:având|cu|de|are|este|au|avem|aflat|se|care)\s+[^$]*?\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\\?\,\\?mathrm\{([^}]+)\}/gi;
    while ((match = contextPattern.exec(content)) !== null) {
        const varName = match[1];
        let value = match[2].replace(',', '.');
        const unit = match[3].trim();
        if (!data[varName]) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 7: Values given in text without LaTeX: "2000 N", "5000 N", "46 kN"
    // Look for numbers followed by units in text
    const textValuePattern = /\b([0-9,\.]+)\s+([A-Za-zΩ°²³⁻¹\/\s·]+(?:N|kg|g|m|s|V|A|Ω|J|W|K|mol|Pa|Hz|°C|°|rad|m\/s|m\/s²|km\/h|t|kN|MJ|kJ|mC|μC|nC|pC|eV|MeV|GeV))\b/gi;
    while ((match = textValuePattern.exec(content)) !== null) {
        const value = match[1].replace(',', '.');
        const unit = match[2].trim();
        // Only add if it looks like a physical quantity (has a unit)
        if (unit.length > 0 && unit.length < 20 && !data[`value_${Object.keys(data).length}`]) {
            // Try to find a variable name nearby
            const beforeMatch = content.substring(Math.max(0, match.index - 50), match.index);
            const varMatch = beforeMatch.match(/(?:masa|temperatura|presiunea|volumul|viteza|accelerația|forța|energia|puterea|rezistența|tensiunea|intensitatea|curentul|distanța|raza|lungimea|înălțimea|unghiul|coeficientul|constanta|mărimea|valoarea)\s+([A-Za-z_][A-Za-z0-9_]*)/i);
            if (varMatch) {
                const varName = varMatch[1];
                if (!data[varName]) {
                    data[varName] = `${value} ${unit}`;
                }
            }
        }
    }
    
    // Pattern 8: Extract values from "Forța ... este de X unit" or "are valoarea de X unit"
    const forceValuePattern = /(?:Forța|forța|Tensiunea|tensiunea|Intensitatea|intensitatea|Viteza|viteza|Accelerația|accelerația|Energia|energia|Puterea|puterea|Rezistența|rezistența|Distanța|distanța|Lungimea|lungimea|Raza|raza|Înălțimea|înălțimea|Masa|masa|Temperatura|temperatura|Presiunea|presiunea|Volumul|volumul)[^0-9]*?(?:este|are|de|valoarea|valoare)\s+(?:de\s+)?([0-9,\.]+)\s+([A-Za-zΩ°²³⁻¹\/\s·]+(?:N|kg|g|m|s|V|A|Ω|J|W|K|mol|Pa|Hz|°C|°|rad|m\/s|m\/s²|km\/h|t|kN|MJ|kJ|mC|μC|nC|pC|eV|MeV|GeV))/gi;
    while ((match = forceValuePattern.exec(content)) !== null) {
        const value = match[1].replace(',', '.');
        const unit = match[2].trim();
        // Extract variable name from the beginning of the match
        const fullMatch = match[0];
        const varMatch = fullMatch.match(/([A-Za-z_][A-Za-z0-9_]*)/);
        if (varMatch && unit.length > 0 && unit.length < 20) {
            const varName = varMatch[1].toLowerCase();
            // Map common Romanian words to variable names
            const varMap = {
                'forța': 'F',
                'tensiunea': 'T',
                'intensitatea': 'I',
                'viteza': 'v',
                'accelerația': 'a',
                'energia': 'E',
                'puterea': 'P',
                'rezistența': 'R',
                'distanța': 'd',
                'lungimea': 'l',
                'raza': 'R',
                'înălțimea': 'h',
                'masa': 'm',
                'temperatura': 'T',
                'presiunea': 'p',
                'volumul': 'V'
            };
            const mappedVar = varMap[varMatch[1].toLowerCase()] || varMatch[1];
            if (!data[mappedVar] || !data[varMatch[1]]) {
                data[mappedVar] = `${value} ${unit}`;
            }
        }
    }
    
    return data;
}

/**
 * Extract relevant formulas from content based on subject area and problem text
 */
function extractRelevantFormulas(content, subjectArea) {
    const allFormulas = getFormulasForSubject(subjectArea);
    const relevantFormulas = [];
    
    // Normalize content for matching (remove LaTeX delimiters, lowercase)
    const normalizedContent = content
        .replace(/\$[^$]+\$/g, '') // Remove LaTeX expressions
        .toLowerCase()
        .replace(/[^\w\s]/g, ' '); // Replace special chars with spaces
    
    // Check each formula against content
    for (const formulaObj of allFormulas) {
        // Extract formula string (remove MathJax delimiters)
        const formulaStr = extractLatexFormula(formulaObj.formula || formulaObj);
        
        // Extract variable names from formula
        const vars = formulaStr.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
        
        // Check if at least one variable from formula appears in content
        const found = vars.some(v => {
            const varLower = v.toLowerCase();
            return normalizedContent.includes(varLower) || 
                   content.includes(`$${v}`) || 
                   content.includes(`$${varLower}`) ||
                   content.includes(`\\mathrm{${v}}`) ||
                   content.includes(`\\mathrm{${varLower}}`);
        });
        
        if (found) {
            relevantFormulas.push(formulaStr);
        }
    }
    
    // If no formulas found, return common ones for the subject
    if (relevantFormulas.length === 0 && allFormulas.length > 0) {
        // Return first 3-5 most common formulas (extract formula strings)
        return allFormulas.slice(0, Math.min(5, allFormulas.length)).map(f => 
            extractLatexFormula(f.formula || f)
        );
    }
    
    return relevantFormulas;
}

/**
 * Extract subject area code and name from markdown content
 * Returns { code: 'A', area: 'Mecanică' } or null
 */
function extractSubjectAreaFromContent(markdown) {
    const subjectAreaPatterns = [
        { pattern: /##\s*A\.\s*MECANICĂ/i, area: 'Mecanică', code: 'A' },
        { pattern: /##\s*B\.\s*ELEMENTE\s*DE\s*TERMODINAMICĂ/i, area: 'Termodinamică', code: 'B' },
        { pattern: /##\s*C\.\s*PRODUCEREA\s*ȘI\s*UTILIZAREA\s*CURENTULUI\s*CONTINUU/i, area: 'Curent continuu', code: 'C' },
        { pattern: /##\s*C\.\s*CURENTULUI\s*CONTINUU/i, area: 'Curent continuu', code: 'C' },
        { pattern: /##\s*D\.\s*OPTICĂ/i, area: 'Optică', code: 'D' }
    ];
    
    for (const { pattern, area, code } of subjectAreaPatterns) {
        if (pattern.test(markdown)) {
            return { area, code };
        }
    }
    
    return null;
}

/**
 * Extract problems (II and III) from a section of markdown for a specific subject area
 */
async function extractProblemsFromSection(markdown, subjectArea, subjectCode, allPages, folderPath, metadata, folderName) {
    const problems = [];
    
    // Extract Subject II
    const subjectII = extractSubject(markdown, 2);
    if (subjectII) {
        const images = [];
        
        // Get images for Subject II
        for (const imgRef of subjectII.imageRefs) {
            let imageBase64 = getImageBase64(allPages, imgRef.path);
            
            // If not found in JSON, try reading from disk
            if (!imageBase64) {
                imageBase64 = readImageFile(folderPath, imgRef.path);
            }
            
            if (imageBase64) {
                images.push(imageBase64);
            }
        }
        
        const subpuncte = extractSubpuncte(subjectII.content);
        
        // Leave formulas and data empty - will be filled manually later
        const formule = [];
        const date = {};
        
        problems.push({
            titlu: `Problema II - ${subjectArea || 'Fizică'} - Bac ${metadata.year}${metadata.variant ? ` Var ${metadata.variant}` : ''}`,
            descriere: `Problema de bacalaureat - Subiectul II din ${subjectArea || 'Fizică'}, ${metadata.year}${metadata.variant ? `, Varianta ${metadata.variant}` : ''}${metadata.type ? `, ${metadata.type}` : ''}`,
            categorie: 'Bac',
            varianta: metadata.year.toString() + (metadata.variant ? ` Var ${metadata.variant}` : ''),
            dificultate: 'mediu',
            punctajTotal: subjectII.punctaj,
            continut: subjectII.content,
            formule: formule,
            date: date,
            subpuncte: subpuncte.map((sub, idx) => ({
                id: `${idx + 1}${String.fromCharCode(97 + idx)}`,
                cerinta: sub.cerinta,
                punctaj: sub.punctaj || Math.floor(subjectII.punctaj / subpuncte.length)
            })),
            poze: images,
            metadata: {
                source: folderName,
                year: metadata.year,
                variant: metadata.variant,
                type: metadata.type,
                subjectArea: subjectArea,
                subjectCode: subjectCode,
                subjectNumber: 2
            }
        });
    }
    
    // Extract Subject III
    const subjectIII = extractSubject(markdown, 3);
    if (subjectIII) {
        const images = [];
        
        // Get images for Subject III
        for (const imgRef of subjectIII.imageRefs) {
            let imageBase64 = getImageBase64(allPages, imgRef.path);
            
            // If not found in JSON, try reading from disk
            if (!imageBase64) {
                imageBase64 = readImageFile(folderPath, imgRef.path);
            }
            
            if (imageBase64) {
                images.push(imageBase64);
            }
        }
        
        const subpuncte = extractSubpuncte(subjectIII.content);
        
        // Leave formulas and data empty - will be filled manually later
        const formule = [];
        const date = {};
        
        problems.push({
            titlu: `Problema III - ${subjectArea || 'Fizică'} - Bac ${metadata.year}${metadata.variant ? ` Var ${metadata.variant}` : ''}`,
            descriere: `Problema de bacalaureat - Subiectul III din ${subjectArea || 'Fizică'}, ${metadata.year}${metadata.variant ? `, Varianta ${metadata.variant}` : ''}${metadata.type ? `, ${metadata.type}` : ''}`,
            categorie: 'Bac',
            varianta: metadata.year.toString() + (metadata.variant ? ` Var ${metadata.variant}` : ''),
            dificultate: 'mediu',
            punctajTotal: subjectIII.punctaj,
            continut: subjectIII.content,
            formule: formule,
            date: date,
            subpuncte: subpuncte.map((sub, idx) => ({
                id: `${idx + 1}${String.fromCharCode(97 + idx)}`,
                cerinta: sub.cerinta,
                punctaj: sub.punctaj || Math.floor(subjectIII.punctaj / subpuncte.length)
            })),
            poze: images,
            metadata: {
                source: folderName,
                year: metadata.year,
                variant: metadata.variant,
                type: metadata.type,
                subjectArea: subjectArea,
                subjectCode: subjectCode,
                subjectNumber: 3
            }
        });
    }
    
    return problems;
}

/**
 * Process a single JSON file
 */
async function processFile(folderPath, jsonFileName) {
    const jsonPath = path.join(folderPath, jsonFileName);
    const folderName = path.basename(folderPath);
    
    try {
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);
        
        if (!data.pages || !Array.isArray(data.pages)) {
            console.log(`  ⚠️  No pages found in ${jsonFileName}`);
            return [];
        }
        
        const metadata = extractMetadata(folderName);
        const problems = [];
        
        // Process each page separately to extract problems from each subject area
        for (let pageIndex = 0; pageIndex < data.pages.length; pageIndex++) {
            const page = data.pages[pageIndex];
            if (!page.markdown) continue;
            
            // Try to identify subject area from this page
            const subjectInfo = extractSubjectAreaFromContent(page.markdown);
            
            if (subjectInfo) {
                // Extract problems from this subject area
                const sectionProblems = await extractProblemsFromSection(
                    page.markdown,
                    subjectInfo.area,
                    subjectInfo.code,
                    data.pages,
                    folderPath,
                    metadata,
                    folderName
                );
                
                if (sectionProblems.length > 0) {
                    problems.push(...sectionProblems);
                    console.log(`    ✓ Found ${sectionProblems.length} problem(s) in ${subjectInfo.code}. ${subjectInfo.area}`);
                }
            } else {
                // If no subject area header found, try to determine from content
                const area = determineSubjectArea(page.markdown);
                if (area && area !== 'Unknown') {
                    const sectionProblems = await extractProblemsFromSection(
                        page.markdown,
                        area,
                        null,
                        data.pages,
                        folderPath,
                        metadata,
                        folderName
                    );
                    if (sectionProblems.length > 0) {
                        problems.push(...sectionProblems);
                    }
                }
            }
        }
        
        return problems;
        
    } catch (error) {
        console.error(`  ❌ Error processing ${jsonFileName}:`, error.message);
        return [];
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting extraction of Subject II and Subject III problems...\n');
    
    if (!fs.existsSync(INPUT_DIR)) {
        console.error(`❌ Input directory does not exist: ${INPUT_DIR}`);
        process.exit(1);
    }
    
    const folders = fs.readdirSync(INPUT_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    
    console.log(`Found ${folders.length} folders to process\n`);
    
    let totalProblems = 0;
    const allProblems = [];
    
    for (const folder of folders) {
        const folderPath = path.join(INPUT_DIR, folder);
        const jsonFiles = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            console.log(`  ⚠️  No JSON files in ${folder}`);
            continue;
        }
        
        console.log(`📁 Processing ${folder}...`);
        
        for (const jsonFile of jsonFiles) {
            const problems = await processFile(folderPath, jsonFile);
            allProblems.push(...problems);
            totalProblems += problems.length;
            
            if (problems.length > 0) {
                console.log(`  ✅ Extracted ${problems.length} problem(s) from ${jsonFile}`);
            }
        }
    }
    
    console.log(`\n📊 Total problems extracted: ${totalProblems}`);
    
    // Save all problems to a single JSON file
    const outputPath = path.join(OUTPUT_DIR, 'all-problems.json');
    fs.writeFileSync(outputPath, JSON.stringify(allProblems, null, 2), 'utf-8');
    console.log(`\n💾 Saved all problems to: ${outputPath}`);
    
    // Also save individual files for easier review
    const individualDir = path.join(OUTPUT_DIR, 'individual');
    if (!fs.existsSync(individualDir)) {
        fs.mkdirSync(individualDir, { recursive: true });
    }
    
    for (let i = 0; i < allProblems.length; i++) {
        const problem = allProblems[i];
        const fileName = `problem-${i + 1}-${problem.metadata.source}-sub${problem.metadata.subjectNumber}.json`;
        const filePath = path.join(individualDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(problem, null, 2), 'utf-8');
    }
    
    console.log(`💾 Saved ${allProblems.length} individual problem files to: ${individualDir}`);
    
    // Generate summary
    const summary = {
        totalProblems: totalProblems,
        byYear: {},
        bySubjectArea: {},
        bySubjectNumber: { 2: 0, 3: 0 },
        extractionDate: new Date().toISOString()
    };
    
    for (const problem of allProblems) {
        const year = problem.metadata.year;
        const subjectArea = problem.metadata.subjectArea || 'Unknown';
        const subjectNumber = problem.metadata.subjectNumber;
        
        summary.byYear[year] = (summary.byYear[year] || 0) + 1;
        summary.bySubjectArea[subjectArea] = (summary.bySubjectArea[subjectArea] || 0) + 1;
        summary.bySubjectNumber[subjectNumber] = (summary.bySubjectNumber[subjectNumber] || 0) + 1;
    }
    
    const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`📈 Summary saved to: ${summaryPath}`);
    
    console.log('\n✅ Extraction complete!');
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});



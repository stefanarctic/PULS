import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Get relevant formulas for a subject area
 */
function getFormulasForSubject(subjectArea) {
    const formulasBySubject = {
        'Mecanică': [
            'F = ma',
            'p = mv',
            'E_c = (1/2)mv²',
            'E_p = mgh',
            'W = F·d',
            'P = F·v',
            'F_c = mv²/R',
            'ω = v/R',
            'T = 2πR/v',
            'a_c = v²/R = ω²R',
            'F_e = -k·Δx',
            'T = 2π√(m/k)',
            'v = v₀ + at',
            's = v₀t + (1/2)at²',
            'v² = v₀² + 2as',
            'F_f = μ·N',
            'F = mg·sin(α)',
            'a = g(sin(α) - μ·cos(α))'
        ],
        'Termodinamică': [
            'pV = νRT',
            'pV = nRT',
            'U = (f/2)νRT',
            'Q = mcΔT',
            'Q = νC_VΔT',
            'Q = νC_pΔT',
            'L = pΔV',
            'L = ∫pdV',
            'ΔU = Q - L',
            'η = 1 - T_C/T_H',
            'W = Q_H - Q_C',
            'S = k_B·ln(Ω)',
            'ΔS ≥ Q/T',
            'C_V = (f/2)R',
            'C_p = C_V + R',
            'γ = C_p/C_V',
            'pV^γ = const',
            'TV^(γ-1) = const'
        ],
        'Curent continuu': [
            'I = Q/t',
            'I = U/R',
            'U = RI',
            'P = UI',
            'P = I²R',
            'P = U²/R',
            'W = UIt',
            'W = I²Rt',
            'W = U²t/R',
            'R = ρl/S',
            'R_serie = R₁ + R₂ + ...',
            '1/R_paralel = 1/R₁ + 1/R₂ + ...',
            'U = E - Ir',
            'I = E/(R + r)',
            'P_max = E²/(4r)',
            'η = R/(R + r)',
            'Q = I²Rt',
            'E = U + Ir'
        ],
        'Optică': [
            'n = c/v',
            'n₁sin(θ₁) = n₂sin(θ₂)',
            '1/f = 1/x₁ + 1/x₂',
            'β = x₂/x₁',
            'β = y₂/y₁',
            'C = 1/f',
            'C_total = C₁ + C₂',
            'E = hν',
            'E = hc/λ',
            'E_c = hν - W',
            'λ_min = hc/E',
            'sin(θ_crit) = n₂/n₁',
            'δ = (n - 1)A',
            'f = R/2',
            'M = -x₂/x₁'
        ]
    };
    
    return formulasBySubject[subjectArea] || [];
}

/**
 * Extract data (numerical values with units) from problem content
 */
function extractData(content) {
    const data = {};
    
    // Pattern to match: $variable = value unit$ or variable = value unit
    // Examples: $M = 40\,\mathrm{t}$, $R = 2$ m, masa $m = 0,5$ kg
    
    // Pattern 1: LaTeX format with \mathrm: $var = value\,\mathrm{unit}$
    const latexPattern1 = /\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\\?\,\\?mathrm\{([^}]+)\}/g;
    let match;
    
    while ((match = latexPattern1.exec(content)) !== null) {
        const varName = match[1];
        const value = match[2].replace(',', '.');
        const unit = match[3].trim();
        data[varName] = `${value} ${unit}`;
    }
    
    // Pattern 2: LaTeX format: $var = value$ unit (outside LaTeX)
    const latexPattern2 = /\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\$\s*([A-Za-z\/\s·]+)/g;
    while ((match = latexPattern2.exec(content)) !== null) {
        const varName = match[1];
        const value = match[2].replace(',', '.');
        const unit = match[3].trim();
        if (!data[varName]) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 3: Simple format: var = value unit (without LaTeX)
    const simplePattern = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\s*([A-Za-z\/\s·Ω]+)/g;
    while ((match = simplePattern.exec(content)) !== null) {
        const varName = match[1];
        const value = match[2].replace(',', '.');
        const unit = match[3].trim();
        // Skip if already found or if it's a common word
        if (!data[varName] && !['are', 'este', 'sunt', 'se', 'de', 'la', 'cu'].includes(varName.toLowerCase())) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 4: Text format: "masa m = value unit" or "temperatura T = value unit"
    const textPattern = /(?:masa|temperatura|presiunea|volumul|viteza|accelerația|forța|energia|puterea|rezistența|tensiunea|intensitatea|curentul|distanța|raza|lungimea|înălțimea|unghiul|coeficientul|constanta)\s+([A-Za-z_][A-Za-z0-9_]*)\s*[=:]\s*([0-9,\.]+)\s*([A-Za-z\/\s·Ω°]+)/gi;
    while ((match = textPattern.exec(content)) !== null) {
        const varName = match[2];
        const value = match[3].replace(',', '.');
        const unit = match[4].trim();
        if (!data[varName]) {
            data[varName] = `${value} ${unit}`;
        }
    }
    
    // Pattern 5: Constants mentioned: g = 10 m/s², R = 8,31 J/(mol·K), etc.
    const constantPattern = /(?:Se consideră|se consideră|Considerați|considerați|cunoscut|Cunoscut)[^.]*?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([0-9,\.]+)\s*([A-Za-z\/\s·Ω°²³⁻¹]+)/gi;
    while ((match = constantPattern.exec(content)) !== null) {
        const varName = match[1];
        const value = match[2].replace(',', '.');
        const unit = match[3].trim();
        if (!data[varName]) {
            data[varName] = `${value} ${unit}`;
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
    for (const formula of allFormulas) {
        // Extract variable names from formula
        const vars = formula.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
        
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
            relevantFormulas.push(formula);
        }
    }
    
    // If no formulas found, return common ones for the subject
    if (relevantFormulas.length === 0 && allFormulas.length > 0) {
        // Return first 3-5 most common formulas
        return allFormulas.slice(0, Math.min(5, allFormulas.length));
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
function extractProblemsFromSection(markdown, subjectArea, subjectCode, allPages, folderPath, metadata, folderName) {
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
        
        // Extract formulas and data
        const formule = extractRelevantFormulas(subjectII.content, subjectArea || 'Mecanică');
        const date = extractData(subjectII.content);
        
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
        
        // Extract formulas and data
        const formule = extractRelevantFormulas(subjectIII.content, subjectArea || 'Mecanică');
        const date = extractData(subjectIII.content);
        
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
function processFile(folderPath, jsonFileName) {
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
                const sectionProblems = extractProblemsFromSection(
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
                    const sectionProblems = extractProblemsFromSection(
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
function main() {
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
            const problems = processFile(folderPath, jsonFile);
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

try {
    main();
} catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
}


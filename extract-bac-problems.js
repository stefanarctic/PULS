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
        
        // Combine all markdown from all pages
        let fullMarkdown = '';
        for (const page of data.pages) {
            if (page.markdown) {
                fullMarkdown += '\n\n' + page.markdown;
            }
        }
        
        // Determine subject area from content
        const subjectArea = determineSubjectArea(fullMarkdown) || metadata.subjectArea;
        
        // Extract Subject II
        const subjectII = extractSubject(fullMarkdown, 2);
        if (subjectII) {
            const images = [];
            
            // Get images for Subject II
            for (const imgRef of subjectII.imageRefs) {
                let imageBase64 = getImageBase64(data.pages, imgRef.path);
                
                // If not found in JSON, try reading from disk
                if (!imageBase64) {
                    imageBase64 = readImageFile(folderPath, imgRef.path);
                }
                
                if (imageBase64) {
                    images.push(imageBase64);
                }
            }
            
            const subpuncte = extractSubpuncte(subjectII.content);
            
            problems.push({
                titlu: `Problema II - ${subjectArea || 'Fizică'} - Bac ${metadata.year}${metadata.variant ? ` Var ${metadata.variant}` : ''}`,
                descriere: `Problema de bacalaureat - Subiectul II din ${subjectArea || 'Fizică'}, ${metadata.year}${metadata.variant ? `, Varianta ${metadata.variant}` : ''}${metadata.type ? `, ${metadata.type}` : ''}`,
                categorie: 'Bac',
                varianta: metadata.year.toString() + (metadata.variant ? ` Var ${metadata.variant}` : ''),
                dificultate: 'mediu',
                punctajTotal: subjectII.punctaj,
                continut: subjectII.content,
                formule: [],
                date: {},
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
                    subjectNumber: 2
                }
            });
        }
        
        // Extract Subject III
        const subjectIII = extractSubject(fullMarkdown, 3);
        if (subjectIII) {
            const images = [];
            
            // Get images for Subject III
            for (const imgRef of subjectIII.imageRefs) {
                let imageBase64 = getImageBase64(data.pages, imgRef.path);
                
                // If not found in JSON, try reading from disk
                if (!imageBase64) {
                    imageBase64 = readImageFile(folderPath, imgRef.path);
                }
                
                if (imageBase64) {
                    images.push(imageBase64);
                }
            }
            
            const subpuncte = extractSubpuncte(subjectIII.content);
            
            problems.push({
                titlu: `Problema III - ${subjectArea || 'Fizică'} - Bac ${metadata.year}${metadata.variant ? ` Var ${metadata.variant}` : ''}`,
                descriere: `Problema de bacalaureat - Subiectul III din ${subjectArea || 'Fizică'}, ${metadata.year}${metadata.variant ? `, Varianta ${metadata.variant}` : ''}${metadata.type ? `, ${metadata.type}` : ''}`,
                categorie: 'Bac',
                varianta: metadata.year.toString() + (metadata.variant ? ` Var ${metadata.variant}` : ''),
                dificultate: 'mediu',
                punctajTotal: subjectIII.punctaj,
                continut: subjectIII.content,
                formule: [],
                date: {},
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
                    subjectNumber: 3
                }
            });
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


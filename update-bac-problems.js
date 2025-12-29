const fs = require('fs');
const path = require('path');

// Helper functions (same as in ProblemeBac.jsx)
const extractYear = (variant) => {
    const match = variant.match(/(\d{4})/);
    return match ? parseInt(match[1]) : 0;
};

const getVariantType = (variant, source) => {
    const lower = (variant || '').toLowerCase();
    const sourceLower = (source || '').toLowerCase();
    const combined = lower + ' ' + sourceLower;
    
    if (combined.includes('simulare')) return 'simulare';
    if (combined.includes('model')) return 'model';
    if (combined.includes('vara')) return 'vara';
    if (combined.includes('toamna')) return 'toamna';
    return 'bac';
};

const getSubjectNumber = (problem) => {
    if (problem.metadata?.subjectNumber) {
        return problem.metadata.subjectNumber;
    }
    const titlu = problem.titlu || '';
    const match = titlu.match(/Problema\s+(I{1,3})/i);
    if (match) {
        const roman = match[1];
        return roman === 'I' ? 1 : roman === 'II' ? 2 : roman === 'III' ? 3 : null;
    }
    const source = problem.metadata?.source || '';
    const subMatch = source.match(/sub(\d)/i);
    if (subMatch) {
        return parseInt(subMatch[1]);
    }
    return null;
};

const getSubjectArea = (problem) => {
    if (problem.metadata?.subjectArea) {
        return problem.metadata.subjectArea;
    }
    const titlu = problem.titlu || '';
    if (titlu.includes('Mecanică') || titlu.includes('Mecanic')) return 'Mecanică';
    if (titlu.includes('Termodinamică') || titlu.includes('Termodinamic')) return 'Termodinamică';
    if (titlu.includes('Optică') || titlu.includes('Optic')) return 'Optică';
    if (titlu.includes('Curent continuu') || titlu.includes('Electric')) return 'Curent continuu';
    return null;
};

// Process all BAC problem files
const problemsDir = path.join(__dirname, 'extracted_problems', 'individual');
const files = fs.readdirSync(problemsDir).filter(f => f.includes('sub') && f.endsWith('.json'));

let updated = 0;
let errors = 0;

files.forEach(file => {
    try {
        const filePath = path.join(problemsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const problem = JSON.parse(content);
        
        // Skip if not a Bac problem
        if (problem.categorie !== 'Bac' && !problem.categorie?.toLowerCase().includes('bac')) {
            return;
        }
        
        // Extract data
        const varianta = problem.varianta || '';
        const source = problem.metadata?.source || '';
        const year = problem.metadata?.year || extractYear(varianta);
        const subjectNumber = getSubjectNumber(problem);
        const subjectArea = getSubjectArea(problem);
        const session = getVariantType(varianta, source);
        
        // Remove varianta and dificultate
        delete problem.varianta;
        delete problem.dificultate;
        
        // Update metadata
        if (!problem.metadata) {
            problem.metadata = {};
        }
        
        problem.metadata.year = year || null;
        problem.metadata.subjectNumber = subjectNumber || null;
        problem.metadata.subjectArea = subjectArea || null;
        problem.metadata.session = session || null;
        
        // Keep existing metadata fields
        if (source) problem.metadata.source = source;
        if (problem.metadata.type) {
            // Keep type
        }
        if (problem.metadata.subjectCode) {
            // Keep subjectCode
        }
        
        // Write back
        fs.writeFileSync(filePath, JSON.stringify(problem, null, 2) + '\n', 'utf8');
        updated++;
        
    } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
        errors++;
    }
});

console.log(`\n✅ Updated ${updated} files`);
if (errors > 0) {
    console.log(`❌ Errors: ${errors}`);
}


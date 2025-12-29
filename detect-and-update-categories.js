import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Categorii disponibile
const CATEGORIES = {
    'Mecanică': {
        keywords: [
            // High weight - specific mechanics terms
            { term: 'energie cinetică', weight: 5 },
            { term: 'energie potențială', weight: 5 },
            { term: 'energie potențială gravitațională', weight: 5 },
            { term: 'lucru mecanic', weight: 5 },
            { term: 'lucrul mecanic', weight: 5 },
            { term: 'putere mecanică', weight: 5 },
            { term: 'puterea mecanică', weight: 5 },
            { term: 'energie mecanică', weight: 5 },
            { term: 'conservarea energiei', weight: 5 },
            { term: 'legea conservării energiei', weight: 5 },
            { term: 'plan înclinat', weight: 5 },
            { term: 'planului înclinat', weight: 5 },
            { term: 'scripete', weight: 5 },
            { term: 'scripetelui', weight: 5 },
            { term: 'fir inextensibil', weight: 5 },
            { term: 'firului inextensibil', weight: 5 },
            { term: 'tensiune din fir', weight: 5 },
            { term: 'tensiunea din fir', weight: 5 },
            { term: 'tensiune în fir', weight: 5 },
            { term: 'tensiunea în fir', weight: 5 },
            { term: 'forță de frecare', weight: 5 },
            { term: 'forța de frecare', weight: 5 },
            { term: 'forță de tracțiune', weight: 5 },
            { term: 'forța de tracțiune', weight: 5 },
            { term: 'forță de rezistență', weight: 5 },
            { term: 'forța de rezistență', weight: 5 },
            { term: 'rezistență la înaintare', weight: 5 },
            { term: 'rezistența la înaintare', weight: 5 },
            { term: 'coeficient de frecare', weight: 5 },
            { term: 'coeficientul de frecare', weight: 5 },
            { term: 'frecare la alunecare', weight: 5 },
            { term: 'frecării la alunecare', weight: 5 },
            { term: 'resort', weight: 5 },
            { term: 'resortului', weight: 5 },
            { term: 'constantă elastică', weight: 5 },
            { term: 'constanta elastică', weight: 5 },
            { term: 'alungirea resortului', weight: 5 },
            { term: 'alungire resort', weight: 5 },
            { term: 'tren', weight: 4 },
            { term: 'trenului', weight: 4 },
            { term: 'locomotivă', weight: 4 },
            { term: 'locomotivei', weight: 4 },
            { term: 'pendul', weight: 4 },
            { term: 'pendulului', weight: 4 },
            { term: 'oscilație', weight: 4 },
            { term: 'oscilații', weight: 4 },
            { term: 'vibrație', weight: 4 },
            { term: 'vibrații', weight: 4 },
            { term: 'ciocnire', weight: 4 },
            { term: 'ciocnirii', weight: 4 },
            { term: 'impuls', weight: 4 },
            { term: 'impulsului', weight: 4 },
            { term: 'moment', weight: 3 },
            { term: 'momentului', weight: 3 },
            // Medium weight - common mechanics terms
            { term: 'forță', weight: 3 },
            { term: 'forțe', weight: 3 },
            { term: 'forța', weight: 3 },
            { term: 'accelerație', weight: 3 },
            { term: 'accelerația', weight: 3 },
            { term: 'viteză', weight: 3 },
            { term: 'viteza', weight: 3 },
            { term: 'masă', weight: 2 },
            { term: 'masa', weight: 2 },
            { term: 'greutate', weight: 3 },
            { term: 'greutății', weight: 3 },
            { term: 'alunecare', weight: 3 },
            { term: 'alunecării', weight: 3 },
            { term: 'mișcare', weight: 2 },
            { term: 'mișcării', weight: 2 },
            { term: 'deplasare', weight: 2 },
            { term: 'deplasării', weight: 2 },
            { term: 'corp', weight: 1 },
            { term: 'corpului', weight: 1 },
            { term: 'mobil', weight: 2 },
            { term: 'mobilului', weight: 2 },
            { term: 'fir', weight: 2 },
            { term: 'firului', weight: 2 }
        ],
        weight: 0
    },
    'Termodinamică': {
        keywords: [
            // High weight - specific thermodynamics terms
            { term: 'gaz ideal', weight: 5 },
            { term: 'gazului ideal', weight: 5 },
            { term: 'transformare izotermă', weight: 5 },
            { term: 'transformare izobară', weight: 5 },
            { term: 'transformare izocoră', weight: 5 },
            { term: 'transformare adiabată', weight: 5 },
            { term: 'căldură primită', weight: 5 },
            { term: 'căldură cedată', weight: 5 },
            { term: 'energie internă', weight: 5 },
            { term: 'energia internă', weight: 5 },
            { term: 'capacitate calorică', weight: 5 },
            { term: 'capacitatea calorică', weight: 5 },
            { term: 'masă molară', weight: 5 },
            { term: 'masa molară', weight: 5 },
            { term: 'constantă universală', weight: 5 },
            { term: 'constanta universală', weight: 5 },
            { term: 'legea gazelor', weight: 5 },
            { term: 'legea gazelor ideale', weight: 5 },
            { term: 'ecuația de stare', weight: 5 },
            { term: 'ecuația de stare a gazelor ideale', weight: 5 },
            { term: 'PV = nRT', weight: 5 },
            { term: 'PV = const', weight: 5 },
            { term: 'TV = const', weight: 5 },
            { term: 'PT = const', weight: 5 },
            { term: 'C_V', weight: 5 },
            { term: 'C_P', weight: 5 },
            { term: 'număr de molecule', weight: 4 },
            { term: 'numărul de molecule', weight: 4 },
            { term: 'număr de moli', weight: 4 },
            { term: 'numărul de moli', weight: 4 },
            { term: 'masă de gaz', weight: 4 },
            { term: 'masa de gaz', weight: 4 },
            { term: 'cilindru', weight: 4 },
            { term: 'cilindrului', weight: 4 },
            { term: 'piston', weight: 4 },
            { term: 'pistonului', weight: 4 },
            { term: 'piston mobil', weight: 5 },
            { term: 'pistonului mobil', weight: 5 },
            { term: 'starea', weight: 3 },
            { term: 'stării', weight: 3 },
            { term: 'stări', weight: 3 },
            { term: 'transformare', weight: 3 },
            { term: 'transformării', weight: 3 },
            { term: 'izotermă', weight: 4 },
            { term: 'izobară', weight: 4 },
            { term: 'izocoră', weight: 4 },
            { term: 'adiabată', weight: 4 },
            // Medium weight
            { term: 'gaz', weight: 3 },
            { term: 'gazului', weight: 3 },
            { term: 'presiune', weight: 3 },
            { term: 'presiunii', weight: 3 },
            { term: 'temperatură', weight: 3 },
            { term: 'temperaturii', weight: 3 },
            { term: 'volum', weight: 3 },
            { term: 'volumului', weight: 3 },
            { term: 'căldură', weight: 3 },
            { term: 'căldurii', weight: 3 },
            { term: 'densitate', weight: 3 },
            { term: 'densității', weight: 3 },
            { term: 'mol', weight: 3 },
            { term: 'moli', weight: 3 }
        ],
        weight: 0
    },
    'Optică': {
        keywords: [
            // High weight - specific optics terms
            { term: 'lentilă', weight: 5 },
            { term: 'lentilei', weight: 5 },
            { term: 'lentile', weight: 5 },
            { term: 'oglindă', weight: 5 },
            { term: 'oglinzii', weight: 5 },
            { term: 'oglinzi', weight: 5 },
            { term: 'distanță focală', weight: 5 },
            { term: 'distanța focală', weight: 5 },
            { term: 'indice de refracție', weight: 5 },
            { term: 'indicele de refracție', weight: 5 },
            { term: 'legea refracției', weight: 5 },
            { term: 'legea reflexiei', weight: 5 },
            { term: 'legea lui Snell', weight: 5 },
            { term: 'rază incidentă', weight: 5 },
            { term: 'rază reflectată', weight: 5 },
            { term: 'rază refractată', weight: 5 },
            { term: 'unghi de incidență', weight: 5 },
            { term: 'unghiul de incidență', weight: 5 },
            { term: 'unghi de refracție', weight: 5 },
            { term: 'unghiul de refracție', weight: 5 },
            { term: 'mărire liniară', weight: 5 },
            { term: 'mărirea liniară', weight: 5 },
            { term: 'mărire unghiulară', weight: 5 },
            { term: 'mărirea unghiulară', weight: 5 },
            { term: 'putere optică', weight: 5 },
            { term: 'puterea optică', weight: 5 },
            { term: 'dioptrie', weight: 5 },
            { term: 'dioptrii', weight: 5 },
            { term: 'interferență', weight: 5 },
            { term: 'interferenței', weight: 5 },
            { term: 'difracție', weight: 5 },
            { term: 'difracției', weight: 5 },
            { term: 'polarizare', weight: 5 },
            { term: 'polarizării', weight: 5 },
            { term: 'dispersie', weight: 5 },
            { term: 'dispersiei', weight: 5 },
            { term: 'prismă', weight: 5 },
            { term: 'prismei', weight: 5 },
            { term: 'prisme', weight: 5 },
            { term: 'spectru', weight: 5 },
            { term: 'spectrului', weight: 5 },
            { term: 'aberare', weight: 4 },
            { term: 'aberării', weight: 4 },
            { term: 'aberări', weight: 4 },
            { term: 'convergentă', weight: 4 },
            { term: 'divergentă', weight: 4 },
            { term: 'convexă', weight: 4 },
            { term: 'concavă', weight: 4 },
            { term: 'focal', weight: 3 },
            { term: 'focală', weight: 3 },
            { term: 'focare', weight: 3 },
            // Medium weight
            { term: 'refracție', weight: 4 },
            { term: 'refracției', weight: 4 },
            { term: 'reflexie', weight: 4 },
            { term: 'reflexiei', weight: 4 },
            { term: 'imagine', weight: 3 },
            { term: 'imaginii', weight: 3 },
            { term: 'obiect', weight: 3 },
            { term: 'obiectului', weight: 3 },
            { term: 'rază', weight: 2 },
            { term: 'razei', weight: 2 },
            { term: 'raze', weight: 2 },
            { term: 'razelor', weight: 2 },
            { term: 'lumină', weight: 3 },
            { term: 'luminii', weight: 3 },
            { term: 'mărire', weight: 2 },
            { term: 'mărirea', weight: 2 }
        ],
        weight: 0
    },
    'Curent continuu': {
        keywords: [
            // Specific electric current terms (high weight)
            { term: 'curent electric', weight: 5 },
            { term: 'curentul electric', weight: 5 },
            { term: 'intensitatea curentului', weight: 5 },
            { term: 'intensitatea curentului electric', weight: 5 },
            { term: 'tensiune electrică', weight: 5 },
            { term: 'tensiunea electrică', weight: 5 },
            { term: 'tensiune electromotoare', weight: 5 },
            { term: 'tensiunea electromotoare', weight: 5 },
            { term: 't.e.m.', weight: 5 },
            { term: 'rezistență electrică', weight: 5 },
            { term: 'rezistența electrică', weight: 5 },
            { term: 'circuit electric', weight: 5 },
            { term: 'circuitul electric', weight: 5 },
            { term: 'sursă de tensiune', weight: 5 },
            { term: 'sursa de tensiune', weight: 5 },
            { term: 'putere electrică', weight: 5 },
            { term: 'puterea electrică', weight: 5 },
            { term: 'energie electrică', weight: 5 },
            { term: 'energia electrică', weight: 5 },
            { term: 'legea lui Ohm', weight: 5 },
            { term: 'legea lui Kirchhoff', weight: 5 },
            { term: 'ampermetru', weight: 4 },
            { term: 'voltmetru', weight: 4 },
            { term: 'ohmmetru', weight: 4 },
            { term: 'multimetru', weight: 4 },
            { term: 'baterie', weight: 4 },
            { term: 'generator', weight: 4 },
            { term: 'receptor', weight: 4 },
            { term: 'consumator', weight: 4 },
            { term: 'rezistență internă', weight: 4 },
            { term: 'rezistența internă', weight: 4 },
            { term: 'rezistență echivalentă', weight: 4 },
            { term: 'rezistența echivalentă', weight: 4 },
            { term: 'divizor de tensiune', weight: 4 },
            { term: 'divizor de curent', weight: 4 },
            { term: 'circuit complex', weight: 4 },
            { term: 'circuitul complex', weight: 4 },
            { term: 'rețea electrică', weight: 4 },
            { term: 'rețelei electrice', weight: 4 },
            // Generic terms (lower weight, only if context suggests electricity)
            { term: 'circuit', weight: 2 },
            { term: 'circuitului', weight: 2 },
            { term: 'sursă', weight: 1 },
            { term: 'sursei', weight: 1 },
            // Only use these if they appear with electric context
            { term: 'U = RI', weight: 5 },
            { term: 'E = I(R + r)', weight: 5 },
            { term: 'P = UI', weight: 5 },
            { term: 'P = RI²', weight: 5 },
            { term: 'W = UIt', weight: 5 },
            { term: 'W = RI²t', weight: 5 },
            { term: 'W = U²t/R', weight: 5 }
        ],
        weight: 0
    }
};

/**
 * Detectează categoria unei probleme bazându-se pe conținutul acesteia
 */
function detectCategory(problem) {
    const content = (problem.continut || '').toLowerCase();
    const titlu = (problem.titlu || '').toLowerCase();
    const descriere = (problem.descriere || '').toLowerCase();
    const fullText = `${content} ${titlu} ${descriere}`;
    
    // Resetăm weight-urile
    Object.keys(CATEGORIES).forEach(cat => {
        CATEGORIES[cat].weight = 0;
    });
    
    // Calculăm scorul pentru fiecare categorie
    Object.keys(CATEGORIES).forEach(category => {
        CATEGORIES[category].keywords.forEach(keywordObj => {
            const keyword = typeof keywordObj === 'string' ? keywordObj : keywordObj.term;
            const weight = typeof keywordObj === 'string' ? 1 : keywordObj.weight;
            const regex = new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = fullText.match(regex);
            if (matches) {
                CATEGORIES[category].weight += matches.length * weight;
            }
        });
    });
    
    // Găsim categoria cu cel mai mare scor
    let maxWeight = 0;
    let detectedCategory = null;
    
    Object.keys(CATEGORIES).forEach(category => {
        if (CATEGORIES[category].weight > maxWeight) {
            maxWeight = CATEGORIES[category].weight;
            detectedCategory = category;
        }
    });
    
    // Dacă nu am găsit nimic, încercăm să detectăm din titlu sau descriere
    if (!detectedCategory || maxWeight === 0) {
        const titluLower = titlu.toLowerCase();
        if (titluLower.includes('mecanică') || titluLower.includes('mecanic')) {
            detectedCategory = 'Mecanică';
        } else if (titluLower.includes('termodinamică') || titluLower.includes('termodinamic')) {
            detectedCategory = 'Termodinamică';
        } else if (titluLower.includes('optică') || titluLower.includes('optic')) {
            detectedCategory = 'Optică';
        } else if (titluLower.includes('curent continuu') || titluLower.includes('electric')) {
            detectedCategory = 'Curent continuu';
        }
    }
    
    return detectedCategory;
}

/**
 * Actualizează titlul problemei pentru a include categoria
 */
function updateTitle(problem, category) {
    if (!category) return problem.titlu;
    
    const titlu = problem.titlu || '';
    
    // Verificăm dacă titlul conține deja categoria corectă
    if (titlu.includes(category)) {
        // Verificăm dacă nu există alte categorii în titlu
        const categories = ['Mecanică', 'Termodinamică', 'Optică', 'Curent continuu'];
        const foundCategories = categories.filter(cat => titlu.includes(cat));
        if (foundCategories.length === 1 && foundCategories[0] === category) {
            return titlu; // Deja corect
        }
    }
    
    // Eliminăm toate categoriile existente
    let newTitlu = titlu
        .replace(/\s*-\s*Mecanică\s*/g, '')
        .replace(/\s*-\s*Termodinamică\s*/g, '')
        .replace(/\s*-\s*Optică\s*/g, '')
        .replace(/\s*-\s*Curent continuu\s*/g, '')
        .replace(/\s*Mecanică\s*/g, '')
        .replace(/\s*Termodinamică\s*/g, '')
        .replace(/\s*Optică\s*/g, '')
        .replace(/\s*Curent continuu\s*/g, '');
    
    // Încercăm să înlocuim "Fizică" cu categoria
    if (newTitlu.includes('Fizică')) {
        newTitlu = newTitlu.replace('Fizică', category);
    } else {
        // Adăugăm categoria după "Sub X"
        const match = newTitlu.match(/^(Sub\s+(I{1,3}|[IVX]+)\s*-\s*)(.*)$/i);
        if (match) {
            newTitlu = `${match[1]}${category} - ${match[3]}`;
        } else {
            // Dacă nu găsim pattern-ul, adăugăm categoria la început
            newTitlu = `${category} - ${newTitlu}`;
        }
    }
    
    // Curățăm spațiile multiple
    newTitlu = newTitlu.replace(/\s+/g, ' ').replace(/\s*-\s*/g, ' - ').trim();
    
    return newTitlu;
}

/**
 * Procesează un fișier JSON
 */
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const problem = JSON.parse(content);
        
        // Verificăm dacă problema nu are subjectArea setat sau dacă trebuie re-detectat
        const needsCategoryUpdate = !problem.metadata || !problem.metadata.subjectArea || 
                           (problem.metadata.subjectArea === 'Curent continuu' && 
                            !problem.continut?.toLowerCase().includes('curent electric') &&
                            !problem.continut?.toLowerCase().includes('circuit electric') &&
                            !problem.continut?.toLowerCase().includes('tensiune electrică') &&
                            !problem.continut?.toLowerCase().includes('rezistență electrică'));
        
        // Verificăm dacă titlul are categorii duplicate sau incorecte
        const titlu = problem.titlu || '';
        const categories = ['Mecanică', 'Termodinamică', 'Optică', 'Curent continuu'];
        const foundCategories = categories.filter(cat => titlu.includes(cat));
        const needsTitleUpdate = foundCategories.length !== 1 || 
                                (problem.metadata?.subjectArea && !titlu.includes(problem.metadata.subjectArea));
        
        if (needsCategoryUpdate || needsTitleUpdate) {
            // Detectăm categoria
            const category = detectCategory(problem);
            
            if (category) {
                // Actualizăm metadata.subjectArea
                if (!problem.metadata) {
                    problem.metadata = {};
                }
                problem.metadata.subjectArea = category;
                
                // Actualizăm titlul
                problem.titlu = updateTitle(problem, category);
                
                // Salvăm fișierul
                fs.writeFileSync(filePath, JSON.stringify(problem, null, 2), 'utf8');
                
                return { updated: true, category, file: path.basename(filePath) };
            } else if (needsTitleUpdate && problem.metadata?.subjectArea) {
                // Dacă avem deja categoria dar titlul e incorect, doar actualizăm titlul
                problem.titlu = updateTitle(problem, problem.metadata.subjectArea);
                fs.writeFileSync(filePath, JSON.stringify(problem, null, 2), 'utf8');
                return { updated: true, category: problem.metadata.subjectArea, file: path.basename(filePath), titleOnly: true };
            } else {
                return { updated: false, category: null, file: path.basename(filePath), reason: 'Nu s-a putut detecta categoria' };
            }
        }
        
        return { updated: false, file: path.basename(filePath), reason: 'Nu necesită actualizare' };
    } catch (error) {
        return { updated: false, file: path.basename(filePath), error: error.message };
    }
}

/**
 * Funcția principală
 */
function main() {
    const problemsDir = path.join(__dirname, 'extracted_problems', 'individual');
    
    if (!fs.existsSync(problemsDir)) {
        console.error(`Directorul ${problemsDir} nu există!`);
        process.exit(1);
    }
    
    const files = fs.readdirSync(problemsDir).filter(f => f.endsWith('.json'));
    console.log(`Găsite ${files.length} fișiere JSON.`);
    
    let updatedCount = 0;
    let errorCount = 0;
    const results = {
        'Mecanică': 0,
        'Termodinamică': 0,
        'Optică': 0,
        'Curent continuu': 0,
        'Nedetectat': 0
    };
    
    files.forEach(file => {
        const filePath = path.join(problemsDir, file);
        const result = processFile(filePath);
        
        if (result.updated) {
            updatedCount++;
            if (result.category) {
                results[result.category]++;
            } else {
                results['Nedetectat']++;
            }
            console.log(`✓ ${result.file} -> ${result.category}`);
        } else if (result.error) {
            errorCount++;
            console.error(`✗ ${result.file}: ${result.error}`);
        }
    });
    
    console.log('\n=== Rezumat ===');
    console.log(`Total fișiere procesate: ${files.length}`);
    console.log(`Fișiere actualizate: ${updatedCount}`);
    console.log(`Erori: ${errorCount}`);
    console.log('\nDistribuție pe categorii:');
    Object.keys(results).forEach(cat => {
        if (results[cat] > 0) {
            console.log(`  ${cat}: ${results[cat]}`);
        }
    });
}

// Rulează scriptul
main();


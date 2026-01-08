import fs from 'fs';
import { Buffer } from 'buffer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PROBLEM_FILE = 'problem-template.json';

/**
 * Generate URL with problem data encoded as query parameters
 * Similar to generateAddProblemURL from emailService.js but for Node.js
 */
function generateAddProblemURL(problemData) {
  // Use production URL or localhost for development
  const baseUrl = process.env.VITE_APP_URL || 'https://puls-fizica.vercel.app';
  
  const params = new URLSearchParams();
  params.set('addProblem', '1');
  params.set('titlu', problemData.titlu || '');
  params.set('descriere', problemData.descriere || '');
  params.set('categorie', problemData.categorie || '');
  params.set('dificultate', problemData.dificultate || '');
  params.set('continut', problemData.continut || '');
  params.set('punctajTotal', String(problemData.punctajTotal || 0));
  
  // Encode complex data as base64 JSON (using Buffer instead of btoa for Node.js)
  if (problemData.formule && problemData.formule.length > 0) {
    const formuleJson = JSON.stringify(problemData.formule);
    params.set('formule', Buffer.from(formuleJson).toString('base64'));
  }
  
  if (problemData.date && Object.keys(problemData.date).length > 0) {
    const dateJson = JSON.stringify(problemData.date);
    params.set('date', Buffer.from(dateJson).toString('base64'));
  }
  
  if (problemData.subpuncte && problemData.subpuncte.length > 0) {
    const subpuncteJson = JSON.stringify(problemData.subpuncte);
    params.set('subpuncte', Buffer.from(subpuncteJson).toString('base64'));
  }
  
  return `${baseUrl}/probleme?${params.toString()}`;
}

/**
 * Main function to read problem from file and generate URL
 */
function generateProblemURL() {
  try {
    // Check if problem file exists
    if (!fs.existsSync(PROBLEM_FILE)) {
      console.error(`❌ Eroare: Fișierul ${PROBLEM_FILE} nu există!`);
      console.log(`\n📝 Creează fișierul ${PROBLEM_FILE} cu următoarea structură:`);
      console.log(`
{
  "titlu": "Titlul problemei",
  "descriere": "Descrierea problemei",
  "categorie": "unde",
  "dificultate": "medii",
  "continut": "Conținutul problemei...",
  "formule": ["formula1", "formula2"],
  "date": {"variabila1": "valoare1"},
  "subpuncte": [
    {"cerinta": "Cerința a)", "punctaj": 3},
    {"cerinta": "Cerința b)", "punctaj": 2}
  ],
  "punctajTotal": 10,
  "poze": []
}
      `);
      process.exit(1);
    }
    
    // Read problem data from file
    console.log(`📖 Citesc datele problemei din ${PROBLEM_FILE}...\n`);
    const problemData = JSON.parse(fs.readFileSync(PROBLEM_FILE, 'utf8'));
    
    // Validate required fields
    if (!problemData.titlu) {
      console.error('❌ Eroare: Problema trebuie să aibă un titlu!');
      process.exit(1);
    }
    
    // Display problem info
    console.log('📝 Problema generată:');
    console.log(`   Titlu: ${problemData.titlu}`);
    console.log(`   Categorie: ${problemData.categorie || 'N/A'}`);
    console.log(`   Dificultate: ${problemData.dificultate || 'N/A'}`);
    console.log(`   Punctaj total: ${problemData.punctajTotal || 0} puncte`);
    console.log(`   Număr subpuncte: ${problemData.subpuncte?.length || 0}`);
    console.log(`   Număr formule: ${problemData.formule?.length || 0}`);
    console.log(`   Număr date: ${problemData.date ? Object.keys(problemData.date).length : 0}\n`);
    
    // Generate URL
    console.log('🔗 Generez URL-ul pentru upload...\n');
    const url = generateAddProblemURL(problemData);
    
    console.log('✅ URL generat cu succes!\n');
    console.log('═'.repeat(80));
    console.log('📋 LINK PENTRU UPLOAD:');
    console.log('═'.repeat(80));
    console.log(url);
    console.log('═'.repeat(80));
    console.log('\n💡 Copiază link-ul de mai sus și deschide-l în browser pentru a adăuga problema în PULS!\n');
    
    return url;
  } catch (error) {
    console.error('\n❌ Eroare la generarea URL-ului:', error.message);
    if (error instanceof SyntaxError) {
      console.error('   Verifică că fișierul JSON este valid!');
    }
    process.exit(1);
  }
}

// Run the script
generateProblemURL();


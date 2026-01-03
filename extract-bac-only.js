import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'database-backup.json');
const OUTPUT_FILE = path.join(__dirname, 'bac-problems-only.json');

/**
 * Check if a problem is a BAC problem (same logic as upload-bac-problems.js)
 */
function isBacProblem(problem) {
  const categorie = problem.categorie || '';
  const normalizedCategorie = categorie.toLowerCase().trim();
  
  // Check category first (most reliable)
  if (normalizedCategorie === 'bac') {
    return true;
  }
  
  // Check metadata.source for BAC indicators
  const source = problem.metadata?.source || '';
  if (source.toLowerCase().includes('bac') || 
      source.toLowerCase().includes('fizica_tehnologic') ||
      source.toLowerCase().includes('fizica_real')) {
    return true;
  }
  
  // Check if it has BAC-specific metadata fields
  if (problem.metadata?.year && 
      (problem.metadata?.subjectNumber !== undefined || 
       problem.metadata?.variant !== undefined ||
       problem.metadata?.session === 'bac')) {
    return true;
  }
  
  return false;
}

/**
 * Extract only BAC problems from backup file
 */
function extractBacProblems() {
  console.log('🔍 Pornesc extragerea problemelor de BAC...\n');
  
  try {
    // Read the backup file
    console.log(`📖 Citesc fișierul: ${INPUT_FILE}`);
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`❌ Fișierul nu există: ${INPUT_FILE}`);
      console.error('   Rulează mai întâi: npm run backup-db');
      process.exit(1);
    }
    
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const problems = JSON.parse(fileContent);
    
    console.log(`✓ Găsite ${problems.length} probleme totale\n`);
    
    // Filter only BAC problems
    console.log('🔍 Filtrez problemele de BAC...');
    const bacProblems = problems.filter(problem => isBacProblem(problem));
    
    console.log(`✓ Găsite ${bacProblems.length} probleme de BAC din ${problems.length} totale\n`);
    
    // Statistics
    const stats = {
      total: problems.length,
      bac: bacProblems.length,
      nonBac: problems.length - bacProblems.length,
      byYear: {},
      bySubjectArea: {},
      bySubjectNumber: { 2: 0, 3: 0 },
      extractionDate: new Date().toISOString()
    };
    
    // Calculate statistics
    bacProblems.forEach(problem => {
      const year = problem.metadata?.year;
      const subjectArea = problem.metadata?.subjectArea || 'Unknown';
      const subjectNumber = problem.metadata?.subjectNumber;
      
      if (year) {
        stats.byYear[year] = (stats.byYear[year] || 0) + 1;
      }
      stats.bySubjectArea[subjectArea] = (stats.bySubjectArea[subjectArea] || 0) + 1;
      if (subjectNumber === 2 || subjectNumber === 3) {
        stats.bySubjectNumber[subjectNumber] = (stats.bySubjectNumber[subjectNumber] || 0) + 1;
      }
    });
    
    // Save BAC problems to file
    console.log(`💾 Salvez problemele de BAC în: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bacProblems, null, 2), 'utf-8');
    
    // Save statistics
    const statsFile = path.join(__dirname, 'bac-problems-stats.json');
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf-8');
    
    console.log(`\n✅ Extragere completată!`);
    console.log(`\n📊 Statistici:`);
    console.log(`   - Total probleme în backup: ${stats.total}`);
    console.log(`   - Probleme de BAC: ${stats.bac}`);
    console.log(`   - Probleme non-BAC (filtrate): ${stats.nonBac}`);
    console.log(`\n   Probleme de BAC pe an:`);
    Object.entries(stats.byYear)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .forEach(([year, count]) => {
        console.log(`     ${year}: ${count}`);
      });
    console.log(`\n   Probleme de BAC pe domeniu:`);
    Object.entries(stats.bySubjectArea)
      .sort(([, a], [, b]) => b - a)
      .forEach(([area, count]) => {
        console.log(`     ${area}: ${count}`);
      });
    console.log(`\n   Probleme de BAC pe subiect:`);
    console.log(`     Subiectul II: ${stats.bySubjectNumber[2]}`);
    console.log(`     Subiectul III: ${stats.bySubjectNumber[3]}`);
    console.log(`\n📁 Fișiere create:`);
    console.log(`   - ${OUTPUT_FILE}`);
    console.log(`   - ${statsFile}`);
    
  } catch (error) {
    console.error('\n❌ Eroare la extragere:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run extraction
try {
  extractBacProblems();
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
}


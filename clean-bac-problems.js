import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'bac-problems-only.json');
const OUTPUT_FILE = path.join(__dirname, 'bac-problems-only.json'); // Overwrite same file

/**
 * Remove image placeholders from content
 */
function removeImagePlaceholders(content) {
  // Remove markdown image syntax: ![alt](path)
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();
}

/**
 * Remove subpoints from content (a., b., c., d., etc.)
 * Keep everything before the first subpoint
 */
function removeSubpoints(content) {
  // Pattern to match subpoints: newline followed by letter. (a., b., c., etc.)
  // Match from first subpoint to end
  const subpointPattern = /\n\s*([a-z])\.\s+/i;
  const match = content.match(subpointPattern);
  
  if (match) {
    // Find the index where first subpoint starts
    const firstSubpointIndex = content.indexOf(match[0]);
    // Keep only content before first subpoint
    return content.substring(0, firstSubpointIndex).trim();
  }
  
  return content;
}

/**
 * Clean up multiple consecutive newlines
 */
function cleanNewlines(content) {
  return content.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Process all BAC problems
 */
function cleanBacProblems() {
  console.log('🧹 Pornesc curățarea problemelor de BAC...\n');
  
  try {
    // Read the BAC problems file
    console.log(`📖 Citesc fișierul: ${INPUT_FILE}`);
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`❌ Fișierul nu există: ${INPUT_FILE}`);
      console.error('   Rulează mai întâi: node extract-bac-only.js');
      process.exit(1);
    }
    
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const problems = JSON.parse(fileContent);
    
    console.log(`✓ Găsite ${problems.length} probleme de BAC\n`);
    
    let cleanedCount = 0;
    let imagePlaceholderRemoved = 0;
    let subpointsRemoved = 0;
    
    // Process each problem
    problems.forEach((problem, index) => {
      if (!problem.continut) {
        return; // Skip if no content
      }
      
      let content = problem.continut;
      let wasModified = false;
      
      // Check if has image placeholder
      const hasImagePlaceholder = /!\[([^\]]*)\]\(([^)]+)\)/.test(content);
      if (hasImagePlaceholder) {
        content = removeImagePlaceholders(content);
        imagePlaceholderRemoved++;
        wasModified = true;
      }
      
      // Check if has subpoints in content
      const hasSubpoints = /\n\s*([a-z])\.\s+/i.test(content);
      if (hasSubpoints) {
        content = removeSubpoints(content);
        subpointsRemoved++;
        wasModified = true;
      }
      
      // Clean up newlines
      content = cleanNewlines(content);
      
      // Update problem if modified
      if (wasModified) {
        problem.continut = content;
        cleanedCount++;
      }
    });
    
    // Save cleaned problems
    console.log(`💾 Salvez problemele curățate în: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(problems, null, 2), 'utf-8');
    
    console.log(`\n✅ Curățare completată!`);
    console.log(`\n📊 Statistici:`);
    console.log(`   - Total probleme procesate: ${problems.length}`);
    console.log(`   - Probleme modificate: ${cleanedCount}`);
    console.log(`   - Placeholder-uri de imagini eliminate: ${imagePlaceholderRemoved}`);
    console.log(`   - Subpuncte eliminate din conținut: ${subpointsRemoved}`);
    
  } catch (error) {
    console.error('\n❌ Eroare la curățare:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run cleaning
cleanBacProblems();


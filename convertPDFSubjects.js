import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
    console.error('Error: MISTRAL_API_KEY environment variable is not set');
    process.exit(1);
}

const client = new Mistral({ apiKey: apiKey });

function encodeFile(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Pdf = fileBuffer.toString('base64');
    return base64Pdf;
}

function saveBase64Image(base64Data, outputPath) {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    let imageBuffer;
    let extension = 'jpg';
    
    if (base64Match) {
        extension = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
        imageBuffer = Buffer.from(base64Match[2], 'base64');
    } else {
        // Assume it's already base64 without prefix
        imageBuffer = Buffer.from(base64Data, 'base64');
    }
    
    fs.writeFileSync(outputPath, imageBuffer);
    return extension;
}

async function processPDF(pdfPath, outputDir) {
    const fileName = path.basename(pdfPath, '.pdf');
    const problemFolder = path.join(outputDir, fileName);
    const outputPath = path.join(problemFolder, `${fileName}.json`);
    
    console.log(`Processing: ${fileName}...`);
    
    try {
        // Create folder for this problem
        if (!fs.existsSync(problemFolder)) {
            fs.mkdirSync(problemFolder, { recursive: true });
        }
        
        const base64File = encodeFile(pdfPath);
        
        // Prepare OCR request with specified settings
        const ocrRequest = {
            model: "mistral-ocr-latest",
            document: {
                type: "document_url",
                documentUrl: "data:application/pdf;base64," + base64File
            },
            responseFormat: "text",
            includeImageBase64: true,
            extractImages: {
                pages: "all"
            },
            extractTables: {
                format: "inline_markdown"
            },
            extractHeader: false,
            extractFooter: false
        };
        
        const ocrResponse = await client.ocr.process(ocrRequest);
        
        // Process response and extract images
        let processedResponse = ocrResponse;
        
        // If response has pages with images, extract and save them
        if (ocrResponse && ocrResponse.pages && Array.isArray(ocrResponse.pages)) {
            processedResponse = JSON.parse(JSON.stringify(ocrResponse)); // Deep copy
            
            for (const page of processedResponse.pages) {
                if (page.images && Array.isArray(page.images)) {
                    for (const image of page.images) {
                        if (image.imageBase64) {
                            const imageFileName = image.id || `img-${page.index}-${image.topLeftX}.jpg`;
                            const imagePath = path.join(problemFolder, imageFileName);
                            
                            // Save image file
                            const extension = saveBase64Image(image.imageBase64, imagePath);
                            
                            // Update image reference to point to saved file
                            image.imagePath = imageFileName;
                            // Keep base64 for reference but could remove to save space
                            // delete image.imageBase64; // Uncomment to remove base64 from JSON
                            
                            console.log(`  Saved image: ${imageFileName}`);
                        }
                    }
                }
            }
        }
        
        // Save JSON response
        fs.writeFileSync(outputPath, JSON.stringify(processedResponse, null, 2), 'utf-8');
        console.log(`✓ Successfully transcribed: ${fileName}`);
        
        return true;
    } catch (error) {
        console.error(`✗ Error processing ${fileName}:`, error.message);
        if (error.response) {
            console.error(`  API Response:`, JSON.stringify(error.response, null, 2));
        }
        if (error.stack) {
            console.error(`  Stack:`, error.stack);
        }
        return false;
    }
}

async function main() {
    const sourceDir = path.join(__dirname, 'public', 'probleme', 'bac', 'variante');
    const outputDir = path.join(__dirname, 'variante_transcribed');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created output directory: ${outputDir}`);
    }
    
    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
        console.error(`Error: Source directory does not exist: ${sourceDir}`);
        process.exit(1);
    }
    
    // Get all PDF files
    const files = fs.readdirSync(sourceDir).filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (files.length === 0) {
        console.log('No PDF files found in the source directory');
        return;
    }
    
    console.log(`Found ${files.length} PDF files to process\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Process each PDF file
    for (const file of files) {
        const pdfPath = path.join(sourceDir, file);
        const success = await processPDF(pdfPath, outputDir);
        
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n=== Processing Complete ===`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Output directory: ${outputDir}`);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
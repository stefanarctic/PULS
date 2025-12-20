import { Buffer } from 'buffer';
import { readFileSync } from 'fs';

// Citește datele problemei din fișierul JSON
const problemData = JSON.parse(readFileSync('added-problem.json', 'utf8'));

// Encode base64 pentru formule, date și subpuncte
const formuleBase64 = Buffer.from(JSON.stringify(problemData.formule)).toString('base64');
const dateBase64 = Buffer.from(JSON.stringify(problemData.date)).toString('base64');
const subpuncteBase64 = Buffer.from(JSON.stringify(problemData.subpuncte)).toString('base64');

// Encode URI pentru parametrii text
const titlu = encodeURIComponent(problemData.titlu);
const descriere = encodeURIComponent(problemData.descriere);
const varianta = encodeURIComponent(problemData.varianta);
const continut = encodeURIComponent(problemData.continut);
const dificultate = encodeURIComponent(problemData.dificultate);

// Construiește URL-ul
const baseUrl = 'http://localhost:8000/probleme/bac';
const url = `${baseUrl}?addProblem=1&titlu=${titlu}&descriere=${descriere}&varianta=${varianta}&dificultate=${dificultate}&punctajTotal=${problemData.punctajTotal}&continut=${continut}&formule=${formuleBase64}&date=${dateBase64}&subpuncte=${subpuncteBase64}`;

console.log('URL pentru problema de bac:');
console.log('\n' + url + '\n');
console.log('Copiază URL-ul de mai sus și deschide-l în browser când ești autentificat ca admin.');


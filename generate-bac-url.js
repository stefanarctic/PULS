import { Buffer } from 'buffer';

// Exemplu de problemă de bac
const problemData = {
    titlu: 'Mișcare rectilinie uniformă - Bac 2023',
    descriere: 'Problema tipică de bacalaureat despre mișcarea rectilinie uniformă',
    varianta: 'vara 2023',
    dificultate: 'mediu',
    punctajTotal: 7,
    continut: `Un mobil se deplasează rectiliniu uniform pe axa Ox. La momentul inițial $t_0 = 0$ s, coordonata mobilului este $x_0 = 5$ m, iar viteza sa este $v = 3$ m/s.

Ecuația de mișcare este: $x(t) = x_0 + v \\cdot t$

unde:
- $x_0$ este coordonata inițială
- $v$ este viteza constantă
- $t$ este timpul`,
    formule: [
        'x(t) = x₀ + v·t',
        'd = v·t',
        'v_med = Δx/Δt'
    ],
    date: {
        'x₀': '5 m',
        'v': '3 m/s',
        't₁': '0 s',
        't₂': '10 s'
    },
    subpuncte: [
        {
            cerinta: 'Reprezentați grafic dependența de timp a coordonatei x(t) pentru mișcarea rectilinie uniformă.',
            punctaj: 2
        },
        {
            cerinta: 'Calculați distanța parcursă de mobil în intervalul de timp t = 0 s până la t = 10 s.',
            punctaj: 3
        },
        {
            cerinta: 'Determinați viteza medie pe întregul interval de mișcare.',
            punctaj: 2
        }
    ]
};

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


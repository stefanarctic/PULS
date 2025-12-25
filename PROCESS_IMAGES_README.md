# Procesare Imagini Probleme BAC

Acest script procesează imaginile problemelor BAC din folderele `public/problem-screenshots/` și extrage:
- Textul problemei formatat cu MathJax
- Structura JSON pentru PULS
- Figurile asociate (dacă există)

## Instalare Dependențe

### 1. Instalează Python packages

```bash
pip install -r requirements.txt
```

### 2. Instalează Tesseract OCR

#### Windows:
1. Descarcă Tesseract de la: https://github.com/UB-Mannheim/tesseract/wiki
2. Instalează-l (de obicei în `C:\Program Files\Tesseract-OCR\`)
3. Scriptul va încerca să-l găsească automat

#### Linux:
```bash
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-ron  # Pentru limba română
```

#### macOS:
```bash
brew install tesseract
brew install tesseract-lang  # Pentru limba română
```

## Utilizare

Rulează scriptul:

```bash
python processProblemImages.py
```

Scriptul va:
1. Procesa fiecare folder din `public/problem-screenshots/`
2. Extrage textul din imagini folosind OCR
3. Formatează textul cu MathJax
4. Extrage subpunctele și punctajul
5. Detectează și extrage figuri (dacă există)
6. Creează fișierele:
   - `problem_text.txt` - Textul formatat cu MathJax
   - `problem_data.json` - Structura JSON pentru PULS
   - `figure_*.png` - Figura extrasă (dacă există)

## Structura Output

Pentru fiecare folder, vei găsi:

```
{folder_name}/
  ├── page0.png (imagine originală)
  ├── page1.png (imagine originală)
  ├── problem_text.txt (text formatat)
  ├── problem_data.json (JSON pentru PULS)
  └── figure_page0.png (figură extrasă, dacă există)
```

## Note

- Scriptul procesează automat fiecare folder
- Dacă OCR nu funcționează bine, poți ajusta parametrii în funcția `extract_text_from_image`
- Detectarea figurilor se bazează pe contururi și poate necesita ajustări pentru imagini specifice
- Textul extras poate necesita corecții manuale pentru formule matematice complexe



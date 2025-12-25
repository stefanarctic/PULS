import re
import json
from pathlib import Path
from PIL import Image
import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import os
import sys
from datetime import datetime

# Configurare căi
PUBLIC_SCREENSHOTS_DIR = Path("public/problem-screenshots")

# Configurare pytesseract (ajustă calea dacă e necesar)
try:
    import pytesseract
    # Pentru Windows, de obicei este instalat în Program Files
    if sys.platform == 'win32':
        # Încearcă să găsească Tesseract automat
        possible_paths = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        ]
        for path in possible_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break
except ImportError:
    print("⚠ pytesseract nu este instalat. Instalează-l cu: pip install pytesseract")
    print("⚠ De asemenea, instalează Tesseract OCR de la: https://github.com/tesseract-ocr/tesseract")
    sys.exit(1)

# Dicționar pentru corectarea diacriticelor comune OCR
DIACRITICS_CORRECTIONS = {
    # Corecții comune OCR
    'in': 'în', 'In': 'În', 'IN': 'ÎN',
    'si': 'și', 'Si': 'Și', 'SI': 'ȘI',
    'sa': 'să', 'Sa': 'Să', 'SA': 'SĂ',
    'la': 'la',  # păstrează
    'cu': 'cu',  # păstrează
    'de': 'de',  # păstrează
    'pe': 'pe',  # păstrează
    'se': 'se',  # păstrează
    'este': 'este',  # păstrează
    'sunt': 'sunt',  # păstrează
    'are': 'are',  # păstrează
    'fata': 'față', 'Fata': 'Față',
    'fata de': 'față de', 'Fata de': 'Față de',
    'zapada': 'zăpadă', 'Zapada': 'Zăpadă',
    'zapezii': 'zăpezii', 'Zapezii': 'Zăpezii',
    'masa': 'masă', 'Masa': 'Masă',
    'masa totala': 'masa totală', 'Masa totala': 'Masa totală',
    'acceleratia': 'accelerația', 'Acceleratia': 'Accelerația',
    'fortelor': 'forțelor', 'Fortelor': 'Forțelor',
    'fortei': 'forței', 'Fortei': 'Forței',
    'forte': 'forțe', 'Forte': 'Forțe',
    'forta': 'forța', 'Forta': 'Forța',
    'tensiune': 'tensiune',  # păstrează
    'tensiune din': 'tensiune din',  # păstrează
    'actioneaza': 'acționează', 'Actioneaza': 'Acționează',
    'actioneaza asupra': 'acționează asupra', 'Actioneaza asupra': 'Acționează asupra',
    'realizate': 'realizate',  # păstrează
    'influentate': 'influențate', 'Influentate': 'Influențate',
    'caracteristicile': 'caracteristicile',  # păstrează
    'echipamentului': 'echipamentului',  # păstrează
    'folosit': 'folosit',  # păstrează
    'alegerea': 'alegerea',  # păstrează
    'materialelor': 'materialelor',  # păstrează
    'corespunzatoare': 'corespunzătoare', 'Corespunzatoare': 'Corespunzătoare',
    'masurarea': 'măsurarea', 'Masurarea': 'Măsurarea',
    'coeficientului': 'coeficientului',  # păstrează
    'frecare': 'frecare',  # păstrează
    'alunecare': 'alunecare',  # păstrează
    'acest': 'acest',  # păstrează
    'scop': 'scop',  # păstrează
    'foloseste': 'folosește', 'Foloseste': 'Folosește',
    'dispozitiv': 'dispozitiv',  # păstrează
    'fixat': 'fixat',  # păstrează
    'schiuri': 'schiuri',  # păstrează
    'care': 'care',  # păstrează
    'inregistreaza': 'înregistrează', 'Inregistreaza': 'Înregistrează',
    'atat': 'atât', 'Atat': 'Atât',
    'valorile': 'valorile',  # păstrează
    'cat': 'cât', 'Cat': 'Cât',
    'sistemului': 'sistemului',  # păstrează
    'dispozitiv si': 'dispozitiv și', 'Dispozitiv si': 'Dispozitiv și',
    'se afla': 'se află', 'Se afla': 'Se află',
    'suprafata': 'suprafața', 'Suprafata': 'Suprafața',
    'orizontala': 'orizontală', 'Orizontala': 'Horizontală',
    'figura': 'figură', 'Figura': 'Figură',
    'alaturata': 'alăturată', 'Alaturata': 'Alăturată',
    'tabel': 'tabel',  # păstrează
    'prezentat': 'prezentat',  # păstrează
    'unul': 'unul',  # păstrează
    'dintre': 'dintre',  # păstrează
    'seturile': 'seturile',  # păstrează
    'date': 'date',  # păstrează
    'inregistrate': 'înregistrate', 'Inregistrate': 'Înregistrate',
    'iar': 'iar',  # păstrează
    'deplasarea': 'deplasarea',  # păstrează
    'are loc': 'are loc',  # păstrează
    'sensul': 'sensul',  # păstrează
    'reprezentati': 'reprezentați', 'Reprezentati': 'Reprezentați',
    'determinati': 'determinați', 'Determinati': 'Determinați',
    'calculati': 'calculați', 'Calculati': 'Calculați',
    'valoarea': 'valoarea',  # păstrează
    'vitezei': 'vitezei',  # păstrează
    'atinse': 'atinse',  # păstrează
    'dupa': 'după', 'Dupa': 'După',
    'plecarea': 'plecarea',  # păstrează
    'din': 'din',  # păstrează
    'repaus': 'repaus',  # păstrează
    'presupunand': 'presupunând', 'Presupunand': 'Presupunând',
    'mentine': 'menține', 'Mentine': 'Menține',
    'constanta': 'constantă', 'Constanta': 'Constantă',
    'indicata': 'indicată', 'Indicata': 'Indicată',
    'sportiv': 'sportiv',  # păstrează
    'coboara': 'coboară', 'Coboara': 'Coboară',
    'panta': 'pantă', 'Panta': 'Pantă',
    'acoperita': 'acoperită', 'Acoperita': 'Acoperită',
    'inclinata': 'înclinată', 'Inclinata': 'Înclinată',
    'parcurgerea': 'parcurgerea',  # păstrează
    'unei': 'unei',  # păstrează
    'diferente': 'diferențe', 'Diferente': 'Diferențe',
    'nivel': 'nivel',  # păstrează
    'punctul': 'punctul',  # păstrează
    'plecat': 'plecat',  # păstrează
    'coeficientul': 'coeficientul',  # păstrează
    'alunecarea': 'alunecarea',  # păstrează
    'panta este': 'pantă este', 'Panta este': 'Pantă este',
}

def normalize_text(text: str) -> str:
    """Normalizează diacriticele și corectează greșelile OCR"""
    # Normalizare diacritice standard
    text = (
        text.replace("Ń", "Ț")
            .replace("Ş", "Ș")
            .replace("Ţ", "Ț")
            .replace("ş", "ș")
            .replace("ţ", "ț")
    )
    
    # Corecții OCR pentru diacritice
    for wrong, correct in DIACRITICS_CORRECTIONS.items():
        text = text.replace(wrong, correct)
    
    # Curăță spații multiple
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    return text.strip()

def fix_ocr_formulas(text: str) -> str:
    """Corectează formulele greșite din OCR și le convertește în MathJax"""
    # Corecții comune pentru formule OCR
    corrections = {
        # Variabile cu indici greșite
        r'\bm\s*=\s*(\d+)': r'm = $\1$',
        r'\bM\s*=\s*(\d+)': r'M = $\1$',
        r'\bh\s*=\s*(\d+)': r'h = $\1$',
        r'\bH\s*=\s*(\d+)': r'H = $\1$',
        r'\ba\s*=\s*(\d+)': r'a = $\1$',
        r'\bv\s*=\s*(\d+)': r'v = $\1$',
        r'\bt\s*=\s*(\d+)': r't = $\1$',
        r'\bT\s*=\s*(\d+)': r'T = $\1$',
        r'\bk\s*=\s*(\d+)': r'k = $\1$',
        r'\bℓ\s*=\s*(\d+)': r'ℓ = $\1$',
        r'\bα\s*=\s*(\d+)': r'α = $\1$',
        r'\bµ\s*=\s*([\d,\.]+)': r'μ = $\1$',
        r'\bμ\s*=\s*([\d,\.]+)': r'μ = $\1$',
        
        # Fracții greșite
        r'(\d+)\s*/\s*(\d+)': r'$\\frac{\1}{\2}$',
        
        # Unități greșite
        r'(\d+)\s*kg': r'$\1$ kg',
        r'(\d+)\s*m': r'$\1$ m',
        r'(\d+)\s*cm': r'$\1$ cm',
        r'(\d+)\s*s': r'$\1$ s',
        r'(\d+)\s*m/s': r'$\1$ m/s',
        r'(\d+)\s*m/s²': r'$\1$ m/s²',
        r'(\d+)\s*N': r'$\1$ N',
        r'(\d+)\s*N/m': r'$\1$ N/m',
        r'(\d+)\s*°': r'$\1$°',
        
        # Delta greșit
        r'At\s*=\s*(\d+)': r'$\\Delta t = \1$',
        r'At\s*=\s*(\d+)\s*s': r'$\\Delta t = \1$ s',
        r'Δ\s*([a-zA-Z])': r'$\\Delta \1$',
        
        # Variabile cu indici
        r'([a-zA-Z])\s*_(\d+)': r'$\1_{\2}$',
        r'([a-zA-Z])\s*\^(\d+)': r'$\1^{\2}$',
        
        # Expresii matematice comune
        r'm\s*=\s*(\d+)\s*g': r'm = $\1$ g',
        r'M\s*=\s*(\d+)\s*kg': r'M = $\1$ kg',
    }
    
    for pattern, replacement in corrections.items():
        text = re.sub(pattern, replacement, text)
    
    return text

def convert_to_mathjax(text: str) -> str:
    """Convertește expresiile matematice în format MathJax"""
    # Aplică corecții OCR pentru formule
    text = fix_ocr_formulas(text)
    
    # Convertește expresii matematice comune
    text = re.sub(r'Δ([a-zA-Z])', r'$\\Delta \1$', text)
    text = re.sub(r'([a-zA-Z])\s*=\s*([\d,\.]+)\s*([a-zA-Z/²°]+)', r'$\1 = \2$ \3', text)
    
    return text

def extract_text_from_image(image_path: Path) -> str:
    """Extrage text din imagine folosind OCR cu limba română"""
    try:
        # Citește imaginea
        img = cv2.imread(str(image_path))
        if img is None:
            print(f"  ⚠ Nu s-a putut citi imaginea {image_path.name}")
            return ""
        
        # Convertire la grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Preprocesare pentru OCR mai bun
        # Aplică denoising
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        # Aplică thresholding
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Redimensionează pentru OCR mai bun (dacă e prea mică)
        height, width = thresh.shape
        if height < 1000:
            scale = 1000 / height
            new_width = int(width * scale)
            thresh = cv2.resize(thresh, (new_width, 1000), interpolation=cv2.INTER_CUBIC)
        
        # OCR cu configurație pentru română - FORȚAT limba română
        # PSM 6 = Assume a single uniform block of text
        custom_config = r'--oem 3 --psm 6'
        
        # Încearcă mai întâi cu română
        try:
            text = pytesseract.image_to_string(thresh, config=custom_config, lang='ron')
        except Exception:
            # Dacă nu funcționează, încearcă română + engleză
            try:
                text = pytesseract.image_to_string(thresh, config=custom_config, lang='ron+eng')
            except Exception:
                # Ultimul rezort: doar engleza
                print(f"  ⚠ Limba română nu este disponibilă, folosesc doar engleza")
                text = pytesseract.image_to_string(thresh, config=custom_config, lang='eng')
        
        return normalize_text(text)
    except Exception as e:
        print(f"  ⚠ Eroare la OCR pentru {image_path.name}: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""

def extract_cerinta(text: str, problem_type: str) -> str:
    """Extrage doar cerința problemei (textul dintre 'Rezolvați următoarea problemă' + punctaj și subpunctele)"""
    # Pattern pentru început: "II. Rezolvați următoarea problemă: (15 puncte)"
    if problem_type == "II":
        start_pattern = r'II\.\s*Rezolva[țiȚi]*\s*următoarea\s*problemă?\s*:\s*\(?\d+\s*puncte?\)?'
    else:  # III
        start_pattern = r'III\.\s*Rezolva[țiȚi]*\s*următoarea\s*problemă?\s*:\s*\(?\d+\s*puncte?\)?'
    
    # Pattern pentru sfârșit: primul subpunct (a., b., etc.)
    end_pattern = r'\n\s*[a-d]\.\s+'
    
    # Găsește începutul
    start_match = re.search(start_pattern, text, re.IGNORECASE | re.DOTALL)
    if not start_match:
        # Încearcă pattern mai simplu
        if problem_type == "II":
            start_pattern = r'II\.\s*Rezolva[țiȚi]*'
        else:
            start_pattern = r'III\.\s*Rezolva[țiȚi]*'
        start_match = re.search(start_pattern, text, re.IGNORECASE | re.DOTALL)
    
    if not start_match:
        return text  # Dacă nu găsește începutul, returnează tot textul
    
    start_pos = start_match.end()
    
    # Găsește sfârșitul (primul subpunct)
    end_match = re.search(end_pattern, text[start_pos:], re.IGNORECASE)
    if end_match:
        end_pos = start_pos + end_match.start()
        cerinta = text[start_pos:end_pos].strip()
    else:
        # Dacă nu găsește sfârșitul, ia până la următoarea problemă sau sfârșit
        if problem_type == "II":
            next_problem = re.search(r'III\.\s*Rezolva', text[start_pos:], re.IGNORECASE)
        else:
            next_problem = None
        
        if next_problem:
            end_pos = start_pos + next_problem.start()
            cerinta = text[start_pos:end_pos].strip()
        else:
            cerinta = text[start_pos:].strip()
    
    # Curăță cerința de spații și linii goale
    cerinta = re.sub(r'\s+', ' ', cerinta)
    cerinta = re.sub(r'\n\s*\n', '\n', cerinta)
    
    return cerinta.strip()

def extract_subpuncte(text: str) -> List[Dict]:
    """Extrage subpunctele din text"""
    subpuncte = []
    # Pattern pentru subpuncte: a., b., c., d.
    pattern = r'\n\s*([a-d])\.\s+(.+?)(?=\n\s*[a-d]\.|\n\s*III\.|\n\s*IV\.|\n\n\n|\Z)'
    
    for match in re.finditer(pattern, text, re.DOTALL | re.IGNORECASE):
        subpunct_id = match.group(1).lower()
        cerinta = match.group(2).strip()
        # Curăță cerința de spații multiple și linii noi
        cerinta = re.sub(r'\s+', ' ', cerinta)
        cerinta = re.sub(r'\n', ' ', cerinta)
        
        # Extrage punctajul dacă există (de obicei la sfârșitul cerinței)
        punctaj_match = re.search(r'\((\d+)\s*puncte?\)', cerinta, re.IGNORECASE)
        punctaj = int(punctaj_match.group(1)) if punctaj_match else 1
        
        # Elimină punctajul din cerință dacă există
        cerinta = re.sub(r'\s*\(?\d+\s*puncte?\)?\s*$', '', cerinta, flags=re.IGNORECASE)
        
        subpuncte.append({
            "id": f"{subpunct_id}",
            "cerinta": cerinta.strip(),
            "punctaj": punctaj
        })
    
    return subpuncte

def extract_punctaj(text: str) -> int:
    """Extrage punctajul total din text"""
    # Caută pattern-uri precum "(15 puncte)", "(10 puncte)", etc.
    match = re.search(r'\((\d+)\s*puncte?\)', text, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return 0

def detect_all_figures(image_path: Path) -> List[Tuple[int, int, int, int]]:
    """Detectează toate figurile din imagine și returnează lista de bounding boxes"""
    try:
        img = cv2.imread(str(image_path))
        if img is None:
            return []
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        height, width = gray.shape
        
        # Detectează contururi care ar putea fi figuri
        # Aplică thresholding adaptiv pentru a detecta zone mai întunecate (figuri)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                       cv2.THRESH_BINARY_INV, 11, 2)
        
        # Găsește contururi
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filtrează contururile mari (probabil figuri)
        min_area = (width * height) * 0.02  # Cel puțin 2% din imagine
        max_area = (width * height) * 0.85   # Nu mai mult de 85% din imagine
        
        figures = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if min_area < area < max_area:
                x, y, w, h = cv2.boundingRect(contour)
                # Verifică dacă nu e întreaga imagine și are proporții rezonabile
                aspect_ratio = w / h if h > 0 else 0
                if 0.2 < aspect_ratio < 5.0:  # Proporții rezonabile pentru figuri
                    figures.append((x, y, x + w, y + h))
        
        # Sortează după suprafață (cea mai mare primul)
        figures.sort(key=lambda f: (f[2] - f[0]) * (f[3] - f[1]), reverse=True)
        
        return figures
    except Exception as e:
        print(f"  ⚠ Eroare la detectarea figurilor: {str(e)}")
        return []

def extract_figure(image_path: Path, bbox: Tuple[int, int, int, int], output_path: Path):
    """Extrage figura din imagine și o salvează"""
    try:
        img = cv2.imread(str(image_path))
        x1, y1, x2, y2 = bbox
        
        # Adaugă padding
        padding = 20
        height, width = img.shape[:2]
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(width, x2 + padding)
        y2 = min(height, y2 + padding)
        
        # Crop figura
        figure = img[y1:y2, x1:x2]
        
        # Salvează
        cv2.imwrite(str(output_path), figure)
        return True
    except Exception as e:
        print(f"  ⚠ Eroare la extragerea figurii: {str(e)}")
        return False

def parse_folder_name(folder_name: str) -> Dict[str, str]:
    """Parsează numele folderului pentru a extrage informații"""
    parts = folder_name.split('_')
    
    info = {
        "year": None,
        "pdf_name": None,
        "letter": None,
        "problem_type": None
    }
    
    # Caută anul (4 cifre)
    for part in parts:
        if part.isdigit() and len(part) == 4:
            info["year"] = part
            break
    
    # Caută tipul problemei (II sau III)
    if "_II" in folder_name or folder_name.endswith("_II"):
        info["problem_type"] = "II"
    elif "_III" in folder_name or folder_name.endswith("_III"):
        info["problem_type"] = "III"
    
    # Caută litera (A, B, C, D) - de obicei este înainte de _II sau _III
    for i, part in enumerate(parts):
        if part in ['A', 'B', 'C', 'D']:
            info["letter"] = part
            # Numele PDF-ului este între an (sau None) și literă
            start_idx = 1 if parts[0] == "None" or (info["year"] and parts[0] == info["year"]) else 0
            if info["year"] and info["year"] in parts:
                start_idx = parts.index(info["year"]) + 1
            elif parts[0] == "None":
                start_idx = 1
            
            info["pdf_name"] = "_".join(parts[start_idx:i])
            break
    
    return info

def process_folder(folder_path: Path):
    """Procesează un folder cu imagini de probleme"""
    print(f"\n📁 Procesez folderul: {folder_path.name}")
    
    # Parsează informațiile din numele folderului
    info = parse_folder_name(folder_path.name)
    
    # Găsește toate imaginile page*.png
    image_files = sorted(folder_path.glob("page*.png"))
    
    if not image_files:
        print(f"  ⚠ Nu s-au găsit imagini în folder")
        return
    
    # Concatenează textul din toate imaginile
    full_text = ""
    all_images = []
    
    for img_file in image_files:
        print(f"  📄 Procesez {img_file.name}...")
        text = extract_text_from_image(img_file)
        if text:
            full_text += text + "\n\n"
            all_images.append(str(img_file.relative_to(Path("public"))).replace("\\", "/"))
    
    if not full_text.strip():
        print(f"  ⚠ Nu s-a extras text din imagini")
        return
    
    # Extrage cerința (doar textul dintre "Rezolvați..." și subpuncte)
    problem_type = info["problem_type"] or "II"
    cerinta = extract_cerinta(full_text, problem_type)
    
    # Formatează cerința cu MathJax
    formatted_cerinta = convert_to_mathjax(cerinta)
    
    # Extrage subpunctele din textul complet
    subpuncte = extract_subpuncte(full_text)
    
    # Formatează subpunctele cu MathJax
    for subpunct in subpuncte:
        subpunct["cerinta"] = convert_to_mathjax(subpunct["cerinta"])
    
    # Extrage punctajul
    punctaj = extract_punctaj(full_text)
    
    # Calculează punctajul total din subpuncte dacă nu e găsit
    if punctaj == 0 and subpuncte:
        punctaj = sum(sp.get("punctaj", 1) for sp in subpuncte)
    
    # Salvează textul formatat
    text_file = folder_path / "problem_text.txt"
    with open(text_file, "w", encoding="utf-8") as f:
        f.write(formatted_cerinta)
    print(f"  ✅ Text salvat în {text_file.name}")
    
    # Creează titlu și descriere
    titlu = f"Problema {problem_type} - {info.get('letter', 'Necunoscut')} - {info.get('year', 'Necunoscut')}"
    descriere = f"Problema {problem_type} din aria {info.get('letter', 'necunoscută')}, anul {info.get('year', 'necunoscut')}"
    
    # Creează structura JSON pentru PULS (format corect)
    problem_data = {
        "titlu": titlu,
        "descriere": descriere,
        "categorie": "Bac",
        "varianta": info.get("year", "necunoscut"),
        "dificultate": "mediu",  # Default
        "continut": formatted_cerinta,
        "formule": [],  # Poate fi completat manual sau detectat automat
        "date": {},  # Poate fi completat manual sau detectat automat
        "subpuncte": subpuncte,
        "index": 0,  # Va fi setat la import
        "creator": "",
        "punctajTotal": punctaj,
        "createdAt": datetime.now().isoformat(),
        "poze": all_images,
        # Metadate suplimentare
        "arie": info.get("letter", "NECUNOSCUT"),
        "subiect": problem_type,
        "an": info.get("year", "necunoscut"),
        "fisier": info.get("pdf_name", "necunoscut"),
        "tip_document": "subiect"
    }
    
    # Detectează și extrage toate figurile
    figure_paths = []
    for img_file in image_files:
        figures = detect_all_figures(img_file)
        if figures:
            for idx, bbox in enumerate(figures):
                figure_file = folder_path / f"figure_{img_file.stem}_{idx+1}.png"
                if extract_figure(img_file, bbox, figure_file):
                    figure_path = str(figure_file.relative_to(Path("public"))).replace("\\", "/")
                    figure_paths.append(figure_path)
                    print(f"  ✅ Figură {idx+1} extrasă: {figure_file.name}")
    
    # Adaugă figurile în JSON
    if figure_paths:
        problem_data["figuri"] = figure_paths
        problem_data["poze"].extend(figure_paths)
    
    # Salvează JSON
    json_file = folder_path / "problem_data.json"
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(problem_data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ JSON salvat în {json_file.name}")
    
    if not figure_paths:
        print(f"  ℹ Nu s-au detectat figuri")

def check_tesseract():
    """Verifică dacă Tesseract este instalat și disponibil"""
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False

def main():
    """Funcția principală"""
    # Verifică Tesseract
    if not check_tesseract():
        print("❌ Tesseract OCR nu este instalat sau nu este în PATH!")
        print("📖 Instalează Tesseract OCR:")
        print("   Windows: https://github.com/UB-Mannheim/tesseract/wiki")
        print("   Linux: sudo apt-get install tesseract-ocr tesseract-ocr-ron")
        print("   macOS: brew install tesseract tesseract-lang")
        print("\n💡 Pentru Windows, scriptul va încerca să găsească Tesseract automat.")
        print("   Dacă nu funcționează, setează manual calea în script.")
        return
    
    if not PUBLIC_SCREENSHOTS_DIR.exists():
        print(f"❌ Directorul {PUBLIC_SCREENSHOTS_DIR} nu există!")
        return
    
    # Găsește toate folderele
    folders = [f for f in PUBLIC_SCREENSHOTS_DIR.iterdir() if f.is_dir()]
    
    print(f"📁 Găsite {len(folders)} foldere de procesat")
    print(f"🔍 Tesseract OCR este disponibil\n")
    
    for folder in sorted(folders):
        try:
            process_folder(folder)
        except Exception as e:
            print(f"  ❌ Eroare la procesarea {folder.name}: {str(e)}")
            import traceback
            traceback.print_exc()
            continue
    
    print(f"\n{'='*60}")
    print(f"✅ Procesare completă!")

if __name__ == "__main__":
    main()

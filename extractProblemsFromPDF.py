import fitz  # PyMuPDF
import re
import json
from pathlib import Path
from collections import defaultdict

BAC_DIR = Path("public/probleme/bac")
OUT_DIR = Path("output")
IMG_DIR = OUT_DIR / "images"
PUBLIC_SCREENSHOTS_DIR = Path("public/problem-screenshots")

OUT_DIR.mkdir(exist_ok=True)
IMG_DIR.mkdir(exist_ok=True)
PUBLIC_SCREENSHOTS_DIR.mkdir(exist_ok=True)

# -------------------------
# REGEX-URI CORECTE PENTRU BAC
# -------------------------

SECTION_PATTERN = re.compile(
    r'\n([A-D])\.\s+([A-ZĂÂÎȘȚ\s]+?)\s+Varianta\s+(\d+)',
    re.IGNORECASE
)

PROB_II_PATTERN = re.compile(r'\nII\.\s+Rezolva', re.IGNORECASE)
PROB_III_PATTERN = re.compile(r'\nIII\.\s+Rezolva', re.IGNORECASE)

SUBPUNCT_PATTERN = re.compile(
    r'\n([a-d])\.\s+(.+?)(?=\n[a-d]\.|\nIII\.|\n\n|\Z)',
    re.DOTALL | re.IGNORECASE
)

# -------------------------
# NORMALIZARE DIACRITICE
# -------------------------

def normalize(text: str) -> str:
    return (
        text.replace("Ń", "Ț")
            .replace("Ş", "Ș")
            .replace("Ţ", "Ț")
            .replace("ş", "ș")
            .replace("ţ", "ț")
    )

# -------------------------
# FUNCȚIE PENTRU PROCESAREA UNUI PDF
# -------------------------

def extract_from_pdf(pdf_path: Path, year: str = None, doc_type: str = None):
    """Extrage problemele dintr-un PDF și returnează lista de probleme"""
    try:
        doc = fitz.open(pdf_path)
        full_text = ""
        page_map = []  # (page_index, text)

        for i, page in enumerate(doc):
            t = normalize(page.get_text())
            full_text += t + "\n"
            page_map.append((i, t))

        results = []

        # Găsește secțiunile A–D
        sections = []
        for m in SECTION_PATTERN.finditer(full_text):
            sections.append({
                "letter": m.group(1),
                "name": m.group(2).strip(),
                "variant": m.group(3),
                "start": m.start()
            })

        sections.sort(key=lambda x: x["start"])

        # Procesează fiecare secțiune
        for i, sec in enumerate(sections):
            start = sec["start"]
            end = sections[i+1]["start"] if i+1 < len(sections) else len(full_text)
            sec_text = full_text[start:end]

            for label, pattern in [("II", PROB_II_PATTERN), ("III", PROB_III_PATTERN)]:
                m = pattern.search(sec_text)
                if not m:
                    continue

                prob_text = sec_text[m.start():]

                # subpuncte
                subs = []
                for sm in SUBPUNCT_PATTERN.finditer(prob_text):
                    subs.append({
                        "id": sm.group(1),
                        "cerinta": re.sub(r"\s+", " ", sm.group(2)).strip()
                    })

                # Screenshot pagină - găsește toate paginile care conțin problema
                img_paths = []
                public_img_paths = []
                pdf_name = pdf_path.stem
                
                # Determină sfârșitul problemei curente
                prob_start_pos = m.start()
                prob_end_pos = len(sec_text)
                
                # Pentru problema II, sfârșitul este la începutul problemei III sau sfârșitul secțiunii
                if label == "II":
                    next_iii = PROB_III_PATTERN.search(sec_text[prob_start_pos:])
                    if next_iii:
                        prob_end_pos = prob_start_pos + next_iii.start()
                # Pentru problema III, sfârșitul este la sfârșitul secțiunii sau următoarea secțiune
                else:  # label == "III"
                    prob_end_pos = len(sec_text)
                
                # Extrage textul complet al problemei
                prob_full_text = sec_text[prob_start_pos:prob_end_pos]
                
                # Găsește prima pagină care conține problema
                start_page = None
                prob_start_marker = "II. Rezolva" if label == "II" else "III. Rezolva"
                for page_index, page_text in page_map:
                    # Caută marker-ul problemei în textul paginii
                    if prob_start_marker in page_text:
                        # Verifică dacă textul problemei apare în această pagină
                        search_text = prob_full_text[:min(200, len(prob_full_text))]
                        if search_text in page_text:
                            start_page = page_index
                            break
                
                # Găsește ultima pagină care conține problema
                end_page = start_page
                if start_page is not None:
                    # Caută ultima pagină care conține text din problemă
                    # Folosim un fragment din mijloc și sfârșitul problemei pentru identificare
                    prob_mid_text = prob_full_text[max(0, len(prob_full_text)//2):min(len(prob_full_text), len(prob_full_text)//2 + 300)]
                    prob_end_text = prob_full_text[max(0, len(prob_full_text) - 300):]
                    
                    for page_index in range(start_page, len(page_map)):
                        page_text = page_map[page_index][1]
                        # Verifică dacă pagina conține text din problemă
                        contains_prob = (
                            prob_full_text[:200] in page_text or
                            prob_mid_text in page_text or
                            prob_end_text in page_text
                        )
                        
                        # Verifică dacă nu am ajuns la următoarea problemă sau secțiune
                        is_next_section = False
                        if label == "II" and "III. Rezolva" in page_text:
                            # Am ajuns la problema III, deci problema II s-a terminat
                            is_next_section = True
                        elif i + 1 < len(sections):
                            # Verifică dacă am ajuns la următoarea secțiune A-D
                            next_sec_letter = sections[i+1]["letter"]
                            if f"{next_sec_letter}." in page_text and "Varianta" in page_text:
                                is_next_section = True
                        
                        if contains_prob and not is_next_section:
                            end_page = page_index
                        elif is_next_section or not contains_prob:
                            # Dacă am ajuns la următoarea secțiune sau nu mai conține text din problemă
                            # Verifică dacă pagina anterioară era ultima pagină validă
                            if page_index > start_page:
                                break
                    
                    # Salvează screenshot-uri pentru toate paginile problemei (doar zona problemei)
                    if start_page is not None and end_page is not None:
                        # Creează folderul pentru această problemă
                        problem_folder_name = f"{year}_{pdf_name}_{sec['letter']}_{label}"
                        problem_folder = PUBLIC_SCREENSHOTS_DIR / problem_folder_name
                        problem_folder.mkdir(exist_ok=True)
                        
                        for page_index in range(start_page, end_page + 1):
                            page = doc[page_index]
                            page_rect = page.rect
                            
                            # Găsește bounding box-ul problemei pe această pagină
                            start_y = 0
                            end_y = page_rect.y1
                            
                            # Pentru prima pagină, începe de la marker-ul problemei
                            if page_index == start_page:
                                prob_marker_rects = page.search_for(prob_start_marker)
                                if prob_marker_rects:
                                    start_y = prob_marker_rects[0].y0
                            
                            # Pentru ultima pagină, găsește sfârșitul problemei
                            if page_index == end_page:
                                # Caută următoarea problemă sau secțiune pe această pagină
                                if label == "II":
                                    next_iii_rects = page.search_for("III. Rezolva")
                                    if next_iii_rects:
                                        end_y = next_iii_rects[0].y0  # Începutul problemei III
                                # Pentru problema III, poate există următoarea secțiune A-D
                                # sau pur și simplu folosim sfârșitul paginii
                            
                            # Creează bounding box-ul pentru crop
                            # Adaugă un mic padding pentru a include tot conținutul
                            padding = 20
                            crop_rect = fitz.Rect(
                                max(0, page_rect.x0),
                                max(0, start_y - padding),
                                min(page_rect.x1, page_rect.x1),
                                min(page_rect.y1, end_y + padding)
                            )
                            
                            # Face crop doar la zona problemei
                            pix = page.get_pixmap(dpi=200, clip=crop_rect)
                            
                            # Salvează în output/images (pentru compatibilitate)
                            img_path = IMG_DIR / f"{year}_{pdf_name}_{sec['letter']}_{label}_page{page_index}.png"
                            pix.save(img_path)
                            img_paths.append(str(img_path))
                            
                            # Salvează în public/problem-screenshots/{problem_folder}/
                            public_img_name = f"page{page_index}.png"
                            public_img_path = problem_folder / public_img_name
                            pix.save(public_img_path)
                            public_img_paths.append(f"problem-screenshots/{problem_folder_name}/{public_img_name}")

                results.append({
                    "arie": sec["name"],
                    "subiect": label,
                    "variant": sec["variant"],
                    "continut": prob_text.strip(),
                    "subpuncte": subs,
                    "imagini": img_paths,
                    "imagini_public": public_img_paths,
                    "an": year,
                    "fisier": pdf_path.name,
                    "tip_document": doc_type
                })

        doc.close()
        return results
    except Exception as e:
        print(f"  ✖ Eroare la procesarea {pdf_path.name}: {str(e)}")
        return []

# -------------------------
# FUNCȚIE PENTRU DETERMINAREA CATEGORIEI
# -------------------------

def determine_category(pdf_path: Path):
    """Determină categoria (an, tip) din numele fișierului"""
    name = pdf_path.name.lower()
    stem = pdf_path.stem.lower()
    
    # Extrage anul
    year_match = re.search(r'(\d{4})', name)
    year = year_match.group(1) if year_match else None
    
    # Determină tipul documentului
    doc_type = "necunoscut"
    if "barem" in name or "bar" in name:
        doc_type = "barem"
    elif "subiect" in name or "var" in name:
        doc_type = "subiect"
    
    # Determină profilul
    profile = "necunoscut"
    if "teoretic" in name or "vocational" in name:
        profile = "teoretic_vocational"
    elif "tehnologic" in name:
        profile = "tehnologic"
    
    return year, doc_type, profile

# -------------------------
# MAIN - PROCESEAZĂ TOATE PDF-URILE
# -------------------------

if not BAC_DIR.exists():
    print(f"❌ Directorul {BAC_DIR} nu există!")
    exit(1)

# Găsește toate PDF-urile
pdf_files = list(BAC_DIR.rglob("*.pdf"))
print(f"📁 Găsite {len(pdf_files)} fișiere PDF")

# Organizează rezultatele pe categorii
results_by_category = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
all_results = []

total_processed = 0
total_problems = 0

for pdf_path in sorted(pdf_files):
    year, doc_type, profile = determine_category(pdf_path)
    
    print(f"\n📄 Procesez: {pdf_path.relative_to(BAC_DIR)}")
    print(f"   An: {year}, Tip: {doc_type}, Profil: {profile}")
    
    problems = extract_from_pdf(pdf_path, year, doc_type)
    
    if problems:
        total_problems += len(problems)
        all_results.extend(problems)
        
        # Organizează pe categorii
        if year:
            results_by_category[year][doc_type][profile].extend(problems)
        else:
            results_by_category["necunoscut"][doc_type][profile].extend(problems)
        
        print(f"   ✅ Extrase {len(problems)} probleme")
    else:
        print(f"   ⚠ Nu s-au găsit probleme")
    
    total_processed += 1

# -------------------------
# SALVEAZĂ REZULTATELE
# -------------------------

# Salvează toate problemele într-un singur fișier
with open(OUT_DIR / "bac_extracted_all.json", "w", encoding="utf-8") as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)

# Salvează organizat pe categorii
category_structure = {}
for year in sorted(results_by_category.keys()):
    category_structure[year] = {}
    for doc_type in sorted(results_by_category[year].keys()):
        category_structure[year][doc_type] = {}
        for profile in sorted(results_by_category[year][doc_type].keys()):
            category_structure[year][doc_type][profile] = results_by_category[year][doc_type][profile]

with open(OUT_DIR / "bac_extracted_by_category.json", "w", encoding="utf-8") as f:
    json.dump(category_structure, f, ensure_ascii=False, indent=2)

# Salvează și un fișier pentru fiecare categorie principală (an)
for year in results_by_category.keys():
    year_dir = OUT_DIR / "by_year" / year
    year_dir.mkdir(parents=True, exist_ok=True)
    
    year_data = {}
    for doc_type in results_by_category[year].keys():
        year_data[doc_type] = {}
        for profile in results_by_category[year][doc_type].keys():
            year_data[doc_type][profile] = results_by_category[year][doc_type][profile]
    
    with open(year_dir / f"{year}_extracted.json", "w", encoding="utf-8") as f:
        json.dump(year_data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"✅ Gata!")
print(f"   Procesate: {total_processed} PDF-uri")
print(f"   Extrase: {total_problems} probleme")
print(f"   Fișiere salvate:")
print(f"     - {OUT_DIR / 'bac_extracted_all.json'}")
print(f"     - {OUT_DIR / 'bac_extracted_by_category.json'}")
print(f"     - {OUT_DIR / 'by_year'}/*/")
print(f"   Screenshot-uri salvate în: {PUBLIC_SCREENSHOTS_DIR}")
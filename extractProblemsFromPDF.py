import fitz  # PyMuPDF
import re
import json
from pathlib import Path
from collections import defaultdict

BAC_DIR = Path("public/probleme/bac")
OUT_DIR = Path("output")
IMG_DIR = OUT_DIR / "images"

OUT_DIR.mkdir(exist_ok=True)
IMG_DIR.mkdir(exist_ok=True)

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

                # Screenshot pagină
                img_paths = []
                pdf_name = pdf_path.stem
                
                for page_index, page_text in page_map:
                    if prob_text[:200] in page_text:
                        pix = doc[page_index].get_pixmap(dpi=200)
                        img_path = IMG_DIR / f"{year}_{pdf_name}_{sec['letter']}_{label}_page{page_index}.png"
                        pix.save(img_path)
                        img_paths.append(str(img_path))
                        break

                results.append({
                    "arie": sec["name"],
                    "subiect": label,
                    "variant": sec["variant"],
                    "continut": prob_text.strip(),
                    "subpuncte": subs,
                    "imagini": img_paths,
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
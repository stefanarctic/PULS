import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

BASE_URL = "https://subiectebac.ro/fizica/fizica.html"
OUTPUT_DIR = "public/probleme/bac"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

def safe_filename(url):
    return os.path.basename(urlparse(url).path)

def download_pdf(url, folder):
    os.makedirs(folder, exist_ok=True)
    filename = safe_filename(url)
    path = os.path.join(folder, filename)

    if os.path.exists(path):
        print(f"  ✔ Exists: {filename}")
        return True

    try:
        r = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        if r.status_code == 200:
            content_type = r.headers.get("Content-Type", "").lower()
            if "application/pdf" in content_type or url.endswith(".pdf"):
                with open(path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"  ⬇ Downloaded: {filename}")
                return True
            else:
                print(f"  ✖ Not a PDF: {url} (Content-Type: {content_type})")
                return False
        else:
            print(f"  ✖ Failed ({r.status_code}): {url}")
            return False
    except Exception as e:
        print(f"  ✖ Error downloading {url}: {str(e)}")
        return False

def extract_year_from_url(url):
    """Extrage anul din URL"""
    match = re.search(r'fizica[_-]?(\d{4})', url)
    if match:
        return match.group(1)
    # Încearcă să extragă din path
    match = re.search(r'/(\d{4})/', url)
    if match:
        return match.group(1)
    return None

def main():
    print("Fetching main page...")
    try:
        r = requests.get(BASE_URL, headers=HEADERS, timeout=30)
        r.raise_for_status()
    except Exception as e:
        print(f"Error fetching main page: {str(e)}")
        return

    soup = BeautifulSoup(r.text, "html.parser")

    # Găsește toate linkurile către pagini de ani
    year_links = set()
    
    # Caută linkuri care conțin "fizica" și un an (4 cifre)
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        
        # Verifică dacă este un link către o pagină de an
        if "fizica" in href.lower() or "fizica" in text.lower():
            # Verifică dacă conține un an în text sau href
            if re.search(r'\d{4}', href) or re.search(r'\d{4}', text):
                full_url = urljoin(BASE_URL, href)
                year_links.add(full_url)
    
    # Dacă nu găsește linkuri, încercă să construiască URL-urile direct
    if len(year_links) == 0:
        print("No year links found, trying direct URLs...")
        # Anii posibili (de la 2010 la 2025)
        for year in range(2010, 2026):
            year_url = f"https://subiectebac.ro/fizica/fizica_{year}.html"
            year_links.add(year_url)
    
    print(f"Found {len(year_links)} year pages")
    
    total_downloaded = 0
    total_failed = 0
    
    for page_url in sorted(year_links):
        year = extract_year_from_url(page_url)
        print(f"\n{'='*60}")
        print(f"Processing year page: {page_url}")
        if year:
            print(f"Year detected: {year}")
        
        try:
            r = requests.get(page_url, headers=HEADERS, timeout=30)
            r.raise_for_status()
        except Exception as e:
            print(f"  ✖ Error fetching page: {str(e)}")
            total_failed += 1
            continue

        soup = BeautifulSoup(r.text, "html.parser")

        # Găsește toate linkurile PDF
        pdf_links = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.endswith(".pdf"):
                full_pdf_url = urljoin(page_url, href)
                pdf_links.add(full_pdf_url)
        
        # Dacă nu găsește PDF-uri în linkuri, construiește URL-urile direct
        if len(pdf_links) == 0 and year:
            print(f"  No PDF links found, trying direct URL construction for year {year}...")
            base_pdf_url = f"https://subiectebac.ro/fizica/{year}/"
            
            # Variante posibile pentru Real (teoretic_vocational)
            variants_real = ["01", "02", "03", "04", "05", "06", "simulare", "model"]
            for variant in variants_real:
                pdf_links.add(f"{base_pdf_url}E_d_fizica_teoretic_vocational_{year}_var_{variant}_LRO.pdf")
                pdf_links.add(f"{base_pdf_url}E_d_fizica_teoretic_vocational_{year}_bar_{variant}_LRO.pdf")
            
            # Variante posibile pentru Tehnologic
            variants_tech = ["01", "02", "03", "04", "05", "06", "simulare", "model"]
            for variant in variants_tech:
                pdf_links.add(f"{base_pdf_url}E_d_fizica_tehnologic_{year}_var_{variant}_LRO.pdf")
                pdf_links.add(f"{base_pdf_url}E_d_fizica_tehnologic_{year}_bar_{variant}_LRO.pdf")
            
            # Pentru sesiunea specială (doar Real)
            pdf_links.add(f"{base_pdf_url}E_d_fizica_teoretic_vocational_{year}_var_special_LRO.pdf")
            pdf_links.add(f"{base_pdf_url}E_d_fizica_teoretic_vocational_{year}_bar_special_LRO.pdf")

        # Creează folderul pentru an
        if year:
            folder_name = year
        else:
            folder_name = page_url.split("/")[-1].replace(".html", "").replace("fizica_", "").replace("fizica-", "")
        
        folder_path = os.path.join(OUTPUT_DIR, folder_name)
        
        print(f"  Found {len(pdf_links)} PDF links")
        print(f"  Saving to: {folder_path}")
        
        downloaded_count = 0
        failed_count = 0
        
        for pdf_url in sorted(pdf_links):
            if download_pdf(pdf_url, folder_path):
                downloaded_count += 1
                total_downloaded += 1
            else:
                failed_count += 1
                total_failed += 1
        
        print(f"  Summary: {downloaded_count} downloaded, {failed_count} failed")
    
    print(f"\n{'='*60}")
    print(f"TOTAL SUMMARY:")
    print(f"  Downloaded: {total_downloaded}")
    print(f"  Failed: {total_failed}")
    print(f"  Output directory: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
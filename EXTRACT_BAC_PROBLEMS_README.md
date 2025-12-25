# Extract BAC Problems - Documentation

## Overview

This script extracts Subject II and Subject III problems from transcribed PDF files in the `variante_transcribed` directory and generates JSON data formatted for PULS.

## Features

- ✅ Extracts Subject II and Subject III problems from transcribed JSON files
- ✅ Extracts images referenced in problems and converts them to base64 data URLs
- ✅ Generates metadata including year, variant, subject area, and type
- ✅ Extracts subpuncte (subpoints) from problem content
- ✅ Creates both consolidated and individual problem files
- ✅ Generates summary statistics

## Usage

### Run the extraction script:

```bash
npm run extract-bac
```

Or directly:

```bash
node extract-bac-problems.js
```

## Output Structure

The script creates the following structure:

```
extracted_problems/
├── all-problems.json          # All problems in a single file
├── summary.json                # Summary statistics
└── individual/                 # Individual problem files
    ├── problem-1-2011_proba_e_d_fizica_var_09-sub2.json
    ├── problem-2-2011_proba_e_d_fizica_var_09-sub3.json
    └── ...
```

## Problem Format

Each extracted problem follows this structure:

```json
{
  "titlu": "Problema II - Mecanică - Bac 2011 Var 9",
  "descriere": "Problema de bacalaureat - Subiectul II din Mecanică, 2011, Varianta 9",
  "categorie": "Bac",
  "varianta": "2011 Var 9",
  "dificultate": "mediu",
  "punctajTotal": 15,
  "continut": "Problem content text...",
  "formule": [],
  "date": {},
  "subpuncte": [
    {
      "id": "1a",
      "cerinta": "Subpoint a content...",
      "punctaj": 4
    }
  ],
  "poze": [
    "data:image/jpeg;base64,..."
  ],
  "metadata": {
    "source": "2011_proba_e_d_fizica_var_09",
    "year": 2011,
    "variant": 9,
    "type": null,
    "subjectArea": "Mecanică",
    "subjectNumber": 2
  }
}
```

## Image Handling

Images are extracted in two ways:

1. **From JSON data**: If images are stored in the `imageBase64` field of the JSON file
2. **From disk**: If images are saved as separate files in the folder, they are read and converted to base64

All images are stored as base64 data URLs in the `poze` array field, ready for upload to PULS.

## Metadata Extraction

The script extracts metadata from folder names:

- **Year**: Extracted from the first part of the folder name (e.g., `2011_...`)
- **Variant**: Extracted from patterns like `var_09` or `var09`
- **Type**: Detected from keywords:
  - `tehnologic` → "tehnologic"
  - `teoretic` or `vocational` → "teoretic"
  - `model` → "model"
  - `simulare` → "simulare"
- **Subject Area**: Extracted from markdown content (Mecanică, Termodinamică, Curent continuu, Optică)

## Subpuncte Extraction

The script automatically extracts subpoints (a., b., c., d.) from problem content. If no subpoints are found, the entire problem content is treated as a single subpoint.

## Summary Statistics

The `summary.json` file contains:

```json
{
  "totalProblems": 234,
  "byYear": {
    "2011": 10,
    "2012": 15,
    ...
  },
  "bySubjectArea": {
    "Mecanică": 58,
    "Termodinamică": 45,
    ...
  },
  "bySubjectNumber": {
    "2": 117,
    "3": 117
  },
  "extractionDate": "2024-01-15T10:30:00.000Z"
}
```

## Next Steps

After extraction:

1. **Review the problems**: Check `extracted_problems/all-problems.json` or individual files
2. **Upload to PULS**: Use the generated JSON files to upload problems to your PULS database
3. **Manual adjustments**: Some problems may need manual review for:
   - Subpoint point distribution
   - Formula extraction
   - Data extraction
   - Image quality

## Troubleshooting

### No problems extracted

- Check that the JSON files contain markdown with "### II." or "### III." patterns
- Verify the folder structure matches expected format

### Images not found

- Ensure image files exist in the same folder as the JSON file
- Check that image references in markdown match actual file names

### Metadata issues

- Review folder naming conventions
- Check that subject areas are properly identified in markdown

## Notes

- The script processes all folders in `variante_transcribed`
- Problems are extracted from all pages in each JSON file
- Images are converted to base64 but original files are preserved
- The script is idempotent - you can run it multiple times safely


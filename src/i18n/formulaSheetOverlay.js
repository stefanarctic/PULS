import { FORMULA_RO_TO_EN } from "@/data/formulaRoToEn";
import { FORMULA_EXPLANATION_RO_TO_EN } from "@/data/formulaExplanationRoToEn";

/**
 * When lang is English, replaces section headings, card titles, and explanations using lookup maps.
 */
export function localizeFormulaSheet(roSections, lang) {
  if (lang !== "en") return roSections;
  const overlay = roSections.map((sec) => ({
    section: FORMULA_RO_TO_EN[sec.section] ?? sec.section,
    titles: sec.formulas.map((f) => FORMULA_RO_TO_EN[f.title] ?? f.title),
    explanations: sec.formulas.map(
      (f) => FORMULA_EXPLANATION_RO_TO_EN[f.explanation] ?? f.explanation
    ),
  }));
  return overlayFormulaSections(roSections, overlay);
}

/**
 * Applies English section titles and formula card labels over Romanian formula data
 * (same formulas); optional per-card explanations. Array length and order must match the RO sheet.
 */
export function overlayFormulaSections(roSections, enOverlay) {
  if (!enOverlay || !Array.isArray(enOverlay)) return roSections;
  return roSections.map((sec, i) => {
    const o = enOverlay[i];
    if (!o) return sec;
    return {
      ...sec,
      section: o.section != null && o.section !== "" ? o.section : sec.section,
      formulas: sec.formulas.map((f, j) => ({
        ...f,
        title:
          o.titles && o.titles[j] != null && o.titles[j] !== ""
            ? o.titles[j]
            : f.title,
        explanation:
          o.explanations && o.explanations[j] != null && o.explanations[j] !== ""
            ? o.explanations[j]
            : f.explanation,
      })),
    };
  });
}

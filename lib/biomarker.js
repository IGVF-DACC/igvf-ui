// Use the same title for biomarker search page and biomarker object page for that biomarker
export function getBiomarkerTitle(biomarker) {
  const titleElements = [biomarker.name, biomarker.quantification].filter(
    Boolean
  );
  return titleElements.join(" ");
}

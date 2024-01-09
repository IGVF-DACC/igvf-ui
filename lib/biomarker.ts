/**
 * Relevant properties of a biomarker object as defined by its schema.
 */
type Biomarker = {
  name: string;
  quantification: "negative" | "positive" | "low" | "intermediate" | "high";
  classification?: "cell surface protein" | "marker gene";
};

/**
 * Use the same title for biomarker search page and biomarker object page for that biomarker.
 * @param {object} biomarker Biomarker object from data provider
 * @returns {string} Title for biomarker object page
 */
export function getBiomarkerTitle(biomarker: Biomarker): string {
  const titleElements = [
    biomarker.classification,
    biomarker.name,
    biomarker.quantification,
  ].filter(Boolean);
  return titleElements.join(" ");
}

/**
 * Set up biomarker search page identifier for top of item.
 * @param {object} biomarker Biomarker object from data provider
 * @returns {string} Biomarker search page identifier
 */
export function getBiomarkerSearchIdentifier(biomarker: Biomarker): string {
  const titleElements = [biomarker.name, biomarker.quantification].filter(
    Boolean
  );
  return titleElements.join("-");
}

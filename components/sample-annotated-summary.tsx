// node_modules
import _ from "lodash";
// components
import { AnnotatedItem } from "./annotated-value";
// lib
import { type OntologyTermObject } from "../lib/ontology-terms";

/**
 * Regex pattern that matches a single word character, which includes letters, numbers, underscores,
 * and hyphens. This is used to identify term names in the summary string that may contain these
 * characters.
 */
const WORD_CHAR = String.raw`[\p{L}\p{N}_-]`;

/**
 * Display a summary string with annotated terms. The summary string may contain multiple terms that
 * we want to annotate with tooltips. The terms to annotate and their corresponding annotations are
 * provided in the `terms` array. Each term in the summary that matches a term name in the `terms`
 * array will be wrapped with an `AnnotatedItem` that shows the term's definition in a tooltip on
 * hover.
 *
 * @param summary - Summary string that may contain terms to annotate
 * @param terms - Ontology term objects that provide the term names and their annotations
 */
export function SampleAnnotatedSummary({
  summary,
  terms,
}: {
  summary: string;
  terms: OntologyTermObject[];
}) {
  const annotatedParts = renderAnnotatedSummary(summary, terms);
  return <>{annotatedParts}</>;
}

/**
 * Generate React nodes for a summary string that contains annotated terms. The function identifies
 * terms in the summary that match the term names in the provided `terms` array and wraps those
 * terms with `AnnotatedItem` components that display the term's definition in a tooltip. Non-term
 * parts of the summary are returned as plain text nodes. This lets you display one summary string
 * with multiple annotated terms, where each term's annotation is shown on hover.
 *
 * @param summary - Potentially contains term names needing annotation
 * @param terms - Ontology term objects that provide the term names and their annotations
 * @returns React nodes with annotated terms wrapped in `AnnotatedItem` components, and non-term
 *          parts as plain text
 */
function renderAnnotatedSummary(
  summary: string,
  terms: OntologyTermObject[]
): React.ReactNode {
  // Map term names to their corresponding term objects for quick lookup.
  const termByName = new Map(terms.map((term) => [term.term_name, term]));

  // Get a list of term names sorted by length in descending order to ensure longer matches are
  // found first, avoiding partial matches.
  const termNames = _.sortBy(terms, (term) => -term.term_name.length).map(
    (term) => term.term_name
  );

  // Generate a regex pattern that matches any of the term names, escaping special characters to
  // avoid regex errors. The "|" is the regex "or" operator, allowing us to match any of the term
  // names. Example: ["term.1", "abc|def", "44+55"] becomes "term\.1|abc\|def|44\+55".
  const pattern = termNames
    .map((termName) => {
      const escaped = escapeRegExp(termName);
      return String.raw`(?<!${WORD_CHAR})${escaped}(?!${WORD_CHAR})`;
    })
    .join("|");
  if (!pattern) {
    // No terms to annotate, return the original summary as a single React node.
    return summary;
  }

  // Make a regex that matches any of the term names in the summary, with a capture group so that
  // the non-matching parts of the summary are preserved when we split the string.
  const regex = new RegExp(`(${pattern})`, "gu");

  // Split the summary into parts based on the composed regex. Each part is either a term name that
  // we annotate or a non-term string that we leave as is.
  return summary.split(regex).map((part, index) => {
    const term = termByName.get(part);

    // Handle the case where the part is not a given term name.
    if (!term) {
      return part;
    }

    // Handle the case where the part is a term name that we want to annotate.
    const key = `${part}-${index}`;
    return (
      <AnnotatedItem key={key} tooltipKey={key} annotation={term.definition}>
        {part}
      </AnnotatedItem>
    );
  });
}

/**
 * To build a regex pattern that matches any of the term names in the summary, special characters
 * in the term names that could interfere with the regex syntax need escaping. This function takes
 * a term name and escapes those characters.
 *
 * @param termName - Term name to escape for use in a regular expression
 * @returns Escaped string, safe for use in a regular expression
 */
function escapeRegExp(termName: string) {
  return termName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

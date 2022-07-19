// node_modules
import PropTypes from "prop-types";
// libs
import Curie from "../libs/curie";

/**
 * Map from ontology term ID prefixes to corresponding URL bases.
 */
const urlMap = {
  CL: "https://www.ebi.ac.uk/ols/ontologies/uberon/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2F",
  CLO: "https://www.ebi.ac.uk/ols/ontologies/uberon/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2F",
  DOID: "http://purl.obolibrary.org/obo/",
  EFO: "http://www.ebi.ac.uk/efo/",
  HP: "http://purl.obolibrary.org/obo/",
  MONDO: "http://purl.obolibrary.org/obo/",
  UBERON:
    "https://www.ebi.ac.uk/ols/ontologies/uberon/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2F",
};

/**
 * Map from ontology term ID prefixes to corresponding URLs.
 */
export class OntologyTerm extends Curie {
  get isValid() {
    return Boolean(this.prefix && this.id && urlMap[this.prefix]);
  }

  get url() {
    return this.isValid
      ? `${urlMap[this.prefix]}${this.prefix}_${this.id}`
      : "";
  }
}

/**
 * Display the ontology term ID given in `termId`, and link to a corresponding site if the prefix
 * of the term ID has one. Any term IDs with prefixes not matching any in the `urlMap` global
 * variable simply display without a link. All term IDs are of the form XXX:nnnnnnn...
 */
export const OntologyTermId = ({ termId }) => {
  const ontologyTerm = new OntologyTerm(termId);
  if (ontologyTerm.isValid) {
    return (
      <a href={ontologyTerm.url} target="_blank" rel="noreferrer">
        {ontologyTerm.curie}
      </a>
    );
  }

  // Either term ID not in specified form (schema should disallow) or we don't handle the prefix,
  // displaying the term ID without linking anywhere.
  return <>{ontologyTerm.curie}</>;
};

OntologyTermId.propTypes = {
  // Term ID to map to a link
  termId: PropTypes.string.isRequired,
};

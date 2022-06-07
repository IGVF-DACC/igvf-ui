// node_modules
import PropTypes from "prop-types"

/**
 * Map from ontology term ID prefixes to corresponding URL bases.
 */
const urlMap = {
  EFO: "http://www.ebi.ac.uk/efo/",
  UBERON:
    "http://www.ontobee.org/ontology/UBERON?iri=http://purl.obolibrary.org/obo/",
  CL: "http://www.ontobee.org/ontology/CL?iri=http://purl.obolibrary.org/obo/",
  CLO: "http://www.ontobee.org/ontology/CLO?iri=http://purl.obolibrary.org/obo/",
}

/**
 * Display the ontology term ID given in `termId`, and link to a corresponding site if the prefix
 * of the term ID has one. Any term IDs with prefixes not matching any in the `urlMap` global
 * variable simply display without a link. All term IDs are of the form XXX:nnnnnnn...
 */
const OntologyTermId = ({ termId }) => {
  const idPieces = termId.split(":")
  if (idPieces.length === 2) {
    const urlBase = urlMap[idPieces[0]]
    if (urlBase) {
      return (
        <a
          href={urlBase + termId.replace(":", "_")}
          target="_blank"
          rel="noreferrer"
        >
          {termId}
        </a>
      )
    }
  }

  // Either term ID not in specified form (schema should disallow) or not one of the ones
  // we link to. Just display the term ID without linking out.
  return <>{termId}</>
}

OntologyTermId.propTypes = {
  // Term ID to map to a link
  termId: PropTypes.string.isRequired,
}

export default OntologyTermId

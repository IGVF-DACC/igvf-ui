// node_modules
import PropTypes from "prop-types";
// lib
import { formatDateApaStyle } from "../lib/dates";
import { checkPublicationCitationVisible } from "../lib/publication";

/**
 * Display a styled citation for a publication.
 */
export function PublicationCitation({ publication, className = null }) {
  if (checkPublicationCitationVisible(publication)) {
    return (
      <div className={className}>
        {publication.authors ? `${publication.authors} ` : ""}
        {publication.date_published ? (
          `${formatDateApaStyle(publication.date_published)}. `
        ) : (
          <span>&nbsp;</span>
        )}
        {`${publication.title}. `}
        {publication.journal ? <i>{publication.journal}. </i> : ""}
        {publication.volume ? publication.volume : ""}
        {publication.issue ? `(${publication.issue}), ` : ""}
        {publication.page ? `${publication.page}.` : <span>&nbsp;</span>}
      </div>
    );
  }
  return null;
}

PublicationCitation.propTypes = {
  // Publication object the citation represents
  publication: PropTypes.shape({
    title: PropTypes.string.isRequired,
    authors: PropTypes.string,
    date_published: PropTypes.string,
    journal: PropTypes.string,
    volume: PropTypes.string,
    issue: PropTypes.string,
    page: PropTypes.string,
  }).isRequired,
  // Tailwind CSS classes to add to the wrapper div around the citation
  className: PropTypes.string,
};

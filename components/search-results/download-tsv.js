// node modules
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
// components
import { ButtonLink } from "../form-elements";
// lib
import { API_URL } from "../../lib/constants";
import { splitPathAndQueryString } from "../../lib/query-utils";

/**
 * Display the button to download the current report as a TSV file.
 */
export default function DownloadTSV({ searchUri }) {
  const { queryString } = splitPathAndQueryString(searchUri);
  const link = `${API_URL}/multireport.tsv?${queryString}`;

  return (
    <ButtonLink href={link} hasIconOnly={true} label="Download report as TSV">
      <DocumentArrowDownIcon strokeWidth={2} />
    </ButtonLink>
  );
}

DownloadTSV.propTypes = {
  // Search-results path and query string
  searchUri: PropTypes.string.isRequired,
};

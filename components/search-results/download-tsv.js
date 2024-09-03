// node modules
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
// components
import { ButtonLink } from "../form-elements";
import { Tooltip, TooltipRef, useTooltip } from "../tooltip";
// lib
import { API_URL } from "../../lib/constants";
import { splitPathAndQueryString } from "../../lib/query-utils";

/**
 * Display the button to download the current report as a TSV file.
 */
export default function DownloadTSV({ searchUri }) {
  const { queryString } = splitPathAndQueryString(searchUri);
  const link = `${API_URL}/multireport.tsv?${queryString}`;
  const tooltipAttr = useTooltip("download-tsv");

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div>
          <ButtonLink
            href={link}
            label="Download report as TSV"
            className="hidden h-full @lg:flex"
          >
            Download TSV
          </ButtonLink>
          <ButtonLink
            href={link}
            hasIconOnly
            label="Download report as TSV"
            className="h-full @lg:hidden"
          >
            <DocumentArrowDownIcon />
          </ButtonLink>
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>
        Download the report as a TSV file.
      </Tooltip>
    </>
  );
}

DownloadTSV.propTypes = {
  // Search-results path and query string
  searchUri: PropTypes.string.isRequired,
};

// node_modules
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
// components
import SeparatedList from "./separated-list";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";

/**
 * Display a single term with an optional description in a tooltip.
 * @param term - Assay term to display
 * @param description - Optional description to show in a tooltip
 */
function TermWithDescription({
  term,
  description = "",
}: {
  term: string;
  description?: string;
}) {
  const tooltipAttr = useTooltip(`tooltip-${term}`);

  return (
    <span>
      {term}
      {description && (
        <>
          <TooltipRef tooltipAttr={tooltipAttr}>
            <QuestionMarkCircleIcon className="relative top-[-2px] ml-0.5 inline h-5 w-5" />
          </TooltipRef>
          <Tooltip tooltipAttr={tooltipAttr}>
            {description || "No description available."}
          </Tooltip>
        </>
      )}
    </span>
  );
}

/**
 * Display a comma-separated list of assay titles or preferred assay titles, each with an optional
 * description in a tooltip in an icon following each assay title.
 * @param titles - List of assay titles to display
 * @param descriptionMap - Map of assay titles to their descriptions
 */
export function AssayTitles({
  titles,
  descriptionMap = {},
}: {
  titles: string[];
  descriptionMap?: Record<string, string>;
}) {
  const sortedTitles = _.sortBy(titles, (title) => title.toLowerCase());

  return (
    <SeparatedList>
      {sortedTitles.map((title) => (
        <TermWithDescription
          key={title}
          term={title}
          description={descriptionMap[title]}
        />
      ))}
    </SeparatedList>
  );
}

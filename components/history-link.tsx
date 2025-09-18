// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { useContext } from "react";
// components
import { ButtonLink } from "./form-elements";
import SessionContext from "./session-context";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// root
import { DatabaseObject } from "../globals";

/**
 * Display the icon for the button to switch to the history view.
 * @param className - The Tailwind CSS class names to apply to the icon
 */
function HistoryIcon({
  className = "",
  testid = "icon-history",
}: {
  className?: string;
  testid?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path d="M12.9,11.9l-2.2-2.2v-3.2c0-.4-.3-.8-.8-.8s-.8.3-.8.8v3.4s0,0,0,0c0,.2,0,.4.2.6l2.4,2.4c.1.1.3.2.5.2s.4,0,.5-.2c.3-.3.3-.8,0-1.1Z" />
      <path d="M12.2,3.4c-1.9-.6-4-.3-5.7.7l-.8-1.2-2,4,4.5-.3-.9-1.3c1.3-.8,2.9-1,4.4-.5,1.4.4,2.5,1.4,3.2,2.7.7,1.3.8,2.8.4,4.1-.4,1.4-1.4,2.5-2.7,3.2-1.3.7-2.8.8-4.1.4-1.6-.5-2.8-1.7-3.4-3.2l-1.4.5c.8,2,2.4,3.4,4.4,4.1.7.2,1.4.3,2.1.3,2.9,0,5.7-1.9,6.6-4.8,1.2-3.6-.9-7.5-4.5-8.7Z" />
    </svg>
  );
}

/**
 * Display a button that links either to the history view of the object or the normal object view.
 * Use `basePath` as the path to the object, or provide the history object in `item`; not both.
 * @param item - Object to view the history of
 * @param basePath - Base URL of the object, i.e. not including @@history
 */
export function HistoryLink({
  item = null,
  basePath = "",
}: {
  item?: DatabaseObject;
  basePath?: string;
}) {
  const { isAuthenticated } = useAuth0();
  const { sessionProperties } = useContext(SessionContext);
  const tooltipAttr = useTooltip("history-link");

  if (item && basePath) {
    throw new Error("You must provide either an item or a basePath, not both.");
  }

  // Include labels to go to history view of the object or the object itself?
  const isHistoryView = Boolean(item);

  // Must be logged in as admin for this to work. Check both for weird cases where one is null.
  if (isAuthenticated && sessionProperties?.admin) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <div className="flex justify-end">
            <ButtonLink
              label={isHistoryView ? "See object history" : "See object"}
              href={basePath || `${item["@id"]}@@history`}
              type="secondary"
              size="sm"
              hasIconOnly
            >
              <HistoryIcon className="h-6 w-6" />
            </ButtonLink>
          </div>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipAttr}>
          {isHistoryView ? (
            <>View the modification history of this object.</>
          ) : (
            <>View the object page.</>
          )}
        </Tooltip>
      </>
    );
  }
}

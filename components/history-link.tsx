// node_modules
import { useAuth0 } from "@auth0/auth0-react";
// components
import { ButtonLink } from "./form-elements";
// root
import { DatabaseObject } from "../globals";

/**
 * Display the icon for the button to switch to the history view.
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
 * Display a button that links to the page to view `item`, but the history view instead. This
 * normally goes into the object page header.
 * @param item - The object to view the history of.
 */
export function HistoryLink({
  item = null,
  basePath = "",
}: {
  item?: DatabaseObject;
  basePath?: string;
}) {
  const { isAuthenticated } = useAuth0();

  if (item && basePath) {
    throw new Error("You must provide either an item or a basePath, not both.");
  }

  if (isAuthenticated) {
    return (
      <div className="flex justify-end">
        <ButtonLink
          label="See object history"
          href={basePath || `${item["@id"]}@@history`}
          type="secondary"
          size="sm"
          hasIconOnly
        >
          <HistoryIcon className="h-6 w-6" />
        </ButtonLink>
      </div>
    );
  }
}

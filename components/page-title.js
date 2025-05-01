// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import GlobalContext from "./global-context";
import { SecDir } from "./section-directory";

/**
 * Show a standard page title for the top of any page.
 */
export default function PageTitle({
  pageTitle = "",
  className = "",
  sections = null,
  children,
}) {
  const { page } = useContext(GlobalContext);
  const title = pageTitle || page.title;

  return (
    <div
      className={`sticky top-0 z-20 mb-5 border-b border-data-border ${className}`}
    >
      <div className="flex items-end justify-between gap-2 bg-background">
        {title && (
          <h1 className="text-3xl font-medium text-gray-700 dark:text-gray-300">
            {title}
          </h1>
        )}
        {children}
        {sections && <SecDir sections={sections} />}
      </div>
    </div>
  );
}

PageTitle.propTypes = {
  // Page title for pages in which the server doesn't supply one
  pageTitle: PropTypes.string,
  // Displayed in the section directory
  sections: PropTypes.object,
  // Additional Tailwind CSS classes to apply to the title wrapper div
  className: PropTypes.string,
};

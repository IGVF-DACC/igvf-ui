// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import GlobalContext from "./global-context";

/**
 * Show a standard page title for the top of any page.
 */
export default function PageTitle({ pageTitle = "", children }) {
  const { page } = useContext(GlobalContext);

  return (
    <div className="mb-5">
      <h1 className="text-3xl font-medium text-gray-700 dark:text-gray-300">
        {pageTitle || page.title}
      </h1>
      {children}
    </div>
  );
}

PageTitle.propTypes = {
  // Page title for pages in which the server doesn't supply one
  pageTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

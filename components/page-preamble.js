// node_modules
import PropTypes from "prop-types";
// components
import PageTitle from "./page-title";
import SiteTitle from "./site-title";

/**
 * Put this at the top of any page that needs a tab title and a page title.
 */
export default function PagePreamble({
  pageTitle = "",
  sections,
  children = null,
}) {
  return (
    <>
      <SiteTitle pageTitle={pageTitle} />
      <PageTitle pageTitle={pageTitle} sections={sections}>
        {children}
      </PageTitle>
    </>
  );
}

PagePreamble.propTypes = {
  // Page title for pages in which the server doesn't supply one
  pageTitle: PropTypes.string,
  // Displayed in the section directory
  sections: PropTypes.object,
};

// node_modules
import PropTypes from "prop-types";
// lib
import buildBreadcrumbs from "../lib/breadcrumbs";
import errorObjectToProps from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
// components
import { AddableItem } from "../components/add";
import { DataPanel } from "../components/data-area";
import Page from "../components/page";
import PagePreamble from "../components/page-preamble";

/**
 * Extract a reasonable title from a collection or object.
 * @param {object} generic - Generic object or collection
 * @returns {string} Reasonable name extracted from generic object
 */
const extractTitle = (generic) => {
  return generic.accession || generic.title || generic.name || generic["@id"];
};

/**
 * Displays the JSON of the specified object or collection for any object or collection that
 * doesn't have a page defined in the NextJS router.
 */
const FallbackObject = ({
  generic = null,
  awards = null,
  labs = null,
  pages = null,
}) => {
  if (generic) {
    // Pages get displayed as markdown.
    if (generic["@type"].includes("Page")) {
      return <Page page={generic} awards={awards} labs={labs} pages={pages} />;
    }

    // Rendering an individual object as JSON.
    return (
      <>
        <PagePreamble />
        <AddableItem collection={generic}>
          <DataPanel>
            <div className="overflow-x-auto border border-gray-300 bg-gray-100 text-xs dark:border-gray-800 dark:bg-gray-900">
              <pre className="p-1">{JSON.stringify(generic, null, 4)}</pre>
            </div>
          </DataPanel>
        </AddableItem>
      </>
    );
  }
  return null;
};

FallbackObject.propTypes = {
  // Any object which doesn't have a page defined.
  generic: PropTypes.object,
  // Collection of all awards; only for Page type objects
  awards: PropTypes.arrayOf(PropTypes.object),
  // Collection of all labs; only for Page type objects
  labs: PropTypes.arrayOf(PropTypes.object),
  // Collection of all pages; only for Page type objects
  pages: PropTypes.arrayOf(PropTypes.object),
};

export default FallbackObject;

export const getServerSideProps = async ({ req, resolvedUrl }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const generic = await request.getObject(resolvedUrl);
  if (FetchRequest.isResponseSuccess(generic)) {
    let awards = null;
    let labs = null;
    let pages = null;
    let breadcrumbs = null;
    if (generic["@type"].includes("Page")) {
      // For objects with type 'Page', also get extra data needed for editing the page.
      awards = await request.getCollection("awards");
      labs = await request.getCollection("labs");
      pages = await request.getCollection("pages");
      breadcrumbs = await buildBreadcrumbs(
        generic,
        "title",
        req.headers.cookie
      );
    }
    return {
      props: {
        generic,
        awards: awards ? awards["@graph"] : null,
        labs: labs ? labs["@graph"] : null,
        pages: pages ? pages["@graph"] : null,
        pageContext: { title: extractTitle(generic) },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(generic);
};

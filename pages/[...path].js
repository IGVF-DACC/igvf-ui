// node_modules
import PropTypes from "prop-types";
// lib
import buildAttribution from "../lib/attribution";
import buildBreadcrumbs from "../lib/breadcrumbs";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { isJsonFormat } from "../lib/query-utils";
// components
import { AddableItem } from "../components/add";
import Breadcrumbs from "../components/breadcrumbs";
import { EditableItem } from "../components/edit";
import JsonDisplay from "../components/json-display";
import JsonPanel from "../components/json-panel";
import ObjectPageHeader from "../components/object-page-header";
import Page from "../components/page";
import PagePreamble from "../components/page-preamble";
import UnknownTypePanel from "../components/unknown-type-panel";

/**
 * Extract a reasonable title from a collection or object.
 * @param {object} generic - Generic object or collection
 * @returns {string} Reasonable name extracted from generic object
 */
function extractTitle(generic) {
  return (
    generic.accession || generic.title || generic.name || generic["@id"] || ""
  );
}

/**
 * Displays the JSON of the specified object or collection for any object or collection that
 * doesn't have a page defined in the NextJS router.
 */
export default function FallbackObject({
  generic = null,
  awards = null,
  labs = null,
  pages = null,
  attribution = null,
  isJson = false,
}) {
  if (generic) {
    // Pages get displayed as markdown.
    if (generic["@type"].includes("Page")) {
      return <Page page={generic} awards={awards} labs={labs} pages={pages} />;
    }

    // Display collection and search pages as JSON. This case also covers adding new objects.
    if (
      generic["@type"].includes("Collection") ||
      generic["@type"].includes("Search")
    ) {
      return (
        <>
          <PagePreamble />
          <AddableItem collection={generic}>
            <JsonPanel>{JSON.stringify(generic, null, 4)}</JsonPanel>
          </AddableItem>
        </>
      );
    }

    // Render an individual object as a generated formatted page.
    return (
      <>
        <Breadcrumbs />
        <EditableItem item={generic}>
          <PagePreamble />
          <ObjectPageHeader item={generic} isJsonFormat={isJson} />
          <JsonDisplay item={generic} isJsonFormat={isJson}>
            <UnknownTypePanel item={generic} attribution={attribution} />
          </JsonDisplay>
        </EditableItem>
      </>
    );
  }
  return null;
}

FallbackObject.propTypes = {
  // Any object which doesn't have a page defined.
  generic: PropTypes.object,
  // Collection of all awards; only for Page type objects
  awards: PropTypes.arrayOf(PropTypes.object),
  // Collection of all labs; only for Page type objects
  labs: PropTypes.arrayOf(PropTypes.object),
  // Collection of all pages; only for Page type objects
  pages: PropTypes.arrayOf(PropTypes.object),
  // Attribution objects for the generic object
  attribution: PropTypes.object,
  // True if the page should render as JSON
  isJson: PropTypes.bool,
};

export async function getServerSideProps({ req, resolvedUrl, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const generic = (await request.getObject(resolvedUrl)).union();
  if (FetchRequest.isResponseSuccess(generic)) {
    let awards = null;
    let labs = null;
    let pages = null;
    let breadcrumbs = null;
    if (generic["@type"].includes("Page")) {
      // For objects with type 'Page', also get extra data needed for editing the page.
      awards = (await request.getCollection("awards"))
        .map((c) => c["@graph"])
        .optional();
      labs = (await request.getCollection("labs"))
        .map((c) => c["@graph"])
        .optional();
      pages = (await request.getCollection("pages"))
        .map((c) => c["@graph"])
        .optional();
      breadcrumbs = await buildBreadcrumbs(
        generic,
        "title",
        req.headers.cookie
      );
    }
    const attribution = await buildAttribution(generic, req.headers.cookie);
    return {
      props: {
        generic,
        awards,
        labs,
        pages,
        attribution,
        pageContext: { title: extractTitle(generic) },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(generic);
}

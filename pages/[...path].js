// node_modules
import PropTypes from "prop-types";
// lib
import errorObjectToProps from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
// components
import {
  Collection,
  CollectionItem,
  CollectionItemName,
} from "../components/collection";
import { DataPanel } from "../components/data-area";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";

/**
 * Extract a reasonable title from a collection or object.
 * @param {object} generic - Generic object or collection
 * @returns {string} Reasonable name extracted from generic object
 */
const extractTitle = (generic) => {
  return generic.accession || generic.name || generic.title || generic["@id"];
};

const FallbackCollection = ({ collection }) => {
  return (
    <>
      <PagePreamble />
      <Collection>
        {collection.length > 0 ? (
          collection.map((item) => (
            <CollectionItem
              key={item.uuid}
              testid={item.uuid}
              href={item["@id"]}
            >
              <CollectionItemName>{extractTitle(item)}</CollectionItemName>
            </CollectionItem>
          ))
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

FallbackCollection.propTypes = {
  // @graph of collection object to display
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Displays the JSON of the specified object or collection for any object or collection that
 * doesn't have a page defined in the NextJS router.
 */
const FallbackObject = ({ generic = null }) => {
  if (generic) {
    // Collections get displayed as a semi-formatted list linking to their objects.
    if (generic["@type"].includes("Collection")) {
      return <FallbackCollection collection={generic["@graph"]} />;
    }

    // Rendering an individual object as JSON.
    return (
      <>
        <PagePreamble pageTitle={extractTitle(generic)} />
        <DataPanel>
          <div className="overflow-x-auto border border-gray-300 bg-gray-100 text-xs dark:border-gray-800 dark:bg-gray-900">
            <pre className="p-1">{JSON.stringify(generic, null, 4)}</pre>
          </div>
        </DataPanel>
      </>
    );
  }
  return null;
};

FallbackObject.propTypes = {
  // Any object which doesn't have a page defined.
  generic: PropTypes.object,
};

export default FallbackObject;

export const getServerSideProps = async ({ req, resolvedUrl }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const generic = await request.getObject(resolvedUrl);
  if (FetchRequest.isResponseSuccess(generic)) {
    return {
      props: {
        generic,
      },
    };
  }
  return errorObjectToProps(generic);
};

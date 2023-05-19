// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemMain,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

/**
 * When you add a new renderer for a search-list item `@type`, likely in its own file in this
 * directory, import it here and add it to the `renderers` object below so that
 * `getSearchListItemRenderer` can find it. Keep the imports in alphabetical order by file name,
 * and the `renderers` object in alphabetical order by React component name so we can easily find
 * them visually.
 *
 * Some search-list item types display data not available in the search results, so we need to
 * request that data from the server. For these, you can add the `getAccessoryDataPaths` function
 * as a property of the renderer component function. This function should return an array of
 * `@id`s for the data you need to display. The `generateAccessoryDataPropertyMap` function will
 * then generate a map of `@id`s to property names, which you can use to look up the data in the
 * `accessoryData` prop passed to the renderer.
 *
 * This is the root file with utility functions to handle both search-list renderers and accessory
 * data-path generators, as the latter relies on the former.
 */
import AnalysisSet from "./analysis-set";
import Award from "./award";
import Biomarker from "./biomarker";
import Biosample from "./biosample";
import CuratedSet from "./curated-set";
import Document from "./document";
import Gene from "./gene";
import HumanDonor from "./human-donor";
import Lab from "./lab";
import MeasurementSet from "./measurement-set";
import OntologyTerm from "./ontology-term";
import Page from "./page";
import Publication from "./publication";
import RodentDonor from "./rodent-donor";
import Software from "./software";
import SoftwareVersion from "./software-version";
import TechnicalSample from "./technical-sample";
import Treatment from "./treatment";
import User from "./user";
import File from "./file";
import Source from "./source";
import HumanGenomicVariant from "./human-genomic-variant";

const renderers = {
  AnalysisSet,
  AssayTerm: OntologyTerm,
  Award,
  Biomarker,
  CuratedSet,
  Document,
  Gene,
  HumanDonor,
  HumanGenomicVariant,
  InVitroSystem: Biosample,
  Lab,
  MeasurementSet,
  Page,
  PhenotypeTerm: OntologyTerm,
  PlatformTerm: OntologyTerm,
  PrimaryCell: Biosample,
  Publication,
  ReferenceFile: File,
  RodentDonor,
  SampleTerm: OntologyTerm,
  SequenceFile: File,
  SignalFile: File,
  Software,
  SoftwareVersion,
  Source,
  TechnicalSample,
  Tissue: Biosample,
  Treatment,
  User,
  WholeOrganism: Biosample,
};

/**
 * Search-list renderer for search-result items that don't have a specific renderer.
 */
export function Fallback({ item }) {
  const title =
    item.accession ||
    item.title ||
    item.name ||
    item.description ||
    item["@id"];
  return (
    <>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={item} />
          {item["@id"]}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{title}</SearchListItemTitle>
      </SearchListItemMain>
    </>
  );
}

Fallback.propTypes = {
  // Single search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};

/**
 * Get the `@type` that an existing search-list renderer handles for the given item. If no `@type`
 * in `item` has a corresponding renderer, return null. This lets us get a renderer for an item's
 * parent `@type` if no renderer exists for the item's specific `@type`.
 * @param {object} item Object with `@type` property to look up in registry
 * @returns {string} `@type` from `item` that a search-list renderer handles
 */
function getItemRendererType(item) {
  const matchingType = item["@type"].find((itemType) => renderers[itemType]);
  return matchingType || null;
}

/**
 * Look up the React component to render the given `item` based on the `@type` of the object. The
 * first `@type` element matching a key in the given registry returns the corresponding React
 * component to render that item. If no renderer exists for any of the item's `@type`, return the
 * `Fallback` component to render the item generically.
 * @param {object} item Object with `@type` property to look up in registry
 * @returns {React.Component} React component to render the given item
 */
export function getSearchListItemRenderer(item) {
  const itemType = getItemRendererType(item);
  return itemType ? renderers[itemType] : Fallback;
}

/**
 * Get the accessory data-paths generator function for the given item type. If no paths generator
 * function exists for the given item type, null gets returned. Assume the given type has a
 * specific renderer, so no need to check for that.
 * @param {string} itemType Item @type to look up in registry
 * @returns {function} Function to retrieve accessory data paths for the given item type
 */
function getAccessoryDataPathsGenerator(itemType) {
  const renderer = renderers[itemType];
  return renderer.getAccessoryDataPaths || null;
}

/**
 * For all item types that have an accessory data-paths generator function, call that function
 * with all the search-result items of that type to get the paths to all the items we need to
 * retrieve for that type. Then concatenate all the paths from all the search-result item types
 * into one array, deduplicated.
 * @param {object} itemListsByType Search-result items keyed by item type
 * @returns {array} Array of unique accessory data paths
 */
export function getAccessoryDataPaths(itemListsByType) {
  // For each item type, get its accessory data paths generator function, if any. Pass that
  // function the list of items of that type, and concatenate all the paths from all the item
  // types into one array.
  const accessoryDataPaths = Object.keys(itemListsByType).reduce(
    (paths, itemType) => {
      const accessoryDataPathGenerator =
        getAccessoryDataPathsGenerator(itemType);
      if (accessoryDataPathGenerator) {
        const dataPathsForType = accessoryDataPathGenerator(
          itemListsByType[itemType]
        );

        // Add the paths for the objects for one type to the paths for all the other types.
        return paths.concat(dataPathsForType);
      }

      // No accessory data path generator for this type, so just return the paths we've collected
      // so far.
      return paths;
    },
    []
  );

  // Deduplicate the paths to all the accessory data objects we need to retrieve from igvfd.
  return [...new Set(accessoryDataPaths)];
}

/**
 * Once you have all the requested objects for a property within each search-result item, generate a
 * map of those objects keyed by @id. For example:
 * ```
 * [
 *   {
 *     "@id": "/terms/ENCODE:0009897/",
 *     "term_id": "ENCODE:0009897",
 *   },
 *   {
 *     "@id": "/terms/ENCODE:0009898/",
 *     "term_id": "ENCODE:0009898",
 *   },
 * ]
 * ```
 * becomes:
 * ```
 * {
 *   "/terms/ENCODE:0009897/": {
 *     "@id": "/terms/ENCODE:0009897/",
 *     "term_id": "ENCODE:0009897",
 *   },
 *   "/terms/ENCODE:0009898/": {
 *     "@id": "/terms/ENCODE:0009898/",
 *     "term_id": "ENCODE:0009898",
 *   },
 * }
 * ```
 * @param {array.objects} propertyObjects Objects for a single property of search result items
 * @returns {object} Map of property objects keyed by `@id`
 */
export function generateAccessoryDataPropertyMap(propertyObjects) {
  return propertyObjects.reduce(
    (map, term) => ({ ...map, [term["@id"]]: term }),
    {}
  );
}

/**
 * Get an array of unique item @types from the search-result items. Only the types that have a
 * corresponding renderer get included in the array.
 * @param {object} searchResults Search results from igvfd
 * @returns {array} Array of unique item types in the search-result items
 */
function getRenderableItemTypes(searchResults) {
  return searchResults["@graph"].reduce((itemTypesAcc, item) => {
    const itemType = getItemRendererType(item);

    // Add the new item type to the accumulator if it isn't already there.
    return itemType && !itemTypesAcc.includes(itemType)
      ? itemTypesAcc.concat(itemType)
      : itemTypesAcc;
  }, []);
}

/**
 * Generate lists of search-result items by item type, generating an object with each item type in
 * the search results as keys. Under each key is an array of search-result items of that type, i.e.:
 * ```
 * {
 *   "PrimaryCell": [primary-cell-item-1, primary-cell-item-2, primary-cell-item-3],
 *   "Tissue": [tissue-item-1, tissue-item-2],
 * }
 * ```
 * @param {object} searchResults Search results from igvfd
 * @param {array.string} itemTypes @types found in search results
 * @returns {object} Object with item types as keys and arrays of search-result items as values
 */
export function getItemListsByType(searchResults) {
  const itemTypes = getRenderableItemTypes(searchResults);
  return itemTypes.reduce((itemListsByTypeAcc, itemType) => {
    itemListsByTypeAcc[itemType] = searchResults["@graph"].filter(
      (item) => item["@type"][0] === itemType
    );
    return itemListsByTypeAcc;
  }, {});
}

// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemMain,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// lib
import FetchRequest from "../../../lib/fetch-request";

/**
 * When you add a new renderer for a search-list item `@type`, likely in its own file in this
 * directory, import it here and add it to the `renderers` object below so that
 * `getSearchListItemRenderer` can find it. Keep the imports in alphabetical order by file name,
 * and the `renderers` object in alphabetical order by React component name so we can easily find
 * them visually.
 *
 * Some search-list item types display data not available in the search results, so we need to
 * request that data from the server. For these, add the `getAccessoryDataPaths` function as a
 * property of the renderer component function. This function returns an array of objects that
 * indicates the paths to the data to retrieve, and the fields to retrieve for each path. For
 * example:
 * ```
 * [
 *   {
 *     type: "OntologyTerm",
 *     paths: [
 *       "/terms/ENCODE:0009897/",
 *       "/terms/ENCODE:0009898/",
 *     ],
 *     fields: [
 *       "term_id",
 *     ],
 *   },
 * ]
 * ```
 * The `type` property contains the `@type` of the data to retrieve. The `paths` property contains
 * an array of paths to the data to retrieve. The `fields` property contains an array of property
 * names to retrieve from the objects at each path. Each object in this array represents a
 * different `@type` of data to retrieve, so don't combine the paths of multiple types of objects
 * into one object of this array. You can return duplicate paths in the `paths` array as they get
 * deduplicated later, but the `paths` array should not contain any null or undefined values.
 *
 * The `getAccessoryDataPaths` function gets called with a homogeneous array of search-result items
 * matching the `@type` of object its renderer handles -- search results of other types get
 * filtered out and passed to renderers for those types.
 */
import AnalysisSet from "./analysis-set";
import AnalysisStep from "./analysis-step";
import Award from "./award";
import AuxiliarySet from "./auxiliary-set";
import Biomarker from "./biomarker";
import Biosample from "./biosample";
import ConstructLibrarySet from "./construct-library-set";
import CrisprModification from "./crispr-modification";
import DegronModification from "./degron-modification";
import CuratedSet from "./curated-set";
import Document from "./document";
import Gene from "./gene";
import HumanDonor from "./human-donor";
import ImageItem from "./image";
import IndexFile from "./index-file";
import InstitutionalCertificate from "./institutional-certificate";
import Lab from "./lab";
import MeasurementSet from "./measurement-set";
import MultiplexedSample from "./multiplexed-sample";
import ModelSet from "./model-set";
import OntologyTerm from "./ontology-term";
import OpenReadingFrame from "./open-reading-frame";
import Page from "./page";
import PhenotypicFeature from "./phenotypic-feature";
import PredictionSet from "./prediction-set";
import Publication from "./publication";
import RodentDonor from "./rodent-donor";
import Software from "./software";
import SoftwareVersion from "./software-version";
import TechnicalSample from "./technical-sample";
import Treatment from "./treatment";
import User from "./user";
import File from "./file";
import Source from "./source";
import Workflow from "./workflow";

const renderers = {
  AlignmentFile: File,
  AnalysisSet,
  AnalysisStep,
  AssayTerm: OntologyTerm,
  AuxiliarySet,
  Award,
  Biomarker,
  ConfigurationFile: File,
  ConstructLibrarySet,
  CrisprModification,
  DegronModification,
  CuratedSet,
  Document,
  Gene,
  HumanDonor,
  Image: ImageItem,
  ImageFile: File,
  IndexFile,
  InstitutionalCertificate,
  InVitroSystem: Biosample,
  Lab,
  MatrixFile: File,
  MeasurementSet,
  ModelFile: File,
  ModelSet,
  MultiplexedSample,
  OpenReadingFrame,
  Page,
  PhenotypeTerm: OntologyTerm,
  PhenotypicFeature,
  PlatformTerm: OntologyTerm,
  PredictionSet,
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
  TabularFile: File,
  TechnicalSample,
  Tissue: Biosample,
  Treatment,
  User,
  WholeOrganism: Biosample,
  Workflow,
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
  return renderer?.getAccessoryDataPaths || null;
}

/**
 * For all item types that have an accessory data-paths generator function, call that function
 * with all the search-result items of that type to get the paths to all the items we need to
 * retrieve for that type, as well as the fields (properties) for each object of that type. Then
 * generate an object keyed by item type, with each value an object containing the paths and fields
 * for that type. For example:
 * ```
 * {
 *   OntologyTerm: {
 *     paths: [
 *       "/terms/ENCODE:0009897/",
 *       "/terms/ENCODE:0009898/",
 *     ],
 *     fields: [
 *       "term_id",
 *     ],
 *   },
 *   Biosample: {
 *     paths: [
 *       "/biosamples/ENCBS000AAA/",
 *     ],
 *     fields: [
 *       "accession",
 *       "biosample_ontology.term_id",
 *     ],
 *   },
 * }
 * ```
 * concatenate all the paths and fields from all the search-result items each type and deduplicate
 * the paths.
 * @param {object} itemListsByType Search-result items keyed by item type
 * @returns {array} Array of unique accessory data paths
 */
export function getAccessoryDataPaths(itemListsByType) {
  // For each item type, get its accessory data paths generator function, if any. Pass that
  // function the list of items of that type, and concatenate all the resulting paths and fields
  // that we'll request from the data provider into one array.
  const accessoryDataPathsAndFields = Object.keys(itemListsByType).reduce(
    (pathsAndFieldsForType, itemType) => {
      const accessoryDataPathGenerator =
        getAccessoryDataPathsGenerator(itemType);
      if (accessoryDataPathGenerator) {
        const pathsAndFields = accessoryDataPathGenerator(
          itemListsByType[itemType]
        );

        // Add the requested paths and fields for the objects for one type to the requested paths
        // and fields for all the other types.
        return pathsAndFieldsForType.concat(pathsAndFields);
      }

      // No accessory data path generator for this type, so just return the paths we've collected
      // so far.
      return pathsAndFieldsForType;
    },
    []
  );

  // We now have an array of objects, each containing the type of object to request from the data
  // provider, an array of paths to request for that type, and an array of fields to request for
  // each path of that type. Combine all these into an array described in the comment for this
  // function.
  return accessoryDataPathsAndFields.reduce(
    (pathsAndFieldsAcc, { type, paths, fields }) => {
      const pathsAndFields = pathsAndFieldsAcc[type] || {
        paths: [],
        fields: [],
      };
      return {
        ...pathsAndFieldsAcc,
        [type]: {
          paths: [...new Set(pathsAndFields.paths.concat(paths))],
          fields: [...new Set(pathsAndFields.fields.concat(fields))],
        },
      };
    },
    {}
  );
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

/**
 * Retrieve all needed accessory data for search results. Each search result item type might have
 * an accessory data path retrieval function. If so, call it and return the results. Remember that
 * the search results can contain a mix of item types, so this could get different accessory data
 * for each search result. null gets returned if no accessory data is needed.
 * @param {object} itemListsByType Search-result items keyed by item type
 * @param {string} cookie Browser cookie for request authentication
 */
export async function getAccessoryData(itemListsByType, cookie) {
  if (Object.keys(itemListsByType).length > 0) {
    const accessoryDataPaths = getAccessoryDataPaths(itemListsByType);
    const accessoryDataTypes = Object.keys(accessoryDataPaths);
    if (accessoryDataTypes.length > 0) {
      const requests = accessoryDataTypes.map(async (type) => {
        // Get the objects for this type. Any network errors get returned as an empty array.
        const request = new FetchRequest({ cookie });
        const objects = (
          await request.getMultipleObjectsBulk(
            accessoryDataPaths[type].paths,
            accessoryDataPaths[type].fields
          )
        ).unwrap_or([]);

        // Return an object with the objects retrieved for a type, as well as the type to help
        // identify the objects when debugging. The type otherwise doesn't get used.
        return { type, objects };
      });

      // Send all the requests at once and wait for them all to complete.
      const accessoryDataList = await Promise.all(requests);

      // Generate a map of all the accessory data objects keyed by @id.
      if (accessoryDataList.length > 0) {
        const accessoryData = accessoryDataList.reduce(
          (accessoryDataAcc, { objects }) => {
            const propertyMap = generateAccessoryDataPropertyMap(objects);
            return { ...accessoryDataAcc, ...propertyMap };
          },
          {}
        );

        // Return the accessory data map.
        return accessoryData;
      }
    }
  }
  return null;
}

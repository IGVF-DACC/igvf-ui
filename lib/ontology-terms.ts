// lib
import FetchRequest from "./fetch-request";
import { extractSchema } from "./profiles";
// root
import {
  DatabaseObject,
  FileSetObject,
  OntologyTermObject,
  Profiles,
} from "../globals";

export interface AssayTermObject extends DatabaseObject {
  ancestors?: string[];
  assay_slims?: string[];
  category_slims?: string[];
  comments?: string[];
  definition?: string;
  deprecated_ntr_terms?: string[];
  description?: string;
  is_a?: string[] | DatabaseObject[];
  name?: string;
  notes?: string[];
  objective_slims?: string[];
  ontology?: string;
  preferred_assay_titles?: string[];
  synonyms?: string[];
  term_id: string;
  term_name: string;
}

/**
 * Fetch assay term descriptions for a list of assay titles. The assay titles often come from the
 * `assay_titles` property of file sets. The returned object maps assay titles to their
 * corresponding descriptions.
 * @param titles - Assay titles to fetch descriptions for
 * @param request - FetchRequest instance to make the API call
 * @returns Map of assay titles to their descriptions
 */
export async function getAssayTitleDescriptionMap(
  titles: string[],
  request: FetchRequest
): Promise<Record<string, string>> {
  if (titles.length > 0) {
    // Retrieve assay term objects corresponding to the given titles.
    const assayTermObjects = (
      await request.getMultipleObjectsBySearch(
        "AssayTerm",
        ["term_name", "definition"],
        {
          property: "term_name",
          values: titles,
        }
      )
    ).unwrap_or([]) as OntologyTermObject[];

    // Build the map of assay term names to their definitions from the fetched assay ontology term
    // objects.
    const assayTermMap: { [key: string]: string } = {};
    for (const term of assayTermObjects) {
      assayTermMap[term.term_name] = term.definition || "";
    }
    return assayTermMap;
  }
  return {};
}

/**
 * Given the object retrieved from `/profiles` extract the map of preferred assay titles to their
 * corresponding descriptions. If `/profiles` hasn't yet loaded or something odd happened with its
 * contents, this function returns an empty object.
 * @param profiles - Profiles object containing all schema definitions
 * @returns Map of preferred assay titles to their descriptions
 */
export function getPreferredAssayTitleDescriptionMap(
  profiles?: Profiles
): Record<string, string> {
  const measurementSetSchema = profiles
    ? extractSchema(profiles, "MeasurementSet")
    : undefined;
  return (
    measurementSetSchema?.properties?.preferred_assay_titles?.items
      ?.enum_descriptions || {}
  );
}

/**
 * Fetch the assay term at the path provided, which is typically the `@id` of the assay term object,
 * and return its description from its `definition` property.
 * @param assayTermPath - Path (normally from `@id`) to the assay term object
 * @param request - FetchRequest instance to make the fetch request
 * @returns Description of the assay term; empty string if error occurs or definition not available
 */
export async function getAssayTitleDescription(
  assayTermPath: string,
  request: FetchRequest
): Promise<string> {
  const response = (
    await request.getObject(assayTermPath)
  ).optional() as OntologyTermObject;
  return response?.definition || "";
}

/**
 * Fetch assay term description map for a measurement set. Measurement sets always have zero or one
 * assay terms, so this function returns a map with a single entry if the assay term exists. If no
 * assay term exists, or if loading the measurement set's assay term object fails, this function
 * returns an empty object.
 * @param measurementSet - Measurement set object to generate a description map for
 * @param request - FetchRequest instance to make the fetch request
 * @returns Map of assay titles to their descriptions; empty object if no assay term exists
 */
export async function getMeasurementSetAssayTitleDescriptionMap(
  measurementSet: FileSetObject,
  request: FetchRequest
): Promise<Record<string, string>> {
  if (
    measurementSet.assay_term &&
    typeof measurementSet.assay_term === "object" &&
    measurementSet.assay_titles?.length > 0
  ) {
    const assayTermDescription = await getAssayTitleDescription(
      measurementSet.assay_term["@id"],
      request
    );
    return {
      [measurementSet.assay_titles[0]]: assayTermDescription,
    };
  }
  return {};
}

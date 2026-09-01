// node_modules
import _ from "lodash";
// lib
import { pathsFromDatabaseObjects } from "./database-object";
import { type PredictionSetObject } from "./file-sets";
import { extractSchema } from "./profiles";
// root
import type {
  Profiles,
  SoftwareObject,
  SoftwareVersionObject,
} from "../globals";

/**
 * Represents a section of software grouped by a specific file set type.
 *
 * @property fileSetType - `fileSetType` property from a prediction set object
 * @property software - Software objects associated with the file set type
 * @property unfilteredSoftwareCount - Total number of software items in the section before
 *                                     filtering
 */
export type FileSetTypeSections = {
  fileSetType: string;
  software: SoftwareObject[];
  unfilteredSoftwareCount: number;
};

/**
 * Filters the software items within each file set type section based on the provided filter text.
 * Only software items whose title or description includes the filter text will be included in the
 * result. This could leave some file set type sections with no software items if none of their
 * software items match the filter text.
 *
 * @param fileSetTypeSections - File set type sections to filter
 * @param filterText - Text to filter software items by; already lowercased
 * @returns Filtered array of file set type sections with software items matching the filter text
 */
export function filterSoftwareByText(
  fileSetTypeSections: FileSetTypeSections[],
  filterText: string
): FileSetTypeSections[] {
  return fileSetTypeSections.map(
    ({ fileSetType, software, unfilteredSoftwareCount }) => ({
      fileSetType,
      software: software.filter(
        (softwareItem) =>
          softwareItem.title.toLowerCase().includes(filterText) ||
          softwareItem.description.toLowerCase().includes(filterText)
      ),
      unfilteredSoftwareCount,
    })
  );
}

/**
 * Generates an array of objects, each containing a file set type and its associated unique software
 * objects. The resulting array is sorted alphabetically by file set type, and the software objects
 * within each file set type are sorted alphabetically by their title. The rendering loop then
 * iterates over this array to display the software grouped by their associated file set types.
 *
 * @param predictionSets - Prediction set objects to be grouped by file set type
 * @param softwareVersions - Software version objects associated with the prediction sets
 * @param softwareList - Software objects corresponding to the software versions
 * @returns An array of objects, each containing a file set type and its associated unique software
 *          objects, sorted alphabetically by file set type and software title.
 */
export function groupSoftwareByFileSetType(
  predictionSets: PredictionSetObject[],
  softwareVersions: SoftwareVersionObject[],
  softwareList: SoftwareObject[]
): FileSetTypeSections[] {
  const softwareVersionsByPath = new Map(
    softwareVersions.map((softwareVersion) => [
      softwareVersion["@id"],
      softwareVersion,
    ])
  );
  const softwareByPath = new Map(
    softwareList.map((softwareItem) => [softwareItem["@id"], softwareItem])
  );

  return Object.entries(_.groupBy(predictionSets, "file_set_type"))
    .map(([fileSetType, predictionSetsForType]) => {
      // Extract all unique software paths associated with the prediction sets of this file set
      // type.
      const softwarePaths = new Set(
        predictionSetsForType.flatMap((predictionSet) =>
          // Get all software version paths associated with this prediction set and then
          // map them to their corresponding software paths.
          pathsFromDatabaseObjects(predictionSet.software_versions).flatMap(
            (softwareVersionPath) => {
              const softwareVersion =
                softwareVersionsByPath.get(softwareVersionPath);
              return softwareVersion
                ? pathsFromDatabaseObjects([softwareVersion.software])
                : [];
            }
          )
        )
      );

      // Retrieve the software objects corresponding to the unique software paths for this file set
      // type, sorted alphabetically by their title, ignoring case sensitivity.
      const softwareForType = [...softwarePaths]
        .map((softwarePath) => softwareByPath.get(softwarePath))
        .filter((softwareItem) => softwareItem !== undefined)
        .sort((a, b) =>
          a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
        );

      // Return the file set type and its associated unique software for rendering in the UI.
      return {
        fileSetType,
        software: softwareForType,
        unfilteredSoftwareCount: softwareForType.length,
      };
    })
    .filter(({ software }) => software.length > 0)
    .sort((a, b) =>
      // Sort the sections alphabetically by their file set type, ignoring case sensitivity.
      a.fileSetType.localeCompare(b.fileSetType, undefined, {
        sensitivity: "base",
      })
    );
}

/**
 * Get the descriptions for each file set type from the prediction-set schema.
 *
 * @param profiles - `/profiles` object from session context
 * @return Map of file set type to their descriptions
 */
export function getFileSetTypeDescriptions(
  profiles: Profiles
): Record<string, string> {
  const predictionSetSchema = extractSchema(profiles, "PredictionSet");
  const fileSetTypeProperty = predictionSetSchema?.properties?.file_set_type;
  return fileSetTypeProperty?.enum_descriptions ?? {};
}

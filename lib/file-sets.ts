// lib
import {
  requestDonors,
  requestFileSets,
  requestPublications,
  requestSamples,
} from "./common-requests";
import {
  isDatabaseObjectArray,
  pathsFromDatabaseObjects,
} from "./database-object";
import FetchRequest from "./fetch-request";
import { type SampleObject } from "./samples";
// root
import type { DonorObject, FileSetObject, PublicationObject } from "../globals";

/**
 * Given an array of file sets, retrieve all associated file sets from a specified property of those
 * file sets.
 *
 * @param fileSets - Array of file set objects from which to retrieve associated file sets
 * @param fileSetProperty - File-set property name that contains the associated file sets
 * @param request - FetchRequest instance to use for retrieving database objects
 * @param addedProperties - Additional properties to include in the request
 * @returns Array of associated file set objects
 */
export async function requestAssociatedFileSets(
  fileSets: FileSetObject[],
  fileSetProperty: string,
  request: FetchRequest,
  addedProperties: string[] = []
): Promise<FileSetObject[]> {
  if (!isDatabaseObjectArray(fileSets)) {
    return [];
  }

  const uniquePaths = [
    ...new Set(
      fileSets.flatMap((fileSet) =>
        pathsFromDatabaseObjects(fileSet[fileSetProperty])
      )
    ),
  ];

  return uniquePaths.length > 0
    ? await requestFileSets(uniquePaths, request, addedProperties)
    : [];
}

/**
 * Given a file set, request donor objects from the file set's `donors` property, which can contain
 * either paths to donor objects or partial embedded donor objects. If they're embedded, use this
 * function if you need to retrieve the full donor objects.
 *
 * @param fileSet - File set from which to retrieve linked donor objects
 * @param request - FetchRequest instance to use for retrieving donor objects
 * @returns Array of donor objects referenced by the file set's `donors` property
 */
export async function requestFileSetDonors(
  fileSet: FileSetObject,
  request: FetchRequest
): Promise<DonorObject[]> {
  const donorPaths = pathsFromDatabaseObjects(fileSet.donors);
  return donorPaths.length > 0 ? await requestDonors(donorPaths, request) : [];
}

/**
 * Given a file set, request publication objects from the file set's `publications` property. The
 * `publications` property can contain either paths to publication objects or partial embedded
 * publication objects. If they're embedded, use this function if you need to retrieve the full
 * publication objects.
 *
 * @param fileSet - File set from which to retrieve publications
 * @param request - FetchRequest instance to use for retrieving publication objects
 * @returns Array of publication objects from the file set's `publications` property
 */
export async function requestFileSetPublications(
  fileSet: FileSetObject,
  request: FetchRequest
): Promise<PublicationObject[]> {
  const publicationPaths = pathsFromDatabaseObjects(fileSet.publications);
  return publicationPaths.length > 0
    ? await requestPublications(publicationPaths, request)
    : [];
}

/**
 * Retrieve all sample objects from every file set's `samples` properties. The `fileSets` array
 * must contain fully or partially embedded file-set objects. The `samples` property of each file
 * set should contain partially embedded sample objects or paths to sample objects. For that case,
 * use this function to retrieve the full sample objects.
 *
 * @param fileSets - File sets from which to retrieve sample objects
 * @param request - FetchRequest instance to use for retrieving sample objects
 * @returns Sample objects referenced by all given file sets
 */
export async function requestFileSetSamples(
  fileSets: FileSetObject[],
  request: FetchRequest
): Promise<SampleObject[]> {
  if (!isDatabaseObjectArray(fileSets)) {
    return [];
  }

  const uniquePaths = [
    ...new Set(
      fileSets.flatMap((fileSet) => pathsFromDatabaseObjects(fileSet.samples))
    ),
  ];

  return uniquePaths.length > 0
    ? await requestSamples(uniquePaths, request)
    : [];
}

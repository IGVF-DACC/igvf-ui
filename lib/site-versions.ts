// lib
import FetchRequest from "./fetch-request";
// root
import type { DataProviderObject } from "../globals";

/**
 * Contains the UI and server version strings to pass to the UI.
 *
 * @property uiVersion - Version string of the UI
 * @property serverVersion - Version string of the server
 */
export type VersionsInfo = {
  uiVersion: string;
  serverVersion: string;
};

/**
 * Type guard to check if a DataProviderObject is a VersionsInfo object.
 *
 * @param obj - Object to test if it validates as a `VersionsInfo` object
 * @returns True if the object is a VersionsInfo object
 */
function isVersionInfo(obj: DataProviderObject | null): obj is VersionsInfo {
  return (
    obj !== null &&
    "uiVersion" in obj &&
    typeof obj.uiVersion === "string" &&
    "serverVersion" in obj &&
    typeof obj.serverVersion === "string"
  );
}

/**
 * Fetch the UI and server version information from the API. The /api/versions/ endpoint caches the
 * response for a short time to reduce load to the data provider.
 *
 * @returns UI and server version information
 */
export async function fetchVersions(): Promise<VersionsInfo | null> {
  const request = new FetchRequest({ backend: true });
  const response = (await request.getObject("/api/versions/")).optional();
  return isVersionInfo(response) ? response : null;
}

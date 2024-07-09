// lib
import QueryString from "../query-string";
// lib/batch-download
import BaseController from "./base-controller";
// types
import { ProfilesProps } from "../../globals.d";

/**
 * Batch-download controller for downloading all files associated with search results, both for
 * /search and /multireport pages.
 */
export default class SearchController extends BaseController {
  private profiles: ProfilesProps | null;

  constructor(query: QueryString, profiles: ProfilesProps | null) {
    super(query);
    this.profiles = profiles;
  }

  /**
   * This download actuator can appear on the multireport page, so we need to remove the field and
   * limit query parameters.
   */
  buildQueryStrings(): void {
    this.downloadQuery.deleteKeyValue("field");
    this.downloadQuery.deleteKeyValue("limit");
  }

  /**
   * Returns true to indicate a valid search query for downloading files, which for now means
   * exactly one type=FileSet or any of its subtypes.
   */
  get offerDownload(): boolean {
    if (this.profiles) {
      const typesInQuery = this.query.getKeyValues("type");
      if (typesInQuery.length === 1) {
        const downloadType = typesInQuery[0];

        // Offer download if the type query is type=FileSet.
        if (downloadType === "FileSet") {
          return true;
        }

        // Offer download if the query has exactly one type that is a subtype of FileSet.
        return this.profiles._subtypes.FileSet.includes(downloadType);
      }
    }

    // /profiles hasn't loaded yet.
    return false;
  }

  /**
   * Only initiate the download if the query and profiles allows this.
   */
  initiateDownload(): void {
    if (this.offerDownload) {
      super.initiateDownload();
    }
  }
}

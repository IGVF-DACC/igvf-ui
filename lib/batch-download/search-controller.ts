// lib
import { API_URL } from "../constants";
import { typeToRootType } from "../profiles";
import QueryString from "../query-string";
// lib/batch-download
import BaseController from "./base-controller";
// types
import { ProfilesProps } from "../../globals.d";

/**
 * List of download types supported for batch downloads from search pages.
 */
const abstractDownloadTypes = ["FileSet", "File"];

/**
 * Batch-download controller for downloading all files associated with search results, both for
 * /search and /multireport pages. It handles both file-set searches and file searches.
 */
export default class SearchController extends BaseController {
  // Profiles from session context
  private profiles: ProfilesProps | null;
  // Type of batch download based on single selected `type` query parameter
  private downloadType: string;
  // Abstract type parent of the download type
  private abstractDownloadType: string;

  constructor(query: QueryString, profiles: ProfilesProps | null) {
    super(query);
    this.profiles = profiles;

    // Determine the download type from the query-string `type=` parameter. Only allow one `type=`
    // query parameter.
    const typesInQuery = query.getKeyValues("type");
    this.downloadType = typesInQuery.length === 1 ? typesInQuery[0] : "";

    // Determine the requested type's parent abstract type. Only allow those in
    // `abstractDownloadTypes`. This determines the batch-download endpoints to use.
    if (this.downloadType && this.profiles) {
      const abstractRootType = typeToRootType(this.downloadType, this.profiles);
      this.abstractDownloadType = abstractDownloadTypes.includes(
        abstractRootType
      )
        ? abstractRootType
        : "";
    } else {
      this.abstractDownloadType = "";
    }
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
   * Returns true to indicate a valid search query for downloading files.
   * `this.abstractDownloadType` only gets set if `profiles` has loaded, exactly one `type=`
   * query parameter is present, and it is a subtype of the allowed abstract types.
   */
  get offerDownload(): boolean {
    return Boolean(this.abstractDownloadType);
  }

  // Use the default download URL for downloads from a file-set search. Use a special one for
  // downloads from a file search.
  get downloadUrl(): string {
    if (this.abstractDownloadType === "File") {
      return `${API_URL}/file-batch-download-v2/?${this.downloadQuery.format()}`;
    }
    return super.downloadUrl;
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

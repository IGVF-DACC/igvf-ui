// lib
import { API_URL } from "../constants";
import QueryString from "../query-string";

/**
 * Abstract base class for the batch-download controller. Extend from this class to implement
 * specific controller types for each kind of batch-download scenario. Possible scenarios include
 * downloading all files associated with a file set, or downloading all files associated with
 * search results for file-set searches.
 *
 * Each place needing a batch download would select the appropriate controller type and create an
 * instance of it, passing in the data appropriate to the scenario to create the batch-download
 * query string.
 */
export default class BaseController {
  // Original unchanged query in case a child class needs it.
  query: QueryString;
  // Query string for the batch download
  downloadQuery: QueryString;

  /**
   * Call with a query object corresponding to a query string in the URL.
   * @param query The query object to use for building the batch-download query string
   */
  constructor(query: QueryString) {
    this.query = query.clone();
    this.downloadQuery = query.clone();
  }

  /**
   * Build all the query strings based on the query object.
   */
  buildQueryStrings(): void {}

  /**
   * Returns true if the download actuator should appear in the UI based on some criteria, often
   * the current query string.
   */
  get offerDownload(): boolean {
    return true;
  }

  /**
   * Returns the download URL. Make sure to call `this.buildQueryStrings()` before calling this.
   */
  get downloadUrl(): string {
    return `${API_URL}/batch-download-v2/?${this.downloadQuery.format()}`;
  }

  /**
   * Initiate the batch download using the query string for the specified download option ID.
   */
  initiateDownload(): void {
    this.buildQueryStrings();
    window.location.href = this.downloadUrl;
  }
}

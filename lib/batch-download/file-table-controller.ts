// lib
import { deprecatedStatuses } from "../deprecated-files";
import QueryString from "../query-string";
// batch-download
import BaseController from "./base-controller";
// types
import type { FileSetObject } from "../../globals";

/**
 * Batch-download controller for downloading all files associated with a file set. This mostly gets
 * used on file tables on file-set pages.
 */
export default class FileTableController extends BaseController {
  private fileSet: FileSetObject;
  private isDeprecatedVisible: boolean;

  constructor(
    fileSet: FileSetObject,
    query?: QueryString,
    isDeprecatedVisible?: boolean
  ) {
    super(query || new QueryString(""));
    this.fileSet = fileSet;
    this.isDeprecatedVisible = isDeprecatedVisible || false;
  }

  get offerDownload() {
    return this.fileSet.files?.length > 0;
  }

  buildQueryStrings() {
    this.downloadQuery.addKeyValue("type", this.fileSet["@type"][0]);
    this.downloadQuery.addKeyValue("@id", this.fileSet["@id"]);
    if (!this.isDeprecatedVisible) {
      deprecatedStatuses.forEach((status) => {
        this.downloadQuery.addKeyValue("status", status, "NEGATIVE");
      });
    }
  }
}

// lib
import { type FileSetObject } from "../file-sets";
import QueryString from "../query-string";
// batch-download
import BaseController from "./base-controller";

/**
 * Batch-download controller for downloading all files associated with a file set. This mostly gets
 * used on file tables on file-set pages.
 */
export default class FileTableController extends BaseController {
  private fileSet: FileSetObject;

  constructor(fileSet: FileSetObject, query?: QueryString) {
    super(query || new QueryString(""));
    this.fileSet = fileSet;
  }

  get offerDownload() {
    return this.fileSet.files?.length > 0;
  }

  buildQueryStrings() {
    this.downloadQuery.addKeyValue("type", this.fileSet["@type"][0]);
    this.downloadQuery.addKeyValue("@id", this.fileSet["@id"]);
  }
}

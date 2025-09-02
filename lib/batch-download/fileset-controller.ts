// lib
import { API_URL } from "../constants";
import QueryString from "../query-string";
// batch-download
import BaseController from "./base-controller";
// types
import type { FileSetObject } from "../../globals";

/**
 * Batch-download controller for downloading all files associated with a file set as well as those
 * files' input files. This mostly gets used on file-set pages.
 */
export default class FileSetController extends BaseController {
  private fileSet: FileSetObject;

  constructor(fileSet: FileSetObject) {
    super(new QueryString(""));
    this.fileSet = fileSet;
  }

  get offerDownload() {
    return this.fileSet.files?.length > 0;
  }

  get downloadUrl(): string {
    return `${API_URL}${this.fileSet["@id"]}@@all-files`;
  }
}

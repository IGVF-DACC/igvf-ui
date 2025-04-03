// lib
import FetchRequest from "./fetch-request";
import { isErrorObject } from "./fetch-request";
// root
import type { DataProviderObject, FileObject } from "../globals.d";

/**
 * Soft link object from requesting the file object `href` property with the `soft=true` query-
 * string parameter.
 * @property "@type" - Identifies a soft link object
 * @property expires - Expiration date of the soft link
 * @property location - Complete URL of the soft link including protocol and domain
 */
interface SoftLink extends DataProviderObject {
  "@type": ["SoftRedirect"];
  expires: string;
  location: string;
}

/**
 * Type guard to check if `data` is a `SoftLink` object that has the AWS bucket link to a file to
 * download.
 * @param data Data object to check if it's a soft link object
 * @returns True if `data` is a soft link object
 */
function isSoftLink(item: DataProviderObject): item is SoftLink {
  return item["@type"][0] === "SoftRedirect";
}

/**
 * Because of redirects, the `href` property of a file object doesn't download the file into
 * browser memory.
 * @param downloadUri Path to the file to download from AWS bucket
 * @returns Complete URL of the soft link including protocol and domain
 */
async function getSoftLink(downloadUri: string): Promise<string> {
  const getRequest = new FetchRequest();
  const data = (await getRequest.getObject(`${downloadUri}?soft=true`)).union();

  // Check `data` for `isError` property, and handle error if true.
  if (isErrorObject(data)) {
    console.error(data.description);
    return "";
  }
  return isSoftLink(data) ? data.location : "";
}

/**
 * Downloads a TSV file from a soft link to an AWS bucket. Beyond a certain size, only the first
 * portion of the file is downloaded to preserve browser memory.
 * @param softLink Full URL to the AWS bucket to download the file
 * @returns TSV file content in string format
 */
async function getTsvGzFile(softLink: string): Promise<string> {
  const getRequest = new FetchRequest();
  return await getRequest.getZippedPreviewText(softLink);
}

/**
 * Downloads a text file from the `href` path in a file object.
 * @param downloadUri Path to the file to download; from file object `href`
 * @returns TSV file content in string format
 */
export async function loadHostedFile(file: FileObject): Promise<string> {
  if (file.href) {
    const softLink = await getSoftLink(file.href);
    return softLink ? await getTsvGzFile(softLink) : "";
  }
  return "";
}

// lib
import { API_URL } from "./constants";

/**
 * Supported MIME types for attachments.
 */
export type MimeTypes =
  | "application/json"
  | "application/pdf"
  | "image/gif"
  | "image/jpeg"
  | "image/png"
  | "image/svs"
  | "image/tiff"
  | "text/autosql"
  | "text/html"
  | "text/plain"
  | "text/tab-separated-values";

/**
 * Type definition for an attachment object. This is embedded in other objects, not linked, as
 * is no such thing as an attachment object as a database object.
 *
 * @property download - File name without any path
 * @property href - Relative URL to download the attachment
 * @property type - MIME type of the attachment
 * @property md5sum - MD5 checksum of the attachment file
 * @property size - Size of the attachment file in bytes
 * @property width - Width of the attachment image in pixels
 * @property height - Height of the attachment image in pixels
 */
export type AttachmentObject = {
  download: string;
  href: string;
  type: MimeTypes;
  md5sum?: string;
  size?: number;
  width?: number;
  height?: number;
};

/**
 * Generate the full URL of the given attachment.
 *
 * @param attachment - Attachment object to generate the URL for
 * @param ownerPath - Path of the object that owns the attachment
 * @returns The full server URL of the attachment
 */
export function attachmentToServerHref(
  attachment: AttachmentObject,
  ownerPath: string
): string {
  return `${API_URL}${ownerPath}${attachment.href}`;
}

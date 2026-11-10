// lib
import { API_URL } from "./constants";

/**
 * Supported MIME types for attachments.
 */
const supportedMimeTypes = [
  "application/json",
  "application/pdf",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svs",
  "image/tiff",
  "text/autosql",
  "text/csv",
  "text/html",
  "text/plain",
  "text/tab-separated-values",
] as const;

/**
 * Union type allowing only the supported MIME types for attachments.
 */
export type MimeTypes = (typeof supportedMimeTypes)[number];

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

/**
 * Type guard to check whether a value has the shape of an attachment object.
 *
 * @param obj - Value to check
 * @returns True if the value looks like an attachment object
 */
export function isAttachmentObject(obj: unknown): obj is AttachmentObject {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const attachment = obj as Record<string, unknown>;
    return (
      typeof attachment.download === "string" &&
      typeof attachment.href === "string" &&
      typeof attachment.type === "string" &&
      isSupportedMimeType(attachment.type) &&
      (attachment.md5sum === undefined ||
        typeof attachment.md5sum === "string") &&
      (attachment.size === undefined || typeof attachment.size === "number") &&
      (attachment.width === undefined ||
        typeof attachment.width === "number") &&
      (attachment.height === undefined || typeof attachment.height === "number")
    );
  }
  return false;
}

/**
 * Type guard to check whether a value is a supported MIME type for attachments. This uses the list
 * of supported MIME types defined in `supportedMimeTypes`.
 *
 * @param value - Value to check if it's a supported MIME type for attachments
 * @returns True if the value is a supported MIME type for attachments
 */
export function isSupportedMimeType(value: string): value is MimeTypes {
  return (
    typeof value === "string" &&
    supportedMimeTypes.some((mimeType) => mimeType === value)
  );
}

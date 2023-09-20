// lib
import { API_URL } from "./constants";

export interface Attachment {
  type: string,
  download: string,
  href: string,
}

/**
 * Generate the full URL of the given attachment.
 * @param {Attachment} attachment Attachment object to generate the URL for
 * @param {string} ownerPath Path of the object that owns the attachment
 * @returns {string} The full server URL of the attachment
 */
export function attachmentToServerHref(attachment: Attachment, ownerPath: string): string {
  return `${API_URL}${ownerPath}${attachment.href}`;
}

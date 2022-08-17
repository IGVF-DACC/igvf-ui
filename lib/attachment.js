// lib
import { API_URL } from "./constants";

/**
 * Generate the full URL of the given attachment.
 * @param {object} attachment Attachment object to generate the URL for
 * @param {string} ownerPath Path of the object that owns the attachment
 * @returns {string} The full server URL of the attachment
 */
export const attachmentToServerHref = (attachment, ownerPath) => {
  return `${API_URL}${ownerPath}${attachment.href}`;
};

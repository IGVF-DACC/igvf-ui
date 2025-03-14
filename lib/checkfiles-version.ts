import type { FileObject } from "../globals.d";

/**
 * Determine if the checkfiles version should be displayed for a file.
 * @param file File object that might contain a checkfiles version
 * @returns True if the checkfiles version should be displayed
 */
export function checkCheckfilesVersionVisible(file: FileObject): boolean {
  return (
    Boolean(file.checkfiles_version) ||
    file.upload_status === "validation exempted" ||
    file.upload_status === "validated" ||
    file.upload_status === "invalidated"
  );
}

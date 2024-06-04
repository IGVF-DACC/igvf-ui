import type { DatabaseObject } from "../globals.d";

// Publication-specific `DatabaseObject`.
export interface Publication extends DatabaseObject {
  title: string;
  authors?: string;
  date_published?: string;
  journal?: string;
  volume?: number;
  issue?: number;
  page?: string;
}

/**
 * Determine whether the given publication has enough information to display a citation.
 * @param publication The publication to check
 * @returns `true` if the publication has enough information to display a citation
 */
export function checkPublicationCitationVisible(
  publication: Publication
): boolean {
  return (
    publication.journal !== undefined ||
    publication.date_published !== undefined
  );
}

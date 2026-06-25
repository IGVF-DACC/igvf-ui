// lib
import { AttributionData } from "./attribution";
// root
import type { DatabaseObject } from "../globals";

/**
 * Return value from `getServerSideProps` for pages in this project. This also defines the shape of
 * the `pageContext` object that is passed to page components in this project. You likely need to
 * extend this for the actual props returned by `getServerSideProps` in your page, adding the
 * properties needed to display that page.
 *
 * @param attribution - Attribution data for the page, or `null` if no attribution data is available
 * @param isJson - True to display the page as JSON
 * @param pageContext - Contextual information about the page, usually its title
 * @param supersededBy - Optional array of database objects that supersede this object
 * @param supersedes - Optional array of database objects that this object supersedes
 */
export interface PageProps {
  attribution?: AttributionData | null;
  isJson: boolean;
  pageContext: {
    title: string;
  };
  supersededBy?: DatabaseObject[] | null;
  supersedes?: DatabaseObject[] | null;
}

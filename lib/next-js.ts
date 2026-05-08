// lib
import { AttributionData } from "./attribution";

/**
 * Return value from `getServerSideProps` for pages in this project. This also defines the shape of
 * the `pageContext` object that is passed to page components in this project. You likely need to
 * extend this for the actual props returned by `getServerSideProps` in your page, adding the
 * properties needed to display that page.
 */
export interface PageProps {
  pageContext: {
    title: string;
  };
  attribution: AttributionData | null;
  isJson: boolean;
}

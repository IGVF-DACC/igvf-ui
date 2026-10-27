// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// lib
import { getQueryStringFromServerQuery } from "../lib/query-utils";

/**
 * Placeholder page component. Requests to this route redirect to the analysis tab.
 */
export default function CodingVariantsRedirect() {
  return null;
}

/**
 * Redirect the base Coding Variants route to its default tab while preserving query parameters. The
 * pages exist in the `pages/coding-variants` directory.
 *
 * @param context - Server-side request context
 * @returns Permanent redirect to the Coding Variants analysis tab
 */
export function getServerSideProps(
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Record<string, never>> {
  const queryString = getQueryStringFromServerQuery(context.query);

  return {
    redirect: {
      destination: `/coding-variants/analysis/${
        queryString ? `?${queryString}` : ""
      }`,
      permanent: true,
    },
  };
}

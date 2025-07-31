// node_modules
import Head from "next/head";
import { useContext } from "react";
// lib
import { UC } from "../lib/constants";
// components
import GlobalContext from "./global-context";

/**
 * Generate the <title> element for the page, which is used in the browser tab. It displays the
 * site title followed by the page title, if provided from global context -- which comes from a
 * page's `getServerSideProps()`. `pageTitle`, if provided, overrides the page title from global
 * context. You normally provide this when `getServerSideProps()` can't generate a page title.
 * @param pageTitle - Text to display as the browser tab title of the page
 */
export default function SiteTitle({ pageTitle }: { pageTitle?: string }) {
  const { site, page } = useContext(GlobalContext);
  const title = pageTitle || page?.title || "";
  const siteTitle = site?.title || "";
  const composedTitle = [siteTitle, title]
    .filter(Boolean)
    .join(` ${UC.mdash} `);

  return (
    <Head>
      <title>{composedTitle || "Site"}</title>
    </Head>
  );
}

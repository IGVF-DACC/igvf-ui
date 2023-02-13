// node_modules
import Head from "next/head";
import PropTypes from "prop-types";
import { useContext } from "react";
// lib
import { UC } from "../lib/constants";
// components
import GlobalContext from "./global-context";

export default function SiteTitle({ pageTitle = "" }) {
  const { site, page } = useContext(GlobalContext);
  const title = pageTitle || page.title;

  return (
    <Head>
      <title>{`${site.title}${title && ` ${UC.mdash} ${title}`}`}</title>
    </Head>
  );
}

SiteTitle.propTypes = {
  // Page title for pages in which the server doesn't supply one
  pageTitle: PropTypes.string,
};

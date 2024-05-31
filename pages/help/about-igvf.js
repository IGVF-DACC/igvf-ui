// node_modules
import PropTypes from "prop-types";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
// components
import Page from "../../components/page";
import SiteInfo from "../../components/site-info";

/**
 * Static page to display the page at /help/about-igvf. It simply adds the SiteInfo component to
 * this page in particular.
 */
export default function AboutIgvf({ page, awards, labs, pages }) {
  return (
    <Page
      page={page}
      awards={awards}
      labs={labs}
      pages={pages}
      titleDecoration={<SiteInfo />}
    />
  );
}

AboutIgvf.propTypes = {
  // /help/about-igvf page object to display
  page: PropTypes.object,
  // List of awards for the page
  awards: PropTypes.array,
  // List of labs for the page
  labs: PropTypes.array,
  // List of all pages for the page editor
  pages: PropTypes.array,
};

export async function getServerSideProps({ req, resolvedUrl, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const page = (await request.getObject(resolvedUrl)).union();
  if (FetchRequest.isResponseSuccess(page)) {
    let awards = null;
    let labs = null;
    let pages = null;
    let breadcrumbs = null;
    if (page["@type"].includes("Page")) {
      // For objects with type 'Page', also get extra data needed for editing the page.
      awards = (await request.getCollection("awards"))
        .map((c) => c["@graph"])
        .optional();
      labs = (await request.getCollection("labs"))
        .map((c) => c["@graph"])
        .optional();
      pages = (await request.getCollection("pages"))
        .map((c) => c["@graph"])
        .optional();
      breadcrumbs = await buildBreadcrumbs(page, "title", req.headers.cookie);
    }
    const attribution = await buildAttribution(page, req.headers.cookie);
    return {
      props: {
        page,
        awards,
        labs,
        pages,
        attribution,
        pageContext: { title: page.title },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(page);
}

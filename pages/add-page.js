// node_modules
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components
import { useAuthenticated } from "../components/authentication";
import NoContent from "../components/no-content";
import Page from "../components/page";
// lib
import FetchRequest from "../lib/fetch-request";

export default function AddPage({ awards = null, labs = null, pages = null }) {
  // True if the user is editing a new page to add
  const [isNewPage, setAddingPage] = useState(false);

  const isAuthenticated = useAuthenticated();
  const router = useRouter();

  useEffect(() => {
    // Enable adding a page if the user is authenticated and the URL ends with "#!edit"
    if (isAuthenticated) {
      setAddingPage(router.asPath.endsWith("#!edit"));
    }
  }, [isAuthenticated, router.asPath]);

  if (isNewPage) {
    return <Page awards={awards} labs={labs} pages={pages} isNewPage />;
  }

  return <NoContent message="No page added." />;
}

AddPage.propTypes = {
  // Awards to offer as options for the new page
  awards: PropTypes.arrayOf(PropTypes.object),
  // Labs to offer as options for the new page
  labs: PropTypes.arrayOf(PropTypes.object),
  // Pages to display in the list
  pages: PropTypes.arrayOf(PropTypes.object),
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const awards = await request.getCollection("awards");
  const labs = await request.getCollection("labs");
  const pages = await request.getCollection("pages");
  return {
    props: {
      awards: awards["@graph"],
      labs: labs["@graph"],
      pages: pages["@graph"],
      pageContext: { title: "Add a New Page" },
    },
  };
}

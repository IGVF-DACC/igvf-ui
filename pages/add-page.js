// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components
import NoContent from "../components/no-content";
import Page from "../components/page";
// lib
import FetchRequest from "../lib/fetch-request";

export default function AddPage({ awards = null, labs = null, pages = null }) {
  // True if the user is editing a new page to add
  const [isNewPage, setAddingPage] = useState(false);

  const { isAuthenticated } = useAuth0();
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
  const awards = (await request.getCollection("awards"))
    .map((a) => a["@graph"])
    .optional();
  const labs = (await request.getCollection("labs"))
    .map((l) => l["@graph"])
    .optional();
  const pages = (await request.getCollection("pages"))
    .map((p) => p["@graph"])
    .optional();
  return {
    props: {
      awards,
      labs,
      pages,
      pageContext: { title: "Add a New Page" },
    },
  };
}

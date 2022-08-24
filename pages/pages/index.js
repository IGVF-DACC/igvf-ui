// node_modules
import PropTypes from "prop-types";
import AddObjectTrigger from "../../components/add-object-trigger";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  Collection,
  CollectionContent,
  CollectionHeader,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

/**
 * Displays all pages in the system as a collection. This also includes an "Add Page" button to add
 * a new page to the system. We might eventually remove this collection page and instead rely on
 * links to these pages from other pages.
 */
const PagesList = ({ pages }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {pages.length > 0 ? (
          <>
            <CollectionHeader
              count={pages.length}
              addSpec={{ path: "add-page", label: "Page" }}
            />
            <CollectionContent collection={pages}>
              {pages.map((page) => (
                <CollectionItem
                  key={page.uuid}
                  testid={page.uuid}
                  href={page["@id"]}
                  label={`Page ${page.title}`}
                  status={page.status}
                >
                  <CollectionItemName>{page.title}</CollectionItemName>
                </CollectionItem>
              ))}
            </CollectionContent>
          </>
        ) : (
          <>
            <AddObjectTrigger addSpec={{ path: "/add-page", label: "Page" }} />
            <NoCollectionData />
          </>
        )}
      </Collection>
    </>
  );
};

PagesList.propTypes = {
  // Labs to display in the list
  pages: PropTypes.array.isRequired,
};

export default PagesList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const pages = await request.getCollection("pages");
  if (FetchRequest.isResponseSuccess(pages)) {
    const breadcrumbs = await buildBreadcrumbs(
      pages,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        pages: pages["@graph"],
        pageContext: { title: pages.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(pages);
};

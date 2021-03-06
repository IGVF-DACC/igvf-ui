// node_modules
import PropTypes from "prop-types";
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

const LabList = ({ labs }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {labs.length > 0 ? (
          <>
            <CollectionHeader count={labs.length} />
            <CollectionContent collection={labs}>
              {labs.map((lab) => (
                <CollectionItem
                  key={lab.uuid}
                  testid={lab.uuid}
                  href={lab["@id"]}
                  label={`Lab ${lab.title}`}
                  status={lab.status}
                >
                  <CollectionItemName>{lab.title}</CollectionItemName>
                  <div>{lab.institute_label}</div>
                </CollectionItem>
              ))}
            </CollectionContent>
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

LabList.propTypes = {
  // Labs to display in the list
  labs: PropTypes.array.isRequired,
};

export default LabList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const labs = await request.getCollection("lab");
  if (FetchRequest.isResponseSuccess(labs)) {
    const breadcrumbs = await buildBreadcrumbs(
      labs,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        labs: labs["@graph"],
        pageContext: { title: labs.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(labs);
};

// node_modules
import PropTypes from "prop-types";
import { AddableItem } from "../../components/add";
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
  const labsList = labs["@graph"];
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddableItem collection={labs}>
        <Collection items={labsList}>
          {({ pageItems: pageLabs, pagerStatus, pagerAction }) => {
            if (labsList.length > 0) {
              return (
                <>
                  <CollectionHeader
                    pagerStatus={pagerStatus}
                    pagerAction={pagerAction}
                  />
                  <CollectionContent collection={labsList} pagerStatus={pagerStatus}>
                    {pageLabs.map((lab) => (
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
              );
            }

            return <NoCollectionData />;
          }}
        </Collection>
      </AddableItem>
    </>
  );
};

LabList.propTypes = {
  // Labs to display in the list
  labs: PropTypes.object.isRequired,
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
        labs: labs,
        pageContext: { title: labs.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(labs);
};

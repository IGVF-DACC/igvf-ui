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

const TechnicalSampleList = ({ technicalSamples }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {technicalSamples.length > 0 ? (
          <>
            <CollectionHeader count={technicalSamples.length} />
            <CollectionContent collection={technicalSamples}>
              {technicalSamples.map((sample) => (
                <CollectionItem
                  key={sample.uuid}
                  testid={sample.uuid}
                  href={sample["@id"]}
                  label={`Technical Sample ${sample.title}`}
                  status={sample.status}
                >
                  <CollectionItemName>
                    {sample.accession} &mdash; {sample.sample_material}
                  </CollectionItemName>
                  {sample.additional_description && (
                    <div>{sample.additional_description}</div>
                  )}
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

TechnicalSampleList.propTypes = {
  // Technical samples to display in the list
  technicalSamples: PropTypes.array.isRequired,
};

export default TechnicalSampleList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const technicalSamples = await request.getCollection("technical-samples");
  if (FetchRequest.isResponseSuccess(technicalSamples)) {
    const breadcrumbs = await buildBreadcrumbs(
      technicalSamples,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        technicalSamples: technicalSamples["@graph"],
        pageContext: { title: technicalSamples.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(technicalSamples);
};

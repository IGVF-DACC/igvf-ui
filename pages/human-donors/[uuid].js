// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { DonorDataItems } from "../../components/common-data-items";
import { DataArea, DataAreaTitle, DataPanel } from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import ExternalResources from "../../components/external-resources";
import { JsonDisplay } from "../../components/json-display";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import { isJsonFormat } from "../../lib/query-utils";
import buildAttribution from "../../lib/attribution";

export default function HumanDonor({
  donor,
  documents,
  parents,
  phenotypicFeatures,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={donor}>
        <PagePreamble />
        <JsonDisplay item={donor} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DonorDataItems donor={donor} parents={parents} />
            </DataArea>
          </DataPanel>
          {phenotypicFeatures.length > 0 && (
            <>
              <DataAreaTitle>Phenotypic Features</DataAreaTitle>
              <PhenotypicFeatureTable phenotypicFeatures={phenotypicFeatures} />
            </>
          )}
          <ExternalResources resources={donor.external_resources} />
          {documents.length > 0 && (
            <>
              <DataAreaTitle>Documents</DataAreaTitle>
              <DocumentTable documents={documents} />
            </>
          )}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

HumanDonor.propTypes = {
  // Human donor to display
  donor: PropTypes.object.isRequired,
  // Documents associated with human donor
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Phenotypic Features of this donor
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object),
  // HumanDonor attribution
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = await request.getObject(`/human-donors/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(donor)) {
    const documents = donor.documents
      ? await request.getMultipleObjects(donor.documents, null, {
          filterErrors: true,
        })
      : [];
    const parents = donor.parents
      ? await request.getMultipleObjects(donor.parents, null, {
          filterErrors: true,
        })
      : [];
    const phenotypicFeatures = donor.phenotypic_features
      ? await request.getMultipleObjects(donor.phenotypic_features, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      donor,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(donor, req.headers.cookie);
    return {
      props: {
        donor,
        documents,
        parents,
        pageContext: { title: donor.accession },
        phenotypicFeatures,
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(donor);
}

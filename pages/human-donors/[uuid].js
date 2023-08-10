// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/AlternateAccessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { DonorDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import ExternalResources from "../../components/external-resources";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestPhenotypicFeatures,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import { isJsonFormat } from "../../lib/query-utils";
import buildAttribution from "../../lib/attribution";

export default function HumanDonor({
  donor,
  documents,
  phenotypicFeatures,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={donor}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={donor.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={donor} isJsonFormat={isJson} />
        <JsonDisplay item={donor} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DonorDataItems item={donor} />
              {donor.human_donor_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Identifiers</DataItemLabel>
                  <DataItemValue>
                    {donor.human_donor_identifiers.join(", ")}
                  </DataItemValue>
                </>
              )}
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
      ? await requestDocuments(donor.documents, request)
      : [];
    const phenotypicFeatures = donor.phenotypic_features
      ? await requestPhenotypicFeatures(donor.phenotypic_features, request)
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

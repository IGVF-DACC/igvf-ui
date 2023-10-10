// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
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
import buildAttribution from "../../lib/attribution";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import ProductInfo from "../../components/product-info";
import { isJsonFormat } from "../../lib/query-utils";

export default function RodentDonor({
  donor,
  documents,
  attribution = null,
  phenotypicFeatures = [],
  sources = null,
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
              <DonorDataItems item={donor}>
                <DataItemLabel>Strain</DataItemLabel>
                <DataItemValue>{donor.strain}</DataItemValue>
                {donor.strain_background && (
                  <>
                    <DataItemLabel>Strain Background</DataItemLabel>
                    <DataItemValue>{donor.strain_background}</DataItemValue>
                  </>
                )}
                {donor.genotype && (
                  <>
                    <DataItemLabel>Genotype</DataItemLabel>
                    <DataItemValue>{donor.genotype}</DataItemValue>
                  </>
                )}
                {(donor.sources?.length > 0 || donor.lot_id) && (
                  <>
                    <DataItemLabel>Sources</DataItemLabel>
                    <DataItemValue>
                      <ProductInfo
                        sources={sources}
                        lotId={donor.lot_id}
                        productId={donor.product_id}
                      />
                    </DataItemValue>
                  </>
                )}
              </DonorDataItems>
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

RodentDonor.propTypes = {
  // Rodent donor to display
  donor: PropTypes.object.isRequired,
  // Documents associated with the rodent donor
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this donor
  attribution: PropTypes.object,
  // Phenotypic Features of this donor
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object),
  // Source of donor
  sources: PropTypes.arrayOf(PropTypes.object),
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = (
    await request.getObject(`/rodent-donors/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(donor)) {
    const documents = donor.documents
      ? await requestDocuments(donor.documents, request)
      : [];
    const phenotypicFeatures = donor.phenotypic_features
      ? await requestPhenotypicFeatures(donor.phenotypic_features, request)
      : [];
    let sources = [];
    if (donor.sources?.length > 0) {
      const sourcePaths = donor.sources.map((source) => source["@id"]);
      sources = await request.getMultipleObjects(sourcePaths, null, {
        filterErrors: true,
      });
    }
    const breadcrumbs = await buildBreadcrumbs(
      donor,
      donor.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(donor, req.headers.cookie);
    return {
      props: {
        donor,
        documents,
        phenotypicFeatures,
        sources,
        pageContext: { title: donor.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(donor);
}

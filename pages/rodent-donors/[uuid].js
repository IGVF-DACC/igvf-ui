// node_modules
import PropTypes from "prop-types";
// components
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
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import buildAttribution from "../../lib/attribution";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import ProductInfo from "../../components/product-info";
import { isJsonFormat } from "../../lib/query-utils";

export default function RodentDonor({
  donor,
  documents,
  parents,
  attribution = null,
  phenotypicFeatures = [],
  source = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={donor}>
        <PagePreamble />
        <ObjectPageHeader item={donor} isJsonFormat={isJson} />
        <JsonDisplay item={donor} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DonorDataItems item={donor} parents={parents}>
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
                {(donor.source || donor.lot_id) && (
                  <>
                    <DataItemLabel>Source</DataItemLabel>
                    <DataItemValue>
                      <ProductInfo
                        source={source}
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
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this donor
  attribution: PropTypes.object,
  // Phenotypic Features of this donor
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object),
  // Source of donor
  source: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = await request.getObject(`/rodent-donors/${params.uuid}/`);
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
    const source = donor.source
      ? await request.getObject(donor.source["@id"])
      : null;
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
        phenotypicFeatures,
        source,
        pageContext: { title: donor.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(donor);
}

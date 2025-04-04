// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import DbxrefList from "../../components/dbxref-list";
import { DonorDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import {
  requestDocuments,
  requestPhenotypicFeatures,
  requestPublications,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import buildAttribution from "../../lib/attribution";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import ProductInfo from "../../components/product-info";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function RodentDonor({
  donor,
  phenotypicFeatures,
  publications,
  documents,
  attribution = null,
  sources = null,
  isJson,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={donor} />
      <EditableItem item={donor}>
        <PagePreamble sections={sections} />
        <AlternateAccessions alternateAccessions={donor.alternate_accessions} />
        <ObjectPageHeader item={donor} isJsonFormat={isJson} />
        <JsonDisplay item={donor} isJsonFormat={isJson}>
          <StatusPreviewDetail item={donor} />
          <DataPanel>
            <DataArea>
              <DonorDataItems item={donor} publications={publications}>
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
                {donor.dbxrefs?.length > 0 && (
                  <>
                    <DataItemLabel>External Resources</DataItemLabel>
                    <DataItemValue>
                      <DbxrefList dbxrefs={donor.dbxrefs} isCollapsible />
                    </DataItemValue>
                  </>
                )}
              </DonorDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {phenotypicFeatures.length > 0 && (
            <PhenotypicFeatureTable phenotypicFeatures={phenotypicFeatures} />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

RodentDonor.propTypes = {
  // Rodent donor to display
  donor: PropTypes.object.isRequired,
  // Phenotypic features associated with rodent donor
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with rodent donor
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with the rodent donor
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this donor
  attribution: PropTypes.object,
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
    let phenotypicFeatures = [];
    if (donor.phenotypic_features?.length > 0) {
      const phenotypicFeaturePaths = donor.phenotypic_features.map(
        (feature) => feature["@id"]
      );
      phenotypicFeatures = await requestPhenotypicFeatures(
        phenotypicFeaturePaths,
        request
      );
    }

    let publications = [];
    if (donor.publications?.length > 0) {
      const publicationPaths = donor.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const documents = donor.documents
      ? await requestDocuments(donor.documents, request)
      : [];
    let sources = [];
    if (donor.sources?.length > 0) {
      const sourcePaths = donor.sources.map((source) => source["@id"]);
      sources = Ok.all(
        await request.getMultipleObjects(sourcePaths, {
          filterErrors: true,
        })
      );
    }
    const attribution = await buildAttribution(donor, req.headers.cookie);
    return {
      props: {
        donor,
        phenotypicFeatures,
        publications,
        documents,
        sources,
        pageContext: { title: donor.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(donor);
}

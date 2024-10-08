// node_modules
import PropTypes from "prop-types";
import { Fragment } from "react";
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
import { usePagePanels } from "../../components/page-panels";
import PagePreamble from "../../components/page-preamble";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import RelatedDonorsTable from "../../components/related-donors-table";
import SeparatedList from "../../components/separated-list";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestDonors,
  requestPhenotypicFeatures,
  requestPublications,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function HumanDonor({
  donor,
  phenotypicFeatures,
  relatedDonors,
  publications,
  documents,
  attribution = null,
  isJson,
}) {
  const pagePanels = usePagePanels();

  return (
    <>
      <Breadcrumbs item={donor} />
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
              <DonorDataItems item={donor} publications={publications} />
              {donor.human_donor_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Identifiers</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {donor.human_donor_identifiers.map((identifier) => (
                        <Fragment key={identifier}>{identifier}</Fragment>
                      ))}
                    </SeparatedList>
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
            </DataArea>
          </DataPanel>
          {phenotypicFeatures.length > 0 && (
            <PhenotypicFeatureTable
              phenotypicFeatures={phenotypicFeatures}
              pagePanels={pagePanels}
              pagePanelId="phenotypic-features"
            />
          )}
          {relatedDonors.length > 0 && (
            <RelatedDonorsTable
              relatedDonors={relatedDonors}
              embeddedDonors={donor.related_donors}
              pagePanels={pagePanels}
              pagePanelId="related-donors"
            />
          )}
          {documents.length > 0 && (
            <DocumentTable
              documents={documents}
              pagePanels={pagePanels}
              pagePanelId="documents"
            />
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
  // Phenotypic features associated with human donor
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Related donors associated with human donor
  relatedDonors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with human donor
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with human donor
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // HumanDonor attribution
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = (
    await request.getObject(`/human-donors/${params.uuid}/`)
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

    let relatedDonors = [];
    if (donor.related_donors?.length > 0) {
      const relatedDonorPaths = donor.related_donors.map(
        (relatedDonor) => relatedDonor.donor["@id"]
      );
      relatedDonors = await requestDonors(relatedDonorPaths, request);
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

    const attribution = await buildAttribution(donor, req.headers.cookie);
    return {
      props: {
        donor,
        phenotypicFeatures,
        relatedDonors,
        publications,
        documents,
        pageContext: { title: donor.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(donor);
}

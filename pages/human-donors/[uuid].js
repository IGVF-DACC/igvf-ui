// node_modules
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { DonorDataItems } from "../../components/common-data-items";
import {
  DataArea,
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
import RelatedDonorsTable from "../../components/related-donors-table";
import SeparatedList from "../../components/separated-list";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestDocuments } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import { isJsonFormat } from "../../lib/query-utils";
import buildAttribution from "../../lib/attribution";

export default function HumanDonor({
  donor,
  documents,
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
                    <SeparatedList isCollapsible>
                      {donor.human_donor_identifiers.map((identifier) => (
                        <Fragment key={identifier}>{identifier}</Fragment>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {donor.phenotypic_features && (
            <PhenotypicFeatureTable
              phenotypicFeatures={donor.phenotypic_features}
            />
          )}
          {donor.related_donors?.length > 0 && (
            <RelatedDonorsTable relatedDonors={donor.related_donors} />
          )}
          <ExternalResources resources={donor.external_resources} />
          {documents.length > 0 && <DocumentTable documents={documents} />}
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
    const documents = donor.documents
      ? await requestDocuments(donor.documents, request)
      : [];
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
        pageContext: { title: donor.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(donor);
}

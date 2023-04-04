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
import ExternalResources from "../../components/external-resources";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import buildAttribution from "../../lib/attribution";

export default function RodentDonor({
  donor,
  documents,
  parents,
  attribution,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={donor}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={donor.status} />
            </DataItemValue>
            <DonorDataItems donor={donor} parents={parents}>
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
            </DonorDataItems>
          </DataArea>
        </DataPanel>
        <ExternalResources resources={donor.external_resources} />
        {documents.length > 0 && (
          <>
            <DataAreaTitle>Documents</DataAreaTitle>
            <DocumentTable documents={documents} />
          </>
        )}
        <Attribution attribution={attribution} />
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
};

export async function getServerSideProps({ params, req }) {
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
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(donor);
}

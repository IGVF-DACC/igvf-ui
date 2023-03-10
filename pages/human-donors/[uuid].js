// node_modules
import dayjs from "dayjs";
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
import { DataGridContainer } from "../../components/data-grid";
import DocumentTable from "../../components/document-table";
import ExternalResources from "../../components/external-resources";
import PagePreamble from "../../components/page-preamble";
import SortableGrid from "../../components/sortable-grid";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { formatDateRange } from "../../lib/dates";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";

/**
 * Defines the columns for the health-status table.
 */
const healthStatusHistoryColumns = [
  {
    id: "dates",
    title: "Health Change Date",
    display: ({ source }) =>
      formatDateRange(source.date_start, source.date_end),
    sorter: (healthStatus) =>
      dayjs(healthStatus.date_start || healthStatus.date_end).unix(),
  },
  {
    id: "health_description",
    title: "Description",
    isSortable: false,
  },
];

export default function HumanDonor({
  donor,
  award = null,
  documents,
  lab = null,
  parents,
  phenotypicFeatures,
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
        {donor.health_status_history?.length > 0 && (
          <>
            <DataAreaTitle>Health Status History</DataAreaTitle>
            <DataGridContainer>
              <SortableGrid
                data={donor.health_status_history}
                columns={healthStatusHistoryColumns}
              />
            </DataGridContainer>
          </>
        )}
        {documents.length > 0 && (
          <>
            <DataAreaTitle>Documents</DataAreaTitle>
            <DocumentTable documents={documents} />
          </>
        )}
        <Attribution award={award} lab={lab} />
        {donor.collections?.length > 0 && (
          <DataPanel>
            <DataArea>
              <DataItemLabel>Collections</DataItemLabel>
              <DataItemValue>{donor.collections.join(", ")}</DataItemValue>
            </DataArea>
          </DataPanel>
        )}
      </EditableItem>
    </>
  );
}

HumanDonor.propTypes = {
  // Human donor to display
  donor: PropTypes.object.isRequired,
  // Award applied to this human donor
  award: PropTypes.object,
  // Documents associated with human donor
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this human donor
  lab: PropTypes.object,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Phenotypic Features of this donor
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object),
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = await request.getObject(`/human-donors/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(donor)) {
    const award = await request.getObject(donor.award, null);
    const documents = donor.documents
      ? await request.getMultipleObjects(donor.documents, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(donor.lab, null);
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
    return {
      props: {
        donor,
        award,
        documents,
        lab,
        parents,
        pageContext: { title: donor.accession },
        phenotypicFeatures,
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(donor);
}

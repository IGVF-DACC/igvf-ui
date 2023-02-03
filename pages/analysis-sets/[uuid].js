// node_modules
// import dayjs from "dayjs";
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
// import { DonorDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
// import { DataGridContainer } from "../../components/data-grid";
import DocumentTable from "../../components/document-table";
// import ExternalResources from "../../components/external-resources";
import PagePreamble from "../../components/page-preamble";
// import SortableGrid from "../../components/sortable-grid";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
// import { formatDateRange } from "../../lib/dates";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import SeparatedList from "../../components/separated-list";
import Link from "next/link";

/**
 * Defines the columns for the health-status table.
 */
// const healthStatusHistoryColumns = [
//   {
//     id: "dates",
//     title: "Health Change Date",
//     display: ({ source }) =>
//       formatDateRange(source.date_start, source.date_end),
//     sorter: (healthStatus) =>
//       dayjs(healthStatus.date_start || healthStatus.date_end).unix(),
//   },
//   {
//     id: "health_description",
//     title: "Description",
//     isSortable: false,
//   },
// ];

const AnalysisSet = ({
  analysisSet,
  award = null,
  documents,
  donors,
  lab = null,
  samples,
}) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={analysisSet}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Aliases</DataItemLabel>
            <DataItemValue>
              <AliasList aliases={analysisSet.aliases} />
            </DataItemValue>
            {donors.length > 0 && (
              <>
                <DataItemLabel>Donors</DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {donors.map((donor) => (
                      <Link href={donor["@id"]} key={donor.uuid}>
                        {donor.accession}
                      </Link>
                    ))}
                  </SeparatedList>
                </DataItemValue>
              </>
            )}
            {samples.length > 0 && (
              <>
                <DataItemLabel>Samples</DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {samples.map((sample) => (
                      <Link href={sample["@id"]} key={sample.uuid}>
                        {sample.accession}
                      </Link>
                    ))}
                  </SeparatedList>
                </DataItemValue>
              </>
            )}
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={analysisSet.status} />
            </DataItemValue>
          </DataArea>
        </DataPanel>

        {documents.length > 0 && (
          <>
            <DataAreaTitle>Documents</DataAreaTitle>
            <DocumentTable documents={documents} />
          </>
        )}

        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
};

AnalysisSet.propTypes = {
  analysisSet: PropTypes.object.isRequired,
  // Technical sample to display
  donors: PropTypes.object.isRequired,
  samples: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.object,
  // Documents associated with the cell-line
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.object,
};

export default AnalysisSet;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisSet = await request.getObject(`/analysis-sets/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(analysisSet)) {
    const award = await request.getObject(analysisSet.award, null);
    const documents = analysisSet.documents
      ? await request.getMultipleObjects(analysisSet.documents, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(analysisSet.lab, null);
    const samples = analysisSet.samples
      ? await request.getMultipleObjects(analysisSet.samples, null, {
          filterErrors: true,
        })
      : [];
    const donors = analysisSet.donors
      ? await request.getMultipleObjects(analysisSet.donors, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      analysisSet,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        analysisSet,
        award,
        documents,
        donors,
        lab,
        samples,
        pageContext: { title: analysisSet.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(analysisSet);
};

// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { DataAreaTitle } from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { FileDataItems } from "../../components/common-data-items";
import buildAttribution from "../../lib/attribution";

export default function SequenceData({
  sequenceData,
  fileSet,
  documents,
  derivedFrom,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sequenceData}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={sequenceData.status} />
            </DataItemValue>
            <FileDataItems
              file={sequenceData}
              fileSet={fileSet}
              derivedFrom={derivedFrom}
            >
              <DataItemLabel>Sequencing Run</DataItemLabel>
              <DataItemValue>{sequenceData.sequencing_run}</DataItemValue>
              {sequenceData.read_count && (
                <>
                  <DataItemLabel>Read Count</DataItemLabel>
                  <DataItemValue>{sequenceData.read_count}</DataItemValue>
                </>
              )}
              {sequenceData.mean_read_length && (
                <>
                  <DataItemLabel>Read Length</DataItemLabel>
                  <DataItemValue>{sequenceData.mean_read_length}</DataItemValue>
                </>
              )}
            </FileDataItems>
          </DataArea>
        </DataPanel>
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

SequenceData.propTypes = {
  // SequenceData object to display
  sequenceData: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Attribution for this file
  attribution: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sequenceData = await request.getObject(`/sequence-data/${params.id}/`);
  if (FetchRequest.isResponseSuccess(sequenceData)) {
    const fileSet = await request.getObject(sequenceData.file_set, null);
    const documents = sequenceData.documents
      ? await request.getMultipleObjects(sequenceData.documents, null, {
          filterErrors: true,
        })
      : [];
    const derivedFrom = sequenceData.derived_from
      ? await request.getMultipleObjects(sequenceData.derived_from, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      sequenceData,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      sequenceData,
      req.headers.cookie
    );
    return {
      props: {
        sequenceData,
        fileSet,
        documents,
        derivedFrom,
        pageContext: { title: sequenceData.accession },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(sequenceData);
}

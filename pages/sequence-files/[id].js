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
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { DataAreaTitle } from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { FileDataItems } from "../../components/common-data-items";
import buildAttribution from "../../lib/attribution";

export default function SequenceFile({
  sequenceFile,
  fileSet,
  documents,
  derivedFrom,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sequenceFile}>
        <PagePreamble />
        <ObjectPageHeader item={sequenceFile} />
        <DataPanel>
          <DataArea>
            <FileDataItems
              file={sequenceFile}
              fileSet={fileSet}
              derivedFrom={derivedFrom}
            >
              <DataItemLabel>Sequencing Run</DataItemLabel>
              <DataItemValue>{sequenceFile.sequencing_run}</DataItemValue>
              {sequenceFile.read_count && (
                <>
                  <DataItemLabel>Read Count</DataItemLabel>
                  <DataItemValue>{sequenceFile.read_count}</DataItemValue>
                </>
              )}
              {sequenceFile.mean_read_length && (
                <>
                  <DataItemLabel>Read Length</DataItemLabel>
                  <DataItemValue>{sequenceFile.mean_read_length}</DataItemValue>
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

SequenceFile.propTypes = {
  // SequenceFile object to display
  sequenceFile: PropTypes.object.isRequired,
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
  const sequenceFile = await request.getObject(`/sequence-files/${params.id}/`);
  if (FetchRequest.isResponseSuccess(sequenceFile)) {
    const fileSet = await request.getObject(sequenceFile.file_set, null);
    const documents = sequenceFile.documents
      ? await request.getMultipleObjects(sequenceFile.documents, null, {
          filterErrors: true,
        })
      : [];
    const derivedFrom = sequenceFile.derived_from
      ? await request.getMultipleObjects(sequenceFile.derived_from, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      sequenceFile,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      sequenceFile,
      req.headers.cookie
    );
    return {
      props: {
        sequenceFile,
        fileSet,
        documents,
        derivedFrom,
        pageContext: { title: sequenceFile.accession },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(sequenceFile);
}

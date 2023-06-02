// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function SequenceFile({
  sequenceFile,
  fileSet,
  documents,
  derivedFrom,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sequenceFile}>
        <PagePreamble />
        <ObjectPageHeader item={sequenceFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={sequenceFile} />
        </ObjectPageHeader>
        <JsonDisplay item={sequenceFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems
                file={sequenceFile}
                fileSet={fileSet}
                derivedFrom={derivedFrom}
              >
                <DataItemLabel>Sequencing Run</DataItemLabel>
                <DataItemValue>{sequenceFile.sequencing_run}</DataItemValue>
                {truthyOrZero(sequenceFile.read_count) && (
                  <>
                    <DataItemLabel>Read Count</DataItemLabel>
                    <DataItemValue>{sequenceFile.read_count}</DataItemValue>
                  </>
                )}
                {truthyOrZero(sequenceFile.mean_read_length) && (
                  <>
                    <DataItemLabel>Read Length</DataItemLabel>
                    <DataItemValue>
                      {sequenceFile.mean_read_length}
                    </DataItemValue>
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
        </JsonDisplay>
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
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
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
        isJson,
      },
    };
  }
  return errorObjectToProps(sequenceFile);
}

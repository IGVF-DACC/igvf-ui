// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import FileTable from "../../components/file-table";
import { HostedFilePreview } from "../../components/hosted-file-preview";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { SeqspecDocumentLink } from "../../components/seqspec-document";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
  requestSamples,
  requestSeqspecFiles,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  collectFileFileSetSamples,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function SequenceFile({
  sequenceFile,
  documents,
  derivedFrom,
  derivedFromFileSets,
  inputFileFor,
  fileSetSamples,
  fileFormatSpecifications,
  seqspecDocument,
  attribution = null,
  isJson,
  seqspecs,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={sequenceFile} />
      <EditableItem item={sequenceFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={sequenceFile.alternate_accessions}
        />
        <ObjectPageHeader item={sequenceFile} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={sequenceFile} />
          <FileHeaderDownload file={sequenceFile}>
            <HostedFilePreview file={sequenceFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={sequenceFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={sequenceFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={sequenceFile} />
              {seqspecDocument && (
                <>
                  <DataItemLabel>Sequence Specification Document</DataItemLabel>
                  <DataItemValue>
                    <SeqspecDocumentLink seqspecDocument={seqspecDocument} />
                  </DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <DataAreaTitle id="sequencing-details">
            Sequencing Details
          </DataAreaTitle>
          <DataPanel>
            <DataArea>
              {sequenceFile.sequencing_platform && (
                <>
                  <DataItemLabel>Sequencing Platform</DataItemLabel>
                  <DataItemValue>
                    <Link href={sequenceFile.sequencing_platform["@id"]}>
                      {sequenceFile.sequencing_platform.term_name}
                    </Link>
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>Sequencing Run</DataItemLabel>
              <DataItemValue>{sequenceFile.sequencing_run}</DataItemValue>
              {sequenceFile.flowcell_id && (
                <>
                  <DataItemLabel>Flowcell ID</DataItemLabel>
                  <DataItemValue>{sequenceFile.flowcell_id}</DataItemValue>
                </>
              )}
              {sequenceFile.lane && (
                <>
                  <DataItemLabel>Lane</DataItemLabel>
                  <DataItemValue>{sequenceFile.lane}</DataItemValue>
                </>
              )}
              {sequenceFile.sequencing_kit && (
                <>
                  <DataItemLabel>Sequencing Kit</DataItemLabel>
                  <DataItemValue>{sequenceFile.sequencing_kit}</DataItemValue>
                </>
              )}
              {sequenceFile.illumina_read_type && (
                <>
                  <DataItemLabel>Illumina Read Type</DataItemLabel>
                  <DataItemValue>
                    {sequenceFile.illumina_read_type}
                  </DataItemValue>
                </>
              )}
              {sequenceFile.index && (
                <>
                  <DataItemLabel>Index</DataItemLabel>
                  <DataItemValue>{sequenceFile.index}</DataItemValue>
                </>
              )}
              {truthyOrZero(sequenceFile.mean_read_length) && (
                <>
                  <DataItemLabel>Average Read Length</DataItemLabel>
                  <DataItemValue>{sequenceFile.mean_read_length}</DataItemValue>
                </>
              )}
              {truthyOrZero(sequenceFile.read_count) && (
                <>
                  <DataItemLabel>Read Count</DataItemLabel>
                  <DataItemValue>{sequenceFile.read_count}</DataItemValue>
                </>
              )}
              {sequenceFile.base_modifications?.length > 0 && (
                <>
                  <DataItemLabel>Base Modifications</DataItemLabel>
                  <DataItemValue>
                    {sequenceFile.base_modifications.join(", ")}
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
              panelId="file-format-specifications"
            />
          )}
          {fileSetSamples.length > 0 && (
            <SampleTable samples={fileSetSamples} />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              derivedFromFileSets={derivedFromFileSets}
              reportLink={`/multireport/?type=File&input_file_for=${sequenceFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${sequenceFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
              panelId="input-file-for"
            />
          )}
          {seqspecs.length > 0 && (
            <FileTable
              files={seqspecs}
              title="Associated seqspec Files"
              reportLink={`/multireport/?type=ConfigurationFile&seqspec_of=${sequenceFile["@id"]}`}
              panelId="seqspec"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

SequenceFile.propTypes = {
  // SequenceFile object to display
  sequenceFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Filesets derived from files belong to
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples associated with this file's file set
  fileSetSamples: PropTypes.array.isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // seqspec document associated with this file
  seqspecDocument: PropTypes.object,
  // Attribution for this file
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
  // Linked seqspec configuration files
  seqspecs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  // Redirect to the file page if the URL is a file download link.
  if (checkForFileDownloadPath(resolvedUrl)) {
    return {
      redirect: {
        destination: convertFileDownloadPathToFilePagePath(resolvedUrl),
        permanent: false,
      },
    };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sequenceFile = (
    await request.getObject(`/sequence-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(sequenceFile)) {
    const documents = sequenceFile.documents
      ? await requestDocuments(sequenceFile.documents, request)
      : [];
    const derivedFrom = sequenceFile.derived_from
      ? await requestFiles(sequenceFile.derived_from, request)
      : [];
    const derivedFromFileSetPaths = derivedFrom
      .map((file) => file.file_set)
      .filter((fileSet) => fileSet);
    const uniqueDerivedFromFileSetPaths = [...new Set(derivedFromFileSetPaths)];
    const derivedFromFileSets =
      uniqueDerivedFromFileSetPaths.length > 0
        ? await requestFileSets(uniqueDerivedFromFileSetPaths, request)
        : [];
    const inputFileFor =
      sequenceFile.input_file_for.length > 0
        ? await requestFiles(sequenceFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (sequenceFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        sequenceFile.file_format_specifications.map(
          (document) => document["@id"]
        );
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    const seqspecs =
      sequenceFile.seqspecs?.length > 0
        ? await requestSeqspecFiles([sequenceFile], request)
        : [];
    const seqspecDocuments = sequenceFile.seqspec_document
      ? await requestDocuments([sequenceFile.seqspec_document], request)
      : null;
    const embeddedFileSetSamples = collectFileFileSetSamples(sequenceFile);
    const fileSetSamplePaths = embeddedFileSetSamples.map(
      (sample) => sample["@id"]
    );
    const fileSetSamples =
      fileSetSamplePaths.length > 0
        ? await requestSamples(fileSetSamplePaths, request)
        : [];
    const attribution = await buildAttribution(
      sequenceFile,
      req.headers.cookie
    );
    return {
      props: {
        sequenceFile,
        documents,
        derivedFrom,
        derivedFromFileSets,
        inputFileFor,
        fileSetSamples,
        fileFormatSpecifications,
        seqspecDocument: seqspecDocuments ? seqspecDocuments[0] : null,
        pageContext: { title: sequenceFile.accession },
        attribution,
        isJson,
        seqspecs,
      },
    };
  }
  return errorObjectToProps(sequenceFile);
}

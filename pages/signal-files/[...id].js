// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
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
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
  requestSamples,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  collectFileFileSetSamples,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function SignalFile({
  attribution,
  signalFile,
  documents,
  derivedFrom,
  derivedFromFileSets,
  inputFileFor,
  fileSetSamples,
  fileFormatSpecifications,
  referenceFiles,
  isJson,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={signalFile} />
      <EditableItem item={signalFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={signalFile.alternate_accessions}
        />
        <ObjectPageHeader item={signalFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={signalFile}>
            <HostedFilePreview file={signalFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={signalFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={signalFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={signalFile} />
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <DataAreaTitle id="signal-details">Signal Details</DataAreaTitle>
          <DataPanel>
            <DataArea>
              <>
                <DataItemLabel>Strand Specificity</DataItemLabel>
                <DataItemValue>{signalFile.strand_specificity}</DataItemValue>
              </>
              {signalFile.filtered && (
                <>
                  <DataItemLabel>Filtered</DataItemLabel>
                  <DataItemValue>True</DataItemValue>
                </>
              )}
              {signalFile.normalized && (
                <>
                  <DataItemLabel>Normalized</DataItemLabel>
                  <DataItemValue>True</DataItemValue>
                </>
              )}
              {signalFile.assembly && (
                <>
                  <DataItemLabel>Genome Assembly</DataItemLabel>
                  <DataItemValue>{signalFile.assembly}</DataItemValue>
                </>
              )}
              {signalFile.start_view_position && (
                <>
                  <DataItemLabel>Start View Position</DataItemLabel>
                  <DataItemValue>
                    {signalFile.start_view_position}
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
              reportLink={`/multireport/?type=File&input_file_for=${signalFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${signalFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
              panelId="input-file-for"
            />
          )}
          {referenceFiles.length > 0 && (
            <FileTable
              files={referenceFiles}
              title="Reference Files"
              panelId="reference"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

SignalFile.propTypes = {
  // SignalFile object to display
  signalFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array.isRequired,
  // The file is derived from
  derivedFrom: PropTypes.array.isRequired,
  // Filesets derived from files belong to
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Samples associated with the file's file sets
  fileSetSamples: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // Attribution for this file
  attribution: PropTypes.object.isRequired,
  // Reference files used to generate this file
  referenceFiles: PropTypes.array.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  // Redirect to the file page if the URL is a file download link.
  const isPathForFileDownload = checkForFileDownloadPath(resolvedUrl);
  if (isPathForFileDownload) {
    return {
      redirect: {
        destination: convertFileDownloadPathToFilePagePath(resolvedUrl),
        permanent: false,
      },
    };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const signalFile = (
    await request.getObject(`/signal-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(signalFile)) {
    const documents = signalFile.documents
      ? await requestDocuments(signalFile.documents, request)
      : [];
    const derivedFrom = signalFile.derived_from
      ? await requestFiles(signalFile.derived_from, request)
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
      signalFile.input_file_for.length > 0
        ? await requestFiles(signalFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (signalFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        signalFile.file_format_specifications.map(
          (document) => document["@id"]
        );
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    const referenceFiles = signalFile.reference_files
      ? await requestFiles(signalFile.reference_files, request)
      : [];
    const embeddedFileSetSamples = collectFileFileSetSamples(signalFile);
    const fileSetSamplePaths = embeddedFileSetSamples.map(
      (sample) => sample["@id"]
    );
    const fileSetSamples =
      fileSetSamplePaths.length > 0
        ? await requestSamples(fileSetSamplePaths, request)
        : [];
    const attribution = await buildAttribution(signalFile, req.headers.cookie);
    return {
      props: {
        signalFile,
        documents,
        derivedFrom,
        derivedFromFileSets,
        inputFileFor,
        fileSetSamples,
        fileFormatSpecifications,
        pageContext: { title: signalFile.accession },
        attribution,
        referenceFiles,
        isJson,
      },
    };
  }
  return errorObjectToProps(signalFile);
}

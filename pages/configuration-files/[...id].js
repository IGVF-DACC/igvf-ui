// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import { DataArea, DataPanel } from "../../components/data-area";
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
import SequencingFileTable from "../../components/sequencing-file-table";
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
import { collectFileFileSetSamples } from "../../lib/files";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function ConfigurationFile({
  attribution,
  configurationFile,
  seqspecOf,
  documents,
  derivedFrom,
  derivedFromFileSets,
  inputFileFor,
  fileSetSamples,
  fileFormatSpecifications,
  isJson,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={configurationFile} />
      <EditableItem item={configurationFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={configurationFile.alternate_accessions}
        />
        <ObjectPageHeader item={configurationFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={configurationFile}>
            <HostedFilePreview file={configurationFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={configurationFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={configurationFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={configurationFile} />
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {seqspecOf.length > 0 && (
            <SequencingFileTable
              files={seqspecOf}
              title="seqspec File Of"
              itemPath={configurationFile["@id"]}
              itemPathProp="seqspecs"
              isSeqspecHidden
            />
          )}
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
              reportLink={`/multireport/?type=File&input_file_for=${configurationFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${configurationFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
              panelId="input-file-for"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

ConfigurationFile.propTypes = {
  // ConfigurationFile object to display
  configurationFile: PropTypes.object.isRequired,
  // The file is a seqspec of
  seqspecOf: PropTypes.array.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array.isRequired,
  // The file is derived from
  derivedFrom: PropTypes.array.isRequired,
  // Filesets derived from files belong to
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Samples associated with this file's file set
  fileSetSamples: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // Attribution for this file
  attribution: PropTypes.object.isRequired,
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
  const configurationFile = (
    await request.getObject(`/configuration-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(configurationFile)) {
    const seqspecOf = configurationFile.seqspec_of
      ? await requestFiles(configurationFile.seqspec_of, request)
      : [];
    const documents = configurationFile.documents
      ? await requestDocuments(configurationFile.documents, request)
      : [];
    const derivedFrom = configurationFile.derived_from
      ? await requestFiles(configurationFile.derived_from, request)
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
      configurationFile.input_file_for.length > 0
        ? await requestFiles(configurationFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (configurationFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        configurationFile.file_format_specifications.map(
          (document) => document["@id"]
        );
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    const embeddedFileSetSamples = collectFileFileSetSamples(configurationFile);
    const fileSetSamplePaths = embeddedFileSetSamples.map(
      (sample) => sample["@id"]
    );
    const fileSetSamples =
      fileSetSamplePaths.length > 0
        ? await requestSamples(fileSetSamplePaths, request)
        : [];
    const attribution = await buildAttribution(
      configurationFile,
      req.headers.cookie
    );
    return {
      props: {
        configurationFile,
        seqspecOf,
        documents,
        derivedFrom,
        derivedFromFileSets,
        inputFileFor,
        fileSetSamples,
        fileFormatSpecifications,
        pageContext: { title: configurationFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(configurationFile);
}

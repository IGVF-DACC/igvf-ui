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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function ModelFile({
  attribution,
  modelFile,
  fileSet = null,
  documents,
  derivedFrom,
  derivedFromFileSets,
  inputFileFor,
  fileFormatSpecifications,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs item={modelFile} />
      <EditableItem item={modelFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={modelFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={modelFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={modelFile} />
        </ObjectPageHeader>
        <JsonDisplay item={modelFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems item={modelFile} fileSet={fileSet} />
            </DataArea>
          </DataPanel>
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              derivedFromFileSets={derivedFromFileSets}
              reportLink={`/multireport/?type=File&input_file_for=${modelFile["@id"]}`}
              reportLabel={`Report of files ${modelFile.accession} derives from`}
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${modelFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
            />
          )}
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

ModelFile.propTypes = {
  // ModelFile object to display
  modelFile: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
  // Documents associated with this file
  documents: PropTypes.array.isRequired,
  // Files this file derives from
  derivedFrom: PropTypes.array.isRequired,
  // File sets associated with files  this file derives from
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // File specification documents
  fileFormatSpecifications: PropTypes.array.isRequired,
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
  const modelFile = (
    await request.getObject(`/model-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(modelFile)) {
    const fileSet = (await request.getObject(modelFile.file_set)).optional();

    const documents = modelFile.documents
      ? await requestDocuments(modelFile.documents, request)
      : [];

    const derivedFrom = modelFile.derived_from
      ? await requestFiles(modelFile.derived_from, request)
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
      modelFile.input_file_for.length > 0
        ? await requestFiles(modelFile.input_file_for, request)
        : [];

    const fileFormatSpecifications = modelFile.file_format_specifications
      ? await requestDocuments(modelFile.file_format_specifications, request)
      : [];

    const attribution = await buildAttribution(modelFile, req.headers.cookie);
    return {
      props: {
        modelFile,
        fileSet,
        documents,
        derivedFrom,
        derivedFromFileSets,
        inputFileFor,
        fileFormatSpecifications,
        pageContext: { title: modelFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modelFile);
}
// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import { ControlledAccessIndicator } from "../../components/controlled-access";
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
import { QualityMetricPanel } from "../../components/quality-metric";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestQualityMetrics,
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
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  qualityMetrics,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={modelFile} />
      <EditableItem item={modelFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={modelFile.alternate_accessions}
        />
        <ObjectPageHeader item={modelFile} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={modelFile} />
          <FileHeaderDownload file={modelFile}>
            <HostedFilePreview file={modelFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={modelFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={modelFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={modelFile} />
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <QualityMetricPanel qualityMetrics={qualityMetrics} />
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
              panelId="file-format-specifications"
            />
          )}
          {modelFile.file_set.samples?.length > 0 && (
            <SampleTable samples={modelFile.file_set.samples} />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${modelFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${modelFile["@id"]}`}
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

ModelFile.propTypes = {
  // ModelFile object to display
  modelFile: PropTypes.object.isRequired,
  // Documents associated with this file
  documents: PropTypes.array.isRequired,
  // Files this file derives from
  derivedFrom: PropTypes.array.isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // File specification documents
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // Quality metrics associated with this file
  qualityMetrics: PropTypes.arrayOf(PropTypes.object),
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
    const documents = modelFile.documents
      ? await requestDocuments(modelFile.documents, request)
      : [];

    const derivedFrom = modelFile.derived_from
      ? await requestFiles(modelFile.derived_from, request)
      : [];

    const inputFileFor =
      modelFile.input_file_for.length > 0
        ? await requestFiles(modelFile.input_file_for, request)
        : [];

    let fileFormatSpecifications = [];
    if (modelFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        modelFile.file_format_specifications.map((document) => document["@id"]);
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    const qualityMetrics =
      modelFile.quality_metrics.length > 0
        ? await requestQualityMetrics(modelFile.quality_metrics, request)
        : [];
    const attribution = await buildAttribution(modelFile, req.headers.cookie);
    return {
      props: {
        modelFile,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        qualityMetrics,
        pageContext: { title: modelFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modelFile);
}

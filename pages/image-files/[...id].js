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
import { QualityMetricPanel } from "../../components/quality-metric";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
import WorkflowTable from "../../components/workflow-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestQualityMetrics,
  requestWorkflows,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function ImageFile({
  imageFile,
  attribution,
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  workflows,
  qualityMetrics,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={imageFile} />
      <EditableItem item={imageFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={imageFile.alternate_accessions}
        />
        <ObjectPageHeader item={imageFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={imageFile}>
            <HostedFilePreview file={imageFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={imageFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={imageFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={imageFile} />
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {workflows.length > 0 && <WorkflowTable workflows={workflows} />}
          <QualityMetricPanel qualityMetrics={qualityMetrics} />
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
              panelId="file-format-specifications"
            />
          )}
          {imageFile.file_set.samples?.length > 0 && (
            <SampleTable samples={imageFile.file_set.samples} />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${imageFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${imageFile["@id"]}`}
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

ImageFile.propTypes = {
  // ImageFile object to display
  imageFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array.isRequired,
  // The file is derived from
  derivedFrom: PropTypes.array.isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // Workflows that processed this file
  workflows: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Quality metrics for this file
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
  const imageFile = (
    await request.getObject(`/image-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(imageFile)) {
    const documents = imageFile.documents
      ? await requestDocuments(imageFile.documents, request)
      : [];
    const derivedFrom = imageFile.derived_from
      ? await requestFiles(imageFile.derived_from, request)
      : [];
    const inputFileFor =
      imageFile.input_file_for?.length > 0
        ? await requestFiles(imageFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (imageFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        imageFile.file_format_specifications.map((document) => document["@id"]);
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    let workflows = [];
    if (imageFile.workflows?.length > 0) {
      const workflowPaths = imageFile.workflows.map(
        (workflow) => workflow["@id"]
      );
      workflows = await requestWorkflows(workflowPaths, request);
    }
    const qualityMetrics =
      imageFile.quality_metrics?.length > 0
        ? await requestQualityMetrics(imageFile.quality_metrics, request)
        : [];
    const attribution = await buildAttribution(imageFile, req.headers.cookie);
    return {
      props: {
        imageFile,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        workflows,
        pageContext: { title: imageFile.accession },
        qualityMetrics,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(imageFile);
}

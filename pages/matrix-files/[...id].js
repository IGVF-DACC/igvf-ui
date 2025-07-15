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

export default function MatrixFile({
  matrixFile,
  attribution,
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  referenceFiles,
  qualityMetrics,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={matrixFile} />
      <EditableItem item={matrixFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={matrixFile.alternate_accessions}
        />
        <ObjectPageHeader item={matrixFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={matrixFile}>
            <HostedFilePreview file={matrixFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={matrixFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={matrixFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={matrixFile}>
                {matrixFile.assembly && (
                  <>
                    <DataItemLabel>Genome Assembly</DataItemLabel>
                    <DataItemValue>{matrixFile.assembly}</DataItemValue>
                  </>
                )}
                {matrixFile.transcriptome_annotation && (
                  <>
                    <DataItemLabel>Transcriptome Annotation</DataItemLabel>
                    <DataItemValue>
                      {matrixFile.transcriptome_annotation}
                    </DataItemValue>
                  </>
                )}
              </FileDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <DataAreaTitle id="matrix-details">Matrix Details</DataAreaTitle>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Principal Dimension</DataItemLabel>
              <DataItemValue>{matrixFile.principal_dimension}</DataItemValue>
              <DataItemLabel>Secondary Dimensions</DataItemLabel>
              <DataItemValue>
                {matrixFile.secondary_dimensions.join(", ")}
              </DataItemValue>
            </DataArea>
          </DataPanel>
          <QualityMetricPanel qualityMetrics={qualityMetrics} />
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
            />
          )}
          {matrixFile.file_set.samples?.length > 0 && (
            <SampleTable samples={matrixFile.file_set.samples} />
          )}
          {referenceFiles.length > 0 && (
            <FileTable
              files={referenceFiles}
              title="Reference Files"
              panelId="reference"
            />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${matrixFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${matrixFile["@id"]}`}
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

MatrixFile.propTypes = {
  // MatrixFile object to display
  matrixFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array.isRequired,
  // The file is derived from
  derivedFrom: PropTypes.array.isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // Quality metrics associated with this file
  qualityMetrics: PropTypes.arrayOf(PropTypes.object),
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
  const matrixFile = (
    await request.getObject(`/matrix-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(matrixFile)) {
    const documents = matrixFile.documents
      ? await requestDocuments(matrixFile.documents, request)
      : [];
    const derivedFrom = matrixFile.derived_from
      ? await requestFiles(matrixFile.derived_from, request)
      : [];
    const inputFileFor =
      matrixFile.input_file_for.length > 0
        ? await requestFiles(matrixFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (matrixFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        matrixFile.file_format_specifications.map(
          (document) => document["@id"]
        );
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    const referenceFiles = matrixFile.reference_files
      ? await requestFiles(matrixFile.reference_files, request)
      : [];
    const qualityMetrics =
      matrixFile.quality_metrics.length > 0
        ? await requestQualityMetrics(matrixFile.quality_metrics, request)
        : [];
    const attribution = await buildAttribution(matrixFile, req.headers.cookie);
    return {
      props: {
        matrixFile,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        qualityMetrics,
        pageContext: { title: matrixFile.accession },
        attribution,
        referenceFiles,
        isJson,
      },
    };
  }
  return errorObjectToProps(matrixFile);
}

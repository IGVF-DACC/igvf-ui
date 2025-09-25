// node_modules
import _ from "lodash";
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
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { QualityMetricPanel } from "../../components/quality-metric";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
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

export default function AlignmentFile({
  attribution,
  alignmentFile,
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  workflows,
  referenceFiles,
  qualityMetrics,
  analysisStepVersion,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={alignmentFile} />
      <EditableItem item={alignmentFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={alignmentFile.alternate_accessions}
        />
        <ObjectPageHeader item={alignmentFile} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={alignmentFile} />
          <FileHeaderDownload file={alignmentFile}>
            <HostedFilePreview file={alignmentFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={alignmentFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={alignmentFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems
                item={alignmentFile}
                analysisStepVersion={analysisStepVersion}
              />
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <DataAreaTitle id="alignment-details">
            Alignment Details
          </DataAreaTitle>
          <DataPanel>
            <DataArea>
              {referenceFiles.length > 0 && (
                <>
                  <DataItemLabel>Reference Files</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {referenceFiles.map((file) => (
                        <Link href={file["@id"]} key={file["@id"]}>
                          {file.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {alignmentFile.redacted && (
                <>
                  <DataItemLabel>Redacted</DataItemLabel>
                  <DataItemValue>True</DataItemValue>
                </>
              )}
              {alignmentFile.filtered && (
                <>
                  <DataItemLabel>Filtered</DataItemLabel>
                  <DataItemValue>True</DataItemValue>
                </>
              )}
              {alignmentFile.assembly && (
                <>
                  <DataItemLabel>Genome Assembly</DataItemLabel>
                  <DataItemValue>{alignmentFile.assembly}</DataItemValue>
                </>
              )}
              {alignmentFile.transcriptome_annotation && (
                <>
                  <DataItemLabel>Transcriptome Annotation</DataItemLabel>
                  <DataItemValue>
                    {alignmentFile.transcriptome_annotation}
                  </DataItemValue>
                </>
              )}
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
          {alignmentFile.file_set.samples?.length > 0 && (
            <SampleTable samples={alignmentFile.file_set.samples} />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${alignmentFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${alignmentFile["@id"]}`}
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

AlignmentFile.propTypes = {
  // AlignmentFile object to display
  alignmentFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array.isRequired,
  // The file is derived from
  derivedFrom: PropTypes.array.isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // Workflows that processed this file
  workflows: PropTypes.arrayOf(PropTypes.object),
  // Quality metrics associated with this file
  qualityMetrics: PropTypes.arrayOf(PropTypes.object),
  // Analysis step version associated with this file
  analysisStepVersion: PropTypes.object,
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
  const alignmentFile = (
    await request.getObject(`/alignment-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(alignmentFile)) {
    const documents = alignmentFile.documents
      ? await requestDocuments(alignmentFile.documents, request)
      : [];
    const derivedFrom = alignmentFile.derived_from
      ? await requestFiles(alignmentFile.derived_from, request)
      : [];
    const inputFileFor =
      alignmentFile.input_file_for?.length > 0
        ? await requestFiles(alignmentFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (alignmentFile.file_format_specifications) {
      const fileFormatSpecificationsPaths =
        alignmentFile.file_format_specifications.map(
          (document) => document["@id"]
        );
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    const referenceFiles = alignmentFile.reference_files
      ? await requestFiles(alignmentFile.reference_files, request)
      : [];
    let workflows = [];
    if (alignmentFile.workflows?.length > 0) {
      const workflowPaths = alignmentFile.workflows.map(
        (workflow) => workflow["@id"]
      );
      workflows = await requestWorkflows(workflowPaths, request);
    }
    const qualityMetrics =
      alignmentFile.quality_metrics?.length > 0
        ? await requestQualityMetrics(alignmentFile.quality_metrics, request)
        : [];
    const analysisStepVersionId = _.get(
      alignmentFile,
      "analysis_step_version.@id"
    );
    const analysisStepVersion = analysisStepVersionId
      ? (await request.getObject(analysisStepVersionId)).optional()
      : null;
    const attribution = await buildAttribution(
      alignmentFile,
      req.headers.cookie
    );
    return {
      props: {
        alignmentFile,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        workflows,
        qualityMetrics,
        analysisStepVersion,
        pageContext: { title: alignmentFile.accession },
        attribution,
        referenceFiles,
        isJson,
      },
    };
  }
  return errorObjectToProps(alignmentFile);
}

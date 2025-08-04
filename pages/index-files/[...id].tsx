// node_modules
import { GetServerSidePropsContext } from "next";
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
  DataItemValueBoolean,
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
import { type ErrorObject } from "../../lib/fetch-request.d";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { type QualityMetricObject } from "../../lib/quality-metric";
import { isJsonFormat } from "../../lib/query-utils";
import { type WorkflowObject } from "../../lib/workflow";
// root
import type { FileObject } from "../../globals.d";

interface IndexFileObject extends FileObject {
  assembly?: string;
  filtered?: boolean;
  redacted?: boolean;
  transcriptome_annotation?: string;
}

export default function IndexFile({
  indexFile,
  attribution,
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  workflows,
  qualityMetrics,
  isJson,
}: {
  indexFile: IndexFileObject;
  attribution: any;
  documents: any[];
  derivedFrom: any[];
  inputFileFor: FileObject[];
  fileFormatSpecifications: any[];
  workflows: WorkflowObject[];
  qualityMetrics: QualityMetricObject[];
  isJson: boolean;
}) {
  const sections = useSecDir({ isJson });

  const hasReferencePanel =
    indexFile.assembly || indexFile.transcriptome_annotation;
  const hasAlignmentPanel = "filtered" in indexFile || "redacted" in indexFile;

  return (
    <>
      <Breadcrumbs item={indexFile} />
      <EditableItem item={indexFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={indexFile.alternate_accessions}
        />
        <ObjectPageHeader item={indexFile} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={indexFile} />
          <FileHeaderDownload file={indexFile}>
            <HostedFilePreview file={indexFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={indexFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={indexFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={indexFile} />
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {hasReferencePanel && (
            <>
              <DataAreaTitle id="reference-source-details">
                Reference Source Details
              </DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {indexFile.assembly && (
                    <>
                      <DataItemLabel>Genome Assembly</DataItemLabel>
                      <DataItemValue>{indexFile.assembly}</DataItemValue>
                    </>
                  )}
                  {indexFile.transcriptome_annotation && (
                    <>
                      <DataItemLabel>Transcriptome Annotation</DataItemLabel>
                      <DataItemValue>
                        {indexFile.transcriptome_annotation}
                      </DataItemValue>
                    </>
                  )}
                </DataArea>
              </DataPanel>
            </>
          )}
          {hasAlignmentPanel && (
            <>
              <DataAreaTitle id="alignment-details">
                Alignment Details
              </DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {"filtered" in indexFile && (
                    <>
                      <DataItemLabel>Filtered</DataItemLabel>
                      <DataItemValueBoolean>
                        {indexFile.filtered}
                      </DataItemValueBoolean>
                    </>
                  )}
                  {"redacted" in indexFile && (
                    <>
                      <DataItemLabel>Redacted</DataItemLabel>
                      <DataItemValueBoolean>
                        {indexFile.redacted}
                      </DataItemValueBoolean>
                    </>
                  )}
                </DataArea>
              </DataPanel>
            </>
          )}
          {workflows.length > 0 && <WorkflowTable workflows={workflows} />}
          <QualityMetricPanel qualityMetrics={qualityMetrics} />
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
              panelId="file-format-specifications"
            />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${indexFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${indexFile["@id"]}`}
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

type Params = {
  id: string[];
};

// export async function getServerSideProps({ params, req, query, resolvedUrl }) {
export async function getServerSideProps(
  context: GetServerSidePropsContext<Params>
) {
  const { req, query, resolvedUrl, params } = context;

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
  const indexFile = (
    await request.getObject(`/image-files/${params.id}/`)
  ).union() as IndexFileObject;
  if (FetchRequest.isResponseSuccess(indexFile)) {
    const documents = indexFile.documents
      ? await requestDocuments(indexFile.documents as string[], request)
      : [];

    const derivedFrom = indexFile.derived_from
      ? await requestFiles(indexFile.derived_from, request)
      : [];

    const inputFileFor =
      indexFile.input_file_for?.length > 0
        ? await requestFiles(indexFile.input_file_for as string[], request)
        : [];

    let fileFormatSpecifications = [];
    if (indexFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        indexFile.file_format_specifications.map((document) => document["@id"]);
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }

    let workflows: WorkflowObject[] = [];
    const fileWorkflows = (indexFile.workflows || []) as WorkflowObject[];
    if (fileWorkflows.length > 0) {
      const workflowPaths = fileWorkflows.map((workflow) => workflow["@id"]);
      workflows = (await requestWorkflows(
        workflowPaths,
        request
      )) as WorkflowObject[];
    }

    const qualityMetrics =
      indexFile.quality_metrics?.length > 0
        ? await requestQualityMetrics(indexFile.quality_metrics, request)
        : [];

    const attribution = await buildAttribution(indexFile, req.headers.cookie);

    return {
      props: {
        indexFile,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        workflows,
        qualityMetrics,
        pageContext: { title: indexFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(indexFile as ErrorObject);
}

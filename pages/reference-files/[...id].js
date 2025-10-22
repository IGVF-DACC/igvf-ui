// node_modules
import PropTypes from "prop-types";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataItemValueUrl,
  DataPanel,
} from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import FileSetTable from "../../components/file-set-table";
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
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
  requestQualityMetrics,
  requestSupersedes,
  requestWorkflows,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function ReferenceFile({
  referenceFile,
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  integratedIn,
  workflows,
  qualityMetrics,
  supersedes,
  supersededBy,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={referenceFile} />
      <EditableItem item={referenceFile}>
        <PagePreamble sections={sections} />
        <AlternativeIdentifiers
          alternateAccessions={referenceFile.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={referenceFile} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={referenceFile} />
          <FileHeaderDownload file={referenceFile}>
            <HostedFilePreview file={referenceFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={referenceFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={referenceFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={referenceFile} />
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {(referenceFile.assembly ||
            referenceFile.source_url ||
            referenceFile.transcriptome_annotation) && (
            <>
              <DataAreaTitle id="reference-source-details">
                Reference Source Details
              </DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {referenceFile.assembly && (
                    <>
                      <DataItemLabel>Genome Assembly</DataItemLabel>
                      <DataItemValue>{referenceFile.assembly}</DataItemValue>
                    </>
                  )}
                  {referenceFile.transcriptome_annotation && (
                    <>
                      <DataItemLabel>Transcriptome Annotation</DataItemLabel>
                      <DataItemValue>
                        {referenceFile.transcriptome_annotation}
                      </DataItemValue>
                    </>
                  )}
                  {referenceFile.source_url && (
                    <>
                      <DataItemLabel>Source URL</DataItemLabel>
                      <DataItemValueUrl>
                        <a
                          href={referenceFile.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {referenceFile.source_url}
                        </a>
                      </DataItemValueUrl>
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
          {referenceFile.file_set.samples?.length > 0 && (
            <SampleTable samples={referenceFile.file_set.samples} />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${referenceFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${referenceFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
              panelId="input-file-for"
            />
          )}
          {integratedIn.length > 0 && (
            <FileSetTable
              fileSets={integratedIn}
              title="Integrated In"
              reportLink={`/multireport/?type=ConstructLibrarySet&integrated_content_files.@id=${referenceFile["@id"]}`}
              reportLabel={`View ConstructLibrarySets integrated with ${referenceFile.accession}`}
              panelId="integrated-in"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

ReferenceFile.propTypes = {
  // ReferenceFile object to display
  referenceFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // ConstructLibraryset this file was integrated in
  integratedIn: PropTypes.arrayOf(PropTypes.object),
  // Workflows that processed this file
  workflows: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Quality metrics associated with this file
  qualityMetrics: PropTypes.arrayOf(PropTypes.object),
  // Files that this file supersedes
  supersedes: PropTypes.arrayOf(PropTypes.object),
  // Files that supersede this file
  supersededBy: PropTypes.arrayOf(PropTypes.object),
  // Attribution for this ReferenceFile
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
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
  const referenceFile = (
    await request.getObject(`/reference-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(referenceFile)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      referenceFile,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const documents = referenceFile.documents
      ? await requestDocuments(referenceFile.documents, request)
      : [];
    const derivedFrom = referenceFile.derived_from
      ? await requestFiles(referenceFile.derived_from, request)
      : [];
    const inputFileFor =
      referenceFile.input_file_for?.length > 0
        ? await requestFiles(referenceFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (referenceFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        referenceFile.file_format_specifications.map(
          (document) => document["@id"]
        );
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    let integratedIn = [];
    if (referenceFile.integrated_in?.length > 0) {
      const integratedInPaths = referenceFile.integrated_in.map(
        (fileSet) => fileSet["@id"]
      );
      integratedIn = await requestFileSets(integratedInPaths, request);
    }
    let workflows = [];
    if (referenceFile.workflows?.length > 0) {
      const workflowPaths = referenceFile.workflows.map(
        (workflow) => workflow["@id"]
      );
      workflows = await requestWorkflows(workflowPaths, request);
    }
    const qualityMetrics =
      referenceFile.quality_metrics?.length > 0
        ? await requestQualityMetrics(referenceFile.quality_metrics, request)
        : [];
    const { supersedes, supersededBy } = await requestSupersedes(
      referenceFile,
      "File",
      request
    );
    const attribution = await buildAttribution(
      referenceFile,
      req.headers.cookie
    );
    return {
      props: {
        referenceFile,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        integratedIn,
        workflows,
        qualityMetrics,
        supersedes,
        supersededBy,
        pageContext: { title: referenceFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(referenceFile);
}

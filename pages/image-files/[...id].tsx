// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import {
  DataArea,
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
import {
  imageFileHasThumbnail,
  ImageFileThumbnailAndPreview,
} from "../../components/image-file-thumbnail";
import JsonDisplay from "../../components/json-display";
import LinkedIdAndStatus from "../../components/linked-id-and-status";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { QualityMetricPanel } from "../../components/quality-metric";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
import WorkflowTable from "../../components/workflow-table";
// lib
import buildAttribution, { type AttributionData } from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestQualityMetrics,
  requestSupersedes,
  requestWorkflows,
} from "../../lib/common-requests";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  isDatabaseObject,
  isDatabaseObjectArrayOfType,
  pathsFromDatabaseObjects,
} from "../../lib/database-object";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { type QualityMetricObject } from "../../lib/quality-metric";
import { isJsonFormat } from "../../lib/query-utils";
import { isPathArray } from "../../lib/types";
import { type WorkflowObject } from "../../lib/workflow";
// root
import type { DatabaseObject, DocumentObject, FileObject } from "../../globals";

/**
 * Props for the ImageFile page component.
 *
 * @property imageFile - File object representing the image file to display
 * @property attribution - Attribution data for the image file
 * @property documents - Document objects associated with the image file
 * @property derivedFrom - File objects that this image file derives from
 * @property inputFileFor - File objects that derive from this image file
 * @property fileFormatSpecifications - Document objects specifying the file format
 * @property workflows - Workflow objects that processed this image file
 * @property qualityMetrics - QualityMetric objects associated with this image file
 * @property supersedes - FileSet objects that this image file supersedes
 * @property supersededBy - FileSet objects that supersede this image file
 * @property isJson - Boolean indicating whether the page is being viewed in JSON format
 */
interface ThisPageProps {
  imageFile: FileObject;
  attribution: AttributionData;
  documents: DocumentObject[];
  derivedFrom: FileObject[];
  inputFileFor: FileObject[];
  fileFormatSpecifications: DocumentObject[];
  workflows: WorkflowObject[];
  qualityMetrics: QualityMetricObject[];
  supersedes: DatabaseObject[];
  supersededBy: DatabaseObject[];
  isJson: boolean;
}

/**
 * ImageFile page component.
 */
export default function ImageFile({
  imageFile,
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  workflows,
  qualityMetrics,
  supersedes,
  supersededBy,
  attribution,
  isJson,
}: ThisPageProps) {
  const sections = useSecDir({ isJson });

  // Get the embedded samples from the file set, if they exist and are valid.
  const fileSet = isDatabaseObject(imageFile.file_set)
    ? imageFile.file_set
    : null;
  const samples =
    fileSet && isDatabaseObjectArrayOfType(fileSet.samples, "Sample")
      ? fileSet.samples
      : [];

  return (
    <>
      <Breadcrumbs item={imageFile} />
      <EditableItem item={imageFile}>
        <PagePreamble sections={sections} />
        <AlternativeIdentifiers
          alternateAccessions={imageFile.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
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
              <FileDataItems item={imageFile}>
                {imageFile.imaging_platform &&
                  typeof imageFile.imaging_platform === "object" && (
                    <>
                      <DataItemLabel>Imaging Platform</DataItemLabel>
                      <DataItemValue>
                        <LinkedIdAndStatus item={imageFile.imaging_platform}>
                          {imageFile.imaging_platform.term_name}
                        </LinkedIdAndStatus>
                      </DataItemValue>
                    </>
                  )}
                {imageFileHasThumbnail(imageFile) && (
                  <>
                    <DataItemLabel>Preview</DataItemLabel>
                    <DataItemValue>
                      <ImageFileThumbnailAndPreview imageFile={imageFile} />
                    </DataItemValue>
                  </>
                )}
              </FileDataItems>
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
          {samples.length > 0 && <SampleTable samples={samples} />}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${imageFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
              isDeletedVisible
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
    await request.getObject<FileObject>(`/image-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(imageFile)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      imageFile,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const documents = isPathArray(imageFile.documents)
      ? await requestDocuments(imageFile.documents, request)
      : [];
    const derivedFrom = isPathArray(imageFile.derived_from)
      ? await requestFiles(imageFile.derived_from, request)
      : [];
    const inputFileFor = isPathArray(imageFile.input_file_for)
      ? await requestFiles(imageFile.input_file_for, request)
      : [];

    const fileFormatSpecificationsPaths = pathsFromDatabaseObjects(
      imageFile.file_format_specifications
    );
    const fileFormatSpecifications =
      fileFormatSpecificationsPaths.length > 0
        ? await requestDocuments(fileFormatSpecificationsPaths, request)
        : [];

    const workflowPaths = pathsFromDatabaseObjects(imageFile.workflows);
    const workflows =
      workflowPaths.length > 0
        ? await requestWorkflows(workflowPaths, request)
        : [];

    const qualityMetrics = isPathArray(imageFile.quality_metrics)
      ? await requestQualityMetrics(imageFile.quality_metrics, request)
      : [];

    const { supersedes, supersededBy } = await requestSupersedes(
      imageFile,
      "File",
      request
    );
    const attribution = await buildAttribution(imageFile, req.headers.cookie);

    return {
      props: {
        imageFile,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        workflows,
        qualityMetrics,
        supersedes,
        supersededBy,
        attribution,
        isJson,
        pageContext: { title: imageFile.accession },
      } satisfies ThisPageProps & { pageContext: { title: string } },
    };
  }
  return errorObjectToProps(imageFile);
}

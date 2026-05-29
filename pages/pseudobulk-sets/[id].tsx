// node_modules
import { GetServerSidePropsContext, type GetServerSidePropsResult } from "next";
import { useContext, useEffect, useState } from "react";
// components
import AliasList from "../../components/alias-list";
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import { AnnotatedValue } from "../../components/annotated-value";
import Attribution from "../../components/attribution";
import { BatchDownloadFileSet } from "../../components/batch-download-fileset";
import Breadcrumbs from "../../components/breadcrumbs";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueAnnotated,
  DataPanel,
} from "../../components/data-area";
import { DataUseLimitationSummaries } from "../../components/data-use-limitation-status";
import DocumentTable from "../../components/document-table";
import { DoiControl } from "../../components/doi";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import { FileAccessionAndDownload } from "../../components/file-download";
import { FileGraph } from "../../components/file-graph";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import InputFileSets from "../../components/input-file-sets";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SessionContext from "../../components/session-context";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestFiles,
  requestSupersedes,
} from "../../lib/common-requests";
import { pathsFromDatabaseObjects } from "../../lib/database-object";
import { isDeprecatedStatus } from "../../lib/deprecated-files";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  requestAssociatedFileSets,
  requestFileSetDonors,
  requestFileSetPublications,
  requestFileSetSamples,
  type FileSetObject,
  type PseudobulkSetObject,
} from "../../lib/file-sets";
import {
  getAllDerivedFromFiles,
  getFilesFileSets,
  requestFilesReferenceFiles,
  requestFilesQualityMetrics,
} from "../../lib/files";
import { type PageProps } from "../../lib/next-js";
import {
  getAssayTitleDescriptionMap,
  getPreferredAssayTitleDescriptionMap,
} from "../../lib/ontology-terms";
import { isJsonFormat } from "../../lib/query-utils";
import { isEmbedded, isPathArray } from "../../lib/types";
// root
import type {
  DocumentObject,
  DonorObject,
  FileObject,
  PublicationObject,
} from "../../globals";
import { SampleObject } from "../../lib/samples";
import { QualityMetricObject } from "../../lib/quality-metric";

/**
 * Props for the pseudobulk set page component. This includes the pseudobulk set object itself, as well
 * as all associated objects that are needed to display the page, such as files, samples, donors, and
 * publications. These associated objects are retrieved in `getServerSideProps` and passed as props to
 * the page component to avoid having to make multiple client-side requests to retrieve these objects
 * after the page loads.
 */
interface ThisPageProps extends PageProps {
  pseudobulkSet: PseudobulkSetObject;
  files: FileObject[];
  fileFileSets: FileSetObject[];
  referenceFiles: FileObject[];
  derivedFromFiles: FileObject[];
  inputFileSets: FileSetObject[];
  inputFileSetSamples: SampleObject[];
  inputFileSetFor: FileSetObject[];
  controlFor: FileSetObject[];
  constructLibrarySets: FileSetObject[];
  samples: SampleObject[];
  donors: DonorObject[];
  qualityMetrics: QualityMetricObject[];
  assayTitleDescriptionMap: Record<string, string>;
  publications: PublicationObject[];
  documents: DocumentObject[];
  supersedes: FileSetObject[];
  supersededBy: FileSetObject[];
  isJson: boolean;
}

/**
 * Component for displaying a pseudobulk set object page.
 */
export default function PseudobulkSet({
  pseudobulkSet,
  publications,
  documents,
  files,
  fileFileSets,
  referenceFiles,
  derivedFromFiles,
  inputFileSets,
  inputFileSetSamples,
  inputFileSetFor,
  controlFor,
  constructLibrarySets,
  samples,
  donors,
  qualityMetrics,
  assayTitleDescriptionMap,
  supersedes,
  supersededBy,
  attribution,
  isJson,
}: ThisPageProps) {
  const sections = useSecDir({ isJson });
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);

  // State for whether to include deprecated files in the file table and graph.
  const [areDeprecatedFilesVisible, setAreDeprecatedFilesVisible] = useState(
    isDeprecatedStatus(pseudobulkSet.status ?? "")
  );

  useEffect(() => {
    // In case you navigate from one pseudobulk set directly to another, this page component
    // doesn't unmount, so set the initial visibility of deprecated files based on the new
    // pseudobulk set's status.
    setAreDeprecatedFilesVisible(
      isDeprecatedStatus(pseudobulkSet.status ?? "")
    );
  }, [pseudobulkSet["@id"]]);

  return (
    <>
      <Breadcrumbs item={pseudobulkSet} />
      <EditableItem item={pseudobulkSet}>
        <PagePreamble sections={sections} />
        <DoiControl doi={pseudobulkSet.doi} />
        <AlternativeIdentifiers
          alternateAccessions={pseudobulkSet.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={pseudobulkSet} isJsonFormat={isJson}>
          <BatchDownloadFileSet fileSet={pseudobulkSet} />
          <ControlledAccessIndicator item={pseudobulkSet} />
          <DataUseLimitationSummaries
            summaries={pseudobulkSet.data_use_limitation_summaries}
          />
        </ObjectPageHeader>
        <JsonDisplay item={pseudobulkSet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={pseudobulkSet} />
          <DataPanel>
            <DataArea>
              {pseudobulkSet.aliases && pseudobulkSet.aliases.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={pseudobulkSet.aliases} />
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>File Set Type</DataItemLabel>
              <DataItemValueAnnotated
                objectType={pseudobulkSet["@type"][0]}
                propertyName="file_set_type"
              >
                {pseudobulkSet.file_set_type}
              </DataItemValueAnnotated>
              {pseudobulkSet.summary && (
                <>
                  <DataItemLabel>Summary</DataItemLabel>
                  <DataItemValue>{pseudobulkSet.summary}</DataItemValue>
                </>
              )}
              {pseudobulkSet.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{pseudobulkSet.description}</DataItemValue>
                </>
              )}
              {pseudobulkSet.assay_titles &&
                pseudobulkSet.assay_titles.length > 0 && (
                  <>
                    <DataItemLabel>Assay Term Names</DataItemLabel>
                    <DataItemValueAnnotated
                      externalAnnotations={assayTitleDescriptionMap}
                    >
                      {pseudobulkSet.assay_titles}
                    </DataItemValueAnnotated>
                  </>
                )}
              {pseudobulkSet.preferred_assay_titles &&
                pseudobulkSet.preferred_assay_titles.length > 0 && (
                  <>
                    <DataItemLabel>Preferred Assay Titles</DataItemLabel>
                    <DataItemValueAnnotated
                      externalAnnotations={preferredAssayTitleDescriptionMap}
                    >
                      {pseudobulkSet.preferred_assay_titles}
                    </DataItemValueAnnotated>
                  </>
                )}
              {pseudobulkSet.cell_type &&
                isEmbedded(pseudobulkSet.cell_type) && (
                  <>
                    <DataItemLabel>Cell Annotation</DataItemLabel>
                    <DataItemValue>
                      {pseudobulkSet.cell_qualifier && (
                        <>{pseudobulkSet.cell_qualifier} </>
                      )}
                      <AnnotatedValue
                        externalAnnotations={{
                          [pseudobulkSet.cell_type.term_name]:
                            pseudobulkSet.cell_type.definition || "",
                        }}
                      >
                        {pseudobulkSet.cell_type.term_name}
                      </AnnotatedValue>
                    </DataItemValue>

                    <DataItemLabel>Cell Ontology ID</DataItemLabel>
                    <DataItemValue>
                      <Link href={pseudobulkSet.cell_type["@id"]}>
                        {pseudobulkSet.cell_type.term_id}
                      </Link>
                    </DataItemValue>
                  </>
                )}
              {referenceFiles.length > 0 && (
                <>
                  <DataItemLabel>Reference Files</DataItemLabel>
                  <DataItemValue className="@container/ref-file">
                    <DataItemList isCollapsible>
                      {referenceFiles.map((file) => (
                        <div
                          className="@md/ref-file:flex @md/ref-file:gap-1"
                          key={file["@id"]}
                        >
                          <FileAccessionAndDownload file={file} isInline />
                          <div>{file.summary}</div>
                        </div>
                      ))}
                    </DataItemList>
                  </DataItemValue>
                </>
              )}
              {publications.length > 0 && (
                <>
                  <DataItemLabel>Publications</DataItemLabel>
                  <DataItemList isCollapsible>
                    {publications.map((publication) => (
                      <Link key={publication["@id"]} href={publication["@id"]}>
                        {publication.title}
                      </Link>
                    ))}
                  </DataItemList>
                </>
              )}
              {pseudobulkSet.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>
                    {pseudobulkSet.submitter_comment}
                  </DataItemValue>
                </>
              )}
              {pseudobulkSet.revoke_detail && (
                <>
                  <DataItemLabel>Revoke Detail</DataItemLabel>
                  <DataItemValue>{pseudobulkSet.revoke_detail}</DataItemValue>
                </>
              )}
              {attribution && <Attribution attribution={attribution} />}
            </DataArea>
          </DataPanel>

          {files.length > 0 && (
            <>
              <FileTable
                files={files}
                fileSet={pseudobulkSet}
                isFilteredVisible
                hasDeprecatedOption
                externalDeprecated={{
                  visible: areDeprecatedFilesVisible,
                  setVisible: setAreDeprecatedFilesVisible,
                }}
              />
              <FileGraph
                files={files}
                referenceFiles={referenceFiles}
                fileFileSets={fileFileSets}
                derivedFromFiles={derivedFromFiles}
                qualityMetrics={qualityMetrics}
                fileId={pseudobulkSet.accession}
                externalDeprecated={{
                  visible: areDeprecatedFilesVisible,
                  setVisible: setAreDeprecatedFilesVisible,
                }}
              />
            </>
          )}

          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${pseudobulkSet["@id"]}`}
              reportLabel="Report of samples in this pseudobulk set"
              isConstructLibraryColumnVisible
            />
          )}

          {donors.length > 0 && <DonorTable donors={donors} />}

          {inputFileSets.length > 0 && (
            <InputFileSets
              thisFileSet={pseudobulkSet}
              fileSets={inputFileSets}
              samples={inputFileSetSamples}
              controlFileSets={[]}
              auxiliarySets={[]}
              measurementSets={[]}
              constructLibrarySets={constructLibrarySets}
            />
          )}

          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${pseudobulkSet["@id"]}`}
              reportLabel="Report of file sets that this pseudobulk set is an input for"
              title="File Sets Using This Analysis Set as an Input"
              panelId="input-file-set-for"
            />
          )}

          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${pseudobulkSet["@id"]}`}
              reportLabel="Report of file sets that this pseudobulk set serves as a control for"
              title="File Sets Controlled by This Analysis Set"
              panelId="control-for"
            />
          )}

          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

/**
 * Server-side function to fetch the pseudobulk set object and all associated objects needed to
 * display the page.
 */
export async function getServerSideProps({
  params,
  req,
  query,
  resolvedUrl,
}: GetServerSidePropsContext<{ id: string }>): Promise<
  GetServerSidePropsResult<ThisPageProps>
> {
  if (!params) {
    return { notFound: true };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const pseudobulkSet = (
    await request.getObject<PseudobulkSetObject>(
      `/pseudobulk-sets/${params.id}/`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(pseudobulkSet)) {
    // If the pseudobulk set's canonical URL doesn't match the resolved URL, redirect to the
    // canonical URL. This can happen if the pseudobulk set was accessed via an alternate accession
    // or a non-canonical URL.
    const canonicalRedirect = createCanonicalUrlRedirect(
      pseudobulkSet,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const documents = isPathArray(pseudobulkSet.documents)
      ? await requestDocuments(pseudobulkSet.documents, request)
      : [];
    const filePaths = pathsFromDatabaseObjects(pseudobulkSet.files);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];
    const referenceFiles = await requestFilesReferenceFiles(files, request);
    const derivedFromFiles = await getAllDerivedFromFiles(files, request);
    const combinedFiles = files.concat(derivedFromFiles);
    const fileFileSets = await getFilesFileSets(combinedFiles, request);
    const samples = await requestFileSetSamples([pseudobulkSet], request);
    const donors = await requestFileSetDonors(pseudobulkSet, request);
    const publications = await requestFileSetPublications(
      pseudobulkSet,
      request
    );
    const qualityMetrics = await requestFilesQualityMetrics(files, request);

    const inputFileSetFor = await requestAssociatedFileSets(
      [pseudobulkSet],
      "input_for",
      request
    );

    const controlFor = await requestAssociatedFileSets(
      [pseudobulkSet],
      "control_for",
      request
    );

    const inputFileSets = await requestAssociatedFileSets(
      [pseudobulkSet],
      "input_file_sets",
      request,
      ["analysis_set", "curated_set"]
    );

    let constructLibrarySets: FileSetObject[] = [];
    let inputFileSetSamples: SampleObject[] = [];
    if (inputFileSets.length > 0) {
      constructLibrarySets = await requestAssociatedFileSets(
        inputFileSets,
        "construct_library_sets",
        request
      );

      inputFileSetSamples = await requestFileSetSamples(inputFileSets, request);
    }

    const assayTitleDescriptionMap =
      pseudobulkSet.assay_titles && pseudobulkSet.assay_titles.length > 0
        ? await getAssayTitleDescriptionMap(pseudobulkSet.assay_titles, request)
        : {};

    const { supersedes, supersededBy } = await requestSupersedes<FileSetObject>(
      pseudobulkSet,
      "FileSet",
      request
    );

    const attribution = req.headers.cookie
      ? await buildAttribution(pseudobulkSet, req.headers.cookie)
      : null;

    return {
      props: {
        pseudobulkSet,
        publications,
        documents,
        files,
        fileFileSets,
        referenceFiles,
        derivedFromFiles,
        inputFileSets,
        inputFileSetSamples,
        inputFileSetFor,
        constructLibrarySets,
        controlFor,
        samples,
        donors,
        qualityMetrics,
        assayTitleDescriptionMap,
        supersedes,
        supersededBy,
        pageContext: { title: pseudobulkSet.accession ?? pseudobulkSet["@id"] },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(pseudobulkSet);
}

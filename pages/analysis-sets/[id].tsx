// node_modules
import _ from "lodash";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useContext, useEffect, useState } from "react";
// components
import AliasList from "../../components/alias-list";
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
import { BatchDownloadFileSet } from "../../components/batch-download-fileset";
import Breadcrumbs from "../../components/breadcrumbs";
import { ConstructLibraryTable } from "../../components/construct-library-table";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueAnnotated,
  DataItemValueUrl,
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
import SeparatedList from "../../components/separated-list";
import SessionContext from "../../components/session-context";
import { StatusPreviewDetail } from "../../components/status";
import { UniformPipelineStatus } from "../../components/uniform-pipeline-status";
// lib
import buildAttribution from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestFiles,
  requestGenes,
  requestOntologyTerms,
  requestSupersedes,
} from "../../lib/common-requests";
import { pathsFromDatabaseObjects } from "../../lib/database-object";
import { isDeprecatedStatus } from "../../lib/deprecated-files";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  requestAssociatedFileSets,
  requestPipelineParameters,
  requestFileSetDonors,
  requestFileSetPublications,
  requestFileSetSamples,
  requestFileSetAssociatedFiles,
  type AnalysisSetObject,
  type ConstructLibrarySetObject,
  type FileSetObject,
} from "../../lib/file-sets";
import {
  getAllDerivedFromFiles,
  getFilesFileSets,
  requestFilesQualityMetrics,
  requestFilesReferenceFiles,
} from "../../lib/files";
import { type PageProps } from "../../lib/next-js";
import {
  getAssayTitleDescriptionMap,
  getPreferredAssayTitleDescriptionMap,
  OntologyTermObject,
} from "../../lib/ontology-terms";
import { type QualityMetricObject } from "../../lib/quality-metric";
import { isJsonFormat } from "../../lib/query-utils";
import { type SampleObject } from "../../lib/samples";
// root
import type {
  DocumentObject,
  DonorObject,
  FileObject,
  GeneObject,
  PublicationObject,
} from "../../globals";

/**
 * Props for the analysis-set page, sourced from `getServerSideProps`.
 *
 * @property analysisSet - Analysis set object to display
 * @property publications - Publications associated with the analysis set
 * @property documents - Documents associated with the analysis set
 * @property files - Files associated with the analysis set
 * @property fileFileSets - File sets associated with the analysis set's files
 * @property referenceFiles - Reference files associated with the analysis set's files
 * @property derivedFromFiles - Files that are in the `derived_from` chains of the analysis set's
 *                              files
 * @property inputFileSets - Input file sets associated with the analysis set
 * @property inputFileSetSamples - Samples associated with the analysis set's input file sets
 * @property inputFileSetFor - File sets that the analysis set is an input for
 * @property controlFileSets - Control file sets associated with the analysis set
 * @property controlFor - File sets that the analysis set serves as a control for
 * @property auxiliarySets - Auxiliary sets associated with the analysis set's input file sets
 * @property measurementSets - Measurement sets associated with the analysis set's input file sets
 * @property constructLibrarySets - Construct library sets associated with the analysis set's input
 *                                  file sets
 * @property libraryDesignFiles - Library design files associated with the analysis set
 * @property clsLibraryDesignFiles - Library design files associated with the analysis set's construct
 *                                   library sets
 * @property samples - Samples associated with the analysis set
 * @property barcodeMapFiles - Sample barcode map files associated with the analysis set's samples
 * @property donors - Donors associated with the analysis set's samples
 * @property qualityMetrics - Quality metrics associated with the analysis set's files
 * @property assayTitleDescriptionMap - Map of assay titles to their descriptions for the analysis
 *                                      set
 * @property pipelineParametersDocuments - Documents associated with the analysis set's pipeline
 *                                         parameters
 * @property pipelineParametersFiles - Files associated with the analysis set's pipeline parameters
 * @property enrichmentDesigns - Enrichment design files associated with the analysis set's input
 *                               file sets
 * @property targetedGenes - Genes associated with the analysis set
 */
interface AnalysisSetPageProps extends PageProps {
  analysisSet: AnalysisSetObject;
  publications: PublicationObject[];
  documents: DocumentObject[];
  files: FileObject[];
  fileFileSets: FileSetObject[];
  referenceFiles: FileObject[];
  derivedFromFiles: FileObject[];
  inputFileSets: FileSetObject[];
  inputFileSetSamples: SampleObject[];
  inputFileSetFor: FileSetObject[];
  controlFileSets: FileSetObject[];
  controlFor: FileSetObject[];
  auxiliarySets: FileSetObject[];
  measurementSets: FileSetObject[];
  inputConstructLibrarySets: ConstructLibrarySetObject[];
  libraryDesignFiles: FileObject[];
  clsLibraryDesignFiles: FileObject[];
  samples: SampleObject[];
  donors: DonorObject[];
  qualityMetrics: QualityMetricObject[];
  assayTitleDescriptionMap: Record<string, string>;
  pipelineParametersDocuments: DocumentObject[];
  pipelineParametersFiles: FileObject[];
  functionalAssayMechanisms: OntologyTermObject[];
  enrichmentDesigns: FileObject[];
  targetedGenes: GeneObject[];
}

export default function AnalysisSet({
  analysisSet,
  publications,
  documents,
  files,
  fileFileSets,
  referenceFiles,
  derivedFromFiles,
  inputFileSets,
  inputFileSetSamples,
  inputFileSetFor,
  controlFileSets,
  controlFor,
  auxiliarySets,
  measurementSets,
  inputConstructLibrarySets,
  libraryDesignFiles,
  clsLibraryDesignFiles,
  samples,
  donors,
  qualityMetrics,
  assayTitleDescriptionMap,
  pipelineParametersDocuments,
  pipelineParametersFiles,
  functionalAssayMechanisms,
  enrichmentDesigns,
  targetedGenes,
  supersedes,
  supersededBy,
  attribution = null,
  isJson,
}: AnalysisSetPageProps) {
  const sections = useSecDir({ isJson });
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);

  // State for whether to include deprecated files in the file table and graph.
  const [areDeprecatedFilesVisible, setAreDeprecatedFilesVisible] = useState(
    isDeprecatedStatus(analysisSet.status)
  );

  useEffect(() => {
    // In case you navigate from one analysis set directly to another, this page component
    // doesn't unmount, so set the initial visibility of deprecated files based on the new
    // analysis set's status.
    setAreDeprecatedFilesVisible(isDeprecatedStatus(analysisSet.status));
  }, [analysisSet["@id"]]);

  return (
    <>
      <Breadcrumbs item={analysisSet} />
      <EditableItem item={analysisSet}>
        <PagePreamble sections={sections} />
        <DoiControl doi={analysisSet.doi} />
        <AlternativeIdentifiers
          alternateAccessions={analysisSet.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={analysisSet} isJsonFormat={isJson}>
          <BatchDownloadFileSet fileSet={analysisSet} />
          <ControlledAccessIndicator item={analysisSet} />
          <DataUseLimitationSummaries
            summaries={analysisSet.data_use_limitation_summaries}
          />
        </ObjectPageHeader>
        <JsonDisplay item={analysisSet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={analysisSet} />
          <DataPanel>
            <DataArea>
              {analysisSet.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={analysisSet.aliases} />
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>File Set Type</DataItemLabel>
              <DataItemValueAnnotated
                objectType={analysisSet["@type"][0]}
                propertyName="file_set_type"
              >
                {analysisSet.file_set_type}
              </DataItemValueAnnotated>
              {analysisSet.summary && (
                <>
                  <DataItemLabel>Summary</DataItemLabel>
                  <DataItemValue>{analysisSet.summary}</DataItemValue>
                </>
              )}
              {analysisSet.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{analysisSet.description}</DataItemValue>
                </>
              )}
              {analysisSet.assay_titles?.length > 0 && (
                <>
                  <DataItemLabel>Assay Term Names</DataItemLabel>
                  <DataItemValueAnnotated
                    externalAnnotations={assayTitleDescriptionMap}
                  >
                    {analysisSet.assay_titles}
                  </DataItemValueAnnotated>
                </>
              )}
              {analysisSet.preferred_assay_titles?.length > 0 && (
                <>
                  <DataItemLabel>Preferred Assay Titles</DataItemLabel>
                  <DataItemValueAnnotated
                    externalAnnotations={preferredAssayTitleDescriptionMap}
                  >
                    {analysisSet.preferred_assay_titles}
                  </DataItemValueAnnotated>
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
              {functionalAssayMechanisms.length > 0 && (
                <>
                  <DataItemLabel>Functional Assay Mechanisms</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {functionalAssayMechanisms.map((phenotypeTerm) => (
                        <Link
                          href={phenotypeTerm["@id"]}
                          key={phenotypeTerm.term_id}
                        >
                          {phenotypeTerm.term_name}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {targetedGenes.length > 0 && (
                <>
                  <DataItemLabel>Targeted Genes</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {targetedGenes.map((gene) => (
                        <Link href={gene["@id"]} key={gene["@id"]}>
                          {gene.symbol}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {analysisSet.uniform_pipeline_status && (
                <>
                  <DataItemLabel>Uniform Pipeline Status</DataItemLabel>
                  <DataItemValue>
                    <UniformPipelineStatus
                      status={analysisSet.uniform_pipeline_status}
                      atType={analysisSet["@type"][0]}
                      objectId={analysisSet["@id"]}
                    />
                  </DataItemValue>
                </>
              )}
              {analysisSet.external_image_data_url && (
                <>
                  <DataItemLabel>External Image Data URL</DataItemLabel>
                  <DataItemValueUrl>
                    <a
                      href={analysisSet.external_image_data_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {analysisSet.external_image_data_url}
                    </a>
                  </DataItemValueUrl>
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
              {analysisSet.sample_summary && (
                <>
                  <DataItemLabel>Samples</DataItemLabel>
                  <DataItemValue>{analysisSet.sample_summary}</DataItemValue>
                </>
              )}
              {analysisSet.protocols?.length > 0 && (
                <>
                  <DataItemLabel>Protocols</DataItemLabel>
                  <DataItemList isCollapsible isUrlList>
                    {analysisSet.protocols.map((protocol) => (
                      <a
                        href={protocol}
                        key={protocol}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {protocol}
                      </a>
                    ))}
                  </DataItemList>
                </>
              )}
              {analysisSet.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{analysisSet.submitter_comment}</DataItemValue>
                </>
              )}
              {analysisSet.revoke_detail && (
                <>
                  <DataItemLabel>Revoke Detail</DataItemLabel>
                  <DataItemValue>{analysisSet.revoke_detail}</DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>

          {files.length > 0 && (
            <>
              <FileTable
                files={files}
                fileSet={analysisSet}
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
                fileId={analysisSet.accession}
                externalDeprecated={{
                  visible: areDeprecatedFilesVisible,
                  setVisible: setAreDeprecatedFilesVisible,
                }}
              />
            </>
          )}

          {libraryDesignFiles.length > 0 && (
            <FileTable
              files={libraryDesignFiles}
              title="Library Design Files"
              secDirTitle="Library Design Files"
              panelId="library-design-files"
            />
          )}

          {enrichmentDesigns.length > 0 && (
            <FileTable
              title="Input File Set Enrichment Designs"
              files={enrichmentDesigns}
              secDirTitle="Input File Set Enrichment Designs"
              panelId="enrichment-designs"
            />
          )}

          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${analysisSet["@id"]}`}
              reportLabel="Report of samples in this analysis set"
              isConstructLibraryColumnVisible
            />
          )}

          {donors.length > 0 && <DonorTable donors={donors} />}

          {inputConstructLibrarySets.length > 0 && (
            <ConstructLibraryTable
              constructLibrarySets={inputConstructLibrarySets}
              libraryDesignFiles={clsLibraryDesignFiles}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
            />
          )}

          {inputFileSets.length > 0 && (
            <InputFileSets
              thisFileSet={analysisSet}
              fileSets={inputFileSets}
              samples={inputFileSetSamples}
              controlFileSets={controlFileSets}
              auxiliarySets={auxiliarySets}
              measurementSets={measurementSets}
              constructLibrarySets={inputConstructLibrarySets}
              excludedTypes={["ConstructLibrarySet"]}
            />
          )}

          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${analysisSet["@id"]}`}
              reportLabel="Report of file sets that this analysis set is an input for"
              title="File Sets Using This Analysis Set as an Input"
              panelId="input-file-set-for"
              fileSetMeta={{ showCellColumns: true }}
            />
          )}

          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${analysisSet["@id"]}`}
              reportLabel="Report of file sets that this analysis set serves as a control for"
              title="File Sets Controlled by This Analysis Set"
              panelId="control-for"
            />
          )}

          {pipelineParametersDocuments.length > 0 && (
            <DocumentTable
              title="Pipeline Parameters Documents"
              documents={pipelineParametersDocuments}
              panelId="pipeline-parameters-documents"
            />
          )}

          {pipelineParametersFiles.length > 0 && (
            <FileTable
              title="Pipeline Parameters Files"
              files={pipelineParametersFiles}
              panelId="pipeline-parameters-files"
            />
          )}

          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

export async function getServerSideProps({
  params,
  req,
  query,
  resolvedUrl,
}: GetServerSidePropsContext<{ id: string }>): Promise<
  GetServerSidePropsResult<AnalysisSetPageProps>
> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisSet = (
    await request.getObject<AnalysisSetObject>(`/analysis-sets/${params.id}/`)
  ).union();

  if (FetchRequest.isResponseSuccess(analysisSet)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      analysisSet,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const documents =
      analysisSet.documents?.length > 0
        ? await requestDocuments(
            pathsFromDatabaseObjects(analysisSet.documents),
            request
          )
        : [];

    const files =
      analysisSet.files?.length > 0
        ? await requestFiles(
            pathsFromDatabaseObjects(analysisSet.files),
            request
          )
        : [];

    // Get the paths of all files that are in `files`' `derived_from` array property. Combine and
    // deduplicate them, and then request them from the server. Repeat this process with those
    // files until we have no more files with `derived_from` properties.
    const derivedFromFiles = await getAllDerivedFromFiles(files, request);
    const combinedFiles = files.concat(derivedFromFiles);

    // Request reference files associated with the analysis set's files
    const referenceFiles = await requestFilesReferenceFiles(files, request);

    // Request file sets associated with the analysis set's files and their derived-from files.
    const fileFileSets = await getFilesFileSets(combinedFiles, request);

    // Request objects associated with the analysis set.
    const samples = await requestFileSetSamples([analysisSet], request);
    const donors = await requestFileSetDonors(analysisSet, request);
    const publications = await requestFileSetPublications(analysisSet, request);
    const constructLibrarySets =
      await requestAssociatedFileSets<ConstructLibrarySetObject>(
        [analysisSet],
        "construct_library_sets",
        request,
        ["integrated_content_files"]
      );
    const libraryDesignFiles = await requestFileSetAssociatedFiles(
      constructLibrarySets,
      "integrated_content_files",
      request
    );

    const inputFileSets = await requestAssociatedFileSets(
      [analysisSet],
      "input_file_sets",
      request,
      ["auxiliary_sets", "control_file_sets", "measurement_sets"]
    );

    const inputFileSetFor = await requestAssociatedFileSets(
      [analysisSet],
      "input_for",
      request
    );

    const controlFor = await requestAssociatedFileSets(
      [analysisSet],
      "control_for",
      request
    );

    // Request file sets associated with the analysis set's input file sets.
    const auxiliarySets = await requestAssociatedFileSets(
      inputFileSets,
      "auxiliary_sets",
      request
    );
    const measurementSets = await requestAssociatedFileSets(
      inputFileSets,
      "measurement_sets",
      request
    );
    const controlFileSets = await requestAssociatedFileSets(
      inputFileSets,
      "control_file_sets",
      request
    );
    const inputConstructLibrarySets =
      await requestAssociatedFileSets<ConstructLibrarySetObject>(
        inputFileSets,
        "construct_library_sets",
        request,
        ["integrated_content_files"]
      );
    const clsLibraryDesignFiles = await requestFileSetAssociatedFiles(
      inputConstructLibrarySets,
      "integrated_content_files",
      request
    );

    const inputFileSetSamples = await requestFileSetSamples(
      inputFileSets,
      request
    );

    const functionalAssayMechanismPaths = pathsFromDatabaseObjects(
      analysisSet.functional_assay_mechanisms
    );
    const functionalAssayMechanisms =
      functionalAssayMechanismPaths.length > 0
        ? await requestOntologyTerms(functionalAssayMechanismPaths, request)
        : [];

    const qualityMetrics = await requestFilesQualityMetrics(files, request);

    // `pipeline_parameters` can contain both `/documents/id` and `/tabular-files/id`. Put these
    // into groups `documents` and `tabular-files`, then request the corresponding objects.
    const {
      files: pipelineParametersFiles,
      documents: pipelineParametersDocuments,
    } = await requestPipelineParameters(analysisSet, request);

    const enrichmentDesigns = await requestFileSetAssociatedFiles(
      [analysisSet],
      "enrichment_designs",
      request
    );

    const assayTitleDescriptionMap =
      analysisSet.assay_titles?.length > 0
        ? await getAssayTitleDescriptionMap(analysisSet.assay_titles, request)
        : {};

    const targetedGenes =
      analysisSet.targeted_genes?.length > 0
        ? await requestGenes(
            pathsFromDatabaseObjects(analysisSet.targeted_genes),
            request
          )
        : [];

    const { supersedes, supersededBy } = await requestSupersedes(
      analysisSet,
      "FileSet",
      request
    );

    const attribution = await buildAttribution(analysisSet, req.headers.cookie);
    return {
      props: {
        analysisSet,
        publications,
        documents,
        files,
        fileFileSets,
        referenceFiles,
        derivedFromFiles,
        inputFileSets,
        inputFileSetSamples,
        inputFileSetFor,
        controlFileSets,
        controlFor,
        auxiliarySets,
        measurementSets,
        inputConstructLibrarySets,
        libraryDesignFiles,
        clsLibraryDesignFiles,
        samples,
        donors,
        qualityMetrics,
        assayTitleDescriptionMap,
        pipelineParametersDocuments,
        pipelineParametersFiles,
        functionalAssayMechanisms,
        enrichmentDesigns,
        targetedGenes,
        supersedes,
        supersededBy,
        pageContext: { title: analysisSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}

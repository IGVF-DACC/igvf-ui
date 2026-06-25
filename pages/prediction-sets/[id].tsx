// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useEffect, useState } from "react";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
import { BatchDownloadFileSet } from "../../components/batch-download-fileset";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import ChromosomeLocations from "../../components/chromosome-locations";
import { ConstructLibraryTable } from "../../components/construct-library-table";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { DataUseLimitationSummaries } from "../../components/data-use-limitation-status";
import DocumentTable from "../../components/document-table";
import { DoiControl } from "../../components/doi";
import { EditableItem } from "../../components/edit";
import { FileAccessionAndDownload } from "../../components/file-download";
import { FileGraph } from "../../components/file-graph";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { SampleAnnotatedSummary } from "../../components/sample-annotated-summary";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestFiles,
  requestGenes,
  requestSupersedes,
} from "../../lib/common-requests";
import {
  isDatabaseObject,
  isDatabaseObjectArray,
  pathsFromDatabaseObjects,
} from "../../lib/database-object";
import { isDeprecatedStatus } from "../../lib/deprecated-files";
import DonorTable from "../../components/donor-table";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  requestAssociatedFileSets,
  requestFileSetDonors,
  requestFileSetPublications,
  requestFileSetSamples,
  type FileSetObject,
  type PredictionSetObject,
} from "../../lib/file-sets";
import {
  getAllDerivedFromFiles,
  getFilesFileSets,
  requestFilesQualityMetrics,
  requestFilesReferenceFiles,
} from "../../lib/files";
import { PageProps } from "../../lib/next-js";
import { SampleTermObject } from "../../lib/ontology-terms";
import { type QualityMetricObject } from "../../lib/quality-metric";
import { isJsonFormat } from "../../lib/query-utils";
import { getSamplesTerms, type SampleObject } from "../../lib/samples";
import { isEmbedded, isPathArray } from "../../lib/types";
// root
import {
  type DocumentObject,
  type DonorObject,
  type FileObject,
  type GeneObject,
  type PublicationObject,
} from "../../globals";

/**
 * Props for the prediction set page, sourced from `getServerSideProps`.
 *
 * @param predictionSet - Prediction set object to display
 * @param inputFileSets - Input file sets that this prediction set is an input for
 * @param inputFileSetFor - Input file sets for this prediction set
 * @param controlFor - Control file sets for this prediction set
 * @param documents - Documents associated with this prediction set
 * @param publications - Publications associated with this prediction set
 * @param files - Files to display
 * @param fileFileSets - File sets that `files` refer to in their `file_sets` property
 * @param referenceFiles - Reference files to display
 * @param derivedFromFiles - All derived_from files not included in `files`
 * @param samples - Samples associated with this prediction set
 * @param donors - Donors associated with this prediction set
 * @param assessedGenes - Genes that are assessed in this prediction set
 * @param qualityMetrics - Quality metrics associated with this analysis set
 */
interface PredictionSetPageProps extends PageProps {
  predictionSet: PredictionSetObject;
  inputFileSets: FileSetObject[];
  inputFileSetFor: FileSetObject[];
  controlFor: FileSetObject[];
  documents: DocumentObject[];
  publications: PublicationObject[];
  files: FileObject[];
  fileFileSets: FileSetObject[];
  referenceFiles: FileObject[];
  derivedFromFiles: FileObject[];
  samples: SampleObject[];
  samplesTerms: SampleTermObject[];
  donors: DonorObject[];
  assessedGenes: GeneObject[];
  qualityMetrics: QualityMetricObject[];
}

export default function PredictionSet({
  predictionSet,
  inputFileSets,
  inputFileSetFor,
  controlFor,
  documents,
  publications,
  files,
  fileFileSets,
  referenceFiles,
  derivedFromFiles,
  samples,
  samplesTerms,
  donors,
  assessedGenes,
  qualityMetrics,
  supersedes,
  supersededBy,
  attribution,
  isJson,
}: PredictionSetPageProps) {
  const sections = useSecDir({ isJson });

  // State for whether to include deprecated files in the file table and graph.
  const [areDeprecatedFilesVisible, setAreDeprecatedFilesVisible] = useState(
    isDeprecatedStatus(predictionSet.status)
  );

  // Combine all sample-associated terms to pass to the SampleAnnotatedSummary component, ensuring that if the pseudobulk set has a cell type, it is included as a term (since the cell annotation may reference the cell type), along with all terms from the samples.
  const allSampleTerms = isEmbedded(predictionSet.cell_type)
    ? [predictionSet.cell_type, ...samplesTerms]
    : samplesTerms;

  useEffect(() => {
    setAreDeprecatedFilesVisible(isDeprecatedStatus(predictionSet.status));
  }, [predictionSet["@id"]]);

  return (
    <>
      <Breadcrumbs item={predictionSet} />
      <EditableItem item={predictionSet}>
        <PagePreamble sections={sections} />
        <DoiControl doi={predictionSet.doi} />
        <AlternativeIdentifiers
          alternateAccessions={predictionSet.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={predictionSet} isJsonFormat={isJson}>
          <BatchDownloadFileSet fileSet={predictionSet} />
          <ControlledAccessIndicator item={predictionSet} />
          <DataUseLimitationSummaries
            summaries={predictionSet.data_use_limitation_summaries}
          />
        </ObjectPageHeader>
        <JsonDisplay item={predictionSet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={predictionSet} />
          <DataPanel>
            <DataArea>
              <FileSetDataItems
                item={predictionSet}
                publications={publications}
              >
                {predictionSet.scope && (
                  <>
                    <DataItemLabel>Scope</DataItemLabel>
                    <DataItemValue>{predictionSet.scope}</DataItemValue>
                  </>
                )}
                {predictionSet.assessed_genes && (
                  <>
                    <DataItemLabel>Assessed Genes</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {predictionSet.assessed_genes.map((gene) => (
                          <Link href={gene["@id"]} key={gene["@id"]}>
                            {gene.symbol}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {predictionSet.small_scale_gene_list && (
                  <>
                    <DataItemLabel>Small Scale Gene List</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {predictionSet.small_scale_gene_list.map((gene) => (
                          <Link href={gene["@id"]} key={gene["@id"]}>
                            {gene.symbol}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {predictionSet.small_scale_loci_list && (
                  <>
                    <DataItemLabel>Small Scale Loci List</DataItemLabel>
                    <DataItemValue>
                      <ChromosomeLocations
                        locations={predictionSet.small_scale_loci_list}
                        isCollapsible
                      />
                    </DataItemValue>
                  </>
                )}
                {isDatabaseObject(predictionSet.large_scale_gene_list) && (
                  <>
                    <DataItemLabel>Large Scale Gene List</DataItemLabel>
                    <DataItemValue>
                      <Link
                        href={predictionSet.large_scale_gene_list["@id"]}
                        key={predictionSet.large_scale_gene_list["@id"]}
                      >
                        {predictionSet.large_scale_gene_list.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {isDatabaseObject(predictionSet.large_scale_loci_list) && (
                  <>
                    <DataItemLabel>Large Scale Loci List</DataItemLabel>
                    <DataItemValue>
                      <Link
                        href={predictionSet.large_scale_loci_list["@id"]}
                        key={predictionSet.large_scale_loci_list["@id"]}
                      >
                        {predictionSet.large_scale_loci_list.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {assessedGenes.length > 0 && (
                  <>
                    <DataItemLabel>Assessed Genes</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {assessedGenes.map((gene) => (
                          <Link href={gene["@id"]} key={gene["@id"]}>
                            {gene.symbol}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {predictionSet.associated_phenotypes && (
                  <>
                    <DataItemLabel>Associated Phenotypes</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {predictionSet.associated_phenotypes.map(
                          (phenotype) => (
                            <Link
                              href={phenotype["@id"]}
                              key={phenotype["@id"]}
                            >
                              {phenotype.term_name}
                            </Link>
                          )
                        )}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {predictionSet.cell_annotation && (
                  <>
                    <DataItemLabel>Cell Annotation</DataItemLabel>
                    <DataItemValue>
                      <SampleAnnotatedSummary
                        summary={predictionSet.cell_annotation}
                        terms={allSampleTerms}
                      />
                    </DataItemValue>
                  </>
                )}
                {isEmbedded(predictionSet.cell_type) && (
                  <>
                    <DataItemLabel>Cell Ontology ID</DataItemLabel>
                    <DataItemValue>
                      <Link href={predictionSet.cell_type["@id"]}>
                        {predictionSet.cell_type.term_id}
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
                {isDatabaseObjectArray(predictionSet.software_versions) && (
                  <>
                    <DataItemLabel>Software Versions</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {predictionSet.software_versions.map((version) => (
                          <Link href={version["@id"]} key={version["@id"]}>
                            {version.summary}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {files.length > 0 && (
            <>
              <FileTable
                files={files}
                fileSet={predictionSet}
                isFilteredVisible
                hasDeprecatedOption
                externalDeprecated={{
                  visible: areDeprecatedFilesVisible,
                  setVisible: setAreDeprecatedFilesVisible,
                }}
              />
              <FileGraph
                files={files}
                fileFileSets={fileFileSets}
                referenceFiles={referenceFiles}
                derivedFromFiles={derivedFromFiles}
                qualityMetrics={qualityMetrics}
                externalDeprecated={{
                  visible: areDeprecatedFilesVisible,
                  setVisible: setAreDeprecatedFilesVisible,
                }}
                fileId={predictionSet.accession}
              />
            </>
          )}
          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${predictionSet["@id"]}`}
              reportLabel="Report of samples in this prediction set"
              isConstructLibraryColumnVisible
              isDeletedVisible
            />
          )}
          {donors.length > 0 && <DonorTable donors={donors} />}
          {isDatabaseObjectArray(predictionSet.construct_library_sets) && (
            <ConstructLibraryTable
              constructLibrarySets={predictionSet.construct_library_sets}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
            />
          )}
          {inputFileSets.length > 0 && (
            <FileSetTable
              fileSets={inputFileSets}
              reportLink={`/multireport/?type=FileSet&input_for=${predictionSet["@id"]}`}
              reportLabel="Report of file sets that are inputs for this prediction set"
              title="Input File Sets"
              isDeletedVisible
              panelId="input-file-sets"
            />
          )}
          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${predictionSet["@id"]}`}
              reportLabel="Report of file sets that this prediction set is an input for"
              title="File Sets Using This Prediction Set as an Input"
              panelId="input-file-set-for"
            />
          )}
          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${predictionSet["@id"]}`}
              reportLabel="Report of file sets that have this prediction set as a control"
              title="File Sets Controlled by This Prediction Set"
              panelId="control-for"
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
  GetServerSidePropsResult<PredictionSetPageProps>
> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const predictionSet = (
    await request.getObject<PredictionSetObject>(
      `/prediction-sets/${params.id}/`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(predictionSet)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      predictionSet,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const files = isDatabaseObjectArray(predictionSet.files)
      ? await requestFiles(
          pathsFromDatabaseObjects(predictionSet.files),
          request
        )
      : [];

    const samples = await requestFileSetSamples([predictionSet], request);
    const samplesTerms = await getSamplesTerms(samples, request);
    const donors = await requestFileSetDonors(predictionSet, request);
    const derivedFromFiles = await getAllDerivedFromFiles(files, request);
    const combinedFiles = files.concat(derivedFromFiles);
    const fileFileSets = await getFilesFileSets(combinedFiles, request);
    const publications = await requestFileSetPublications(
      predictionSet,
      request
    );
    const referenceFiles = await requestFilesReferenceFiles(files, request);
    const qualityMetrics = await requestFilesQualityMetrics(files, request);

    const documents = isPathArray(predictionSet.documents)
      ? await requestDocuments(predictionSet.documents, request)
      : [];

    const inputFileSets = await requestAssociatedFileSets(
      [predictionSet],
      "input_file_sets",
      request,
      ["analysis_set", "curated_set"]
    );

    const inputFileSetFor = await requestAssociatedFileSets(
      [predictionSet],
      "input_for",
      request
    );

    const controlFor = await requestAssociatedFileSets(
      [predictionSet],
      "control_for",
      request
    );

    const assessedGenes = isPathArray(predictionSet.assessed_genes)
      ? await requestGenes(predictionSet.assessed_genes, request)
      : [];

    const { supersedes, supersededBy } = await requestSupersedes(
      predictionSet,
      "FileSet",
      request
    );

    const attribution = await buildAttribution(
      predictionSet,
      req.headers.cookie
    );

    return {
      props: {
        predictionSet,
        inputFileSets,
        inputFileSetFor,
        controlFor,
        assessedGenes,
        documents,
        publications,
        files,
        fileFileSets,
        referenceFiles,
        derivedFromFiles,
        samples,
        samplesTerms,
        donors,
        qualityMetrics,
        supersedes,
        supersededBy,
        pageContext: { title: predictionSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(predictionSet);
}

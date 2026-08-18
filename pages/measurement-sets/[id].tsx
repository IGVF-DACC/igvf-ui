// node_modules
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useContext } from "react";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
import { BatchDownloadFileSet } from "../../components/batch-download-fileset";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import { ConstructLibraryTable } from "../../components/construct-library-table";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataAreaTitle,
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
import FileSetTable from "../../components/file-set-table";
import FileSetFilesTables from "../../components/file-set-files-tables";
import FileTable from "../../components/file-table";
import { ImagingFileTable } from "../../components/imaging-file-table";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
import SessionContext from "../../components/session-context";
import { StatusPreviewDetail } from "../../components/status";
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// lib
import buildAttribution from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestFiles,
  requestGenes,
  requestOntologyTerms,
  requestPublications,
  requestSupersedes,
} from "../../lib/common-requests";
import { pathsFromDatabaseObjects } from "../../lib/database-object";
import { isDeprecatedStatus } from "../../lib/deprecated-files";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  ConstructLibrarySetObject,
  requestAssociatedFileSets,
  requestFileSetAssociatedFiles,
  requestFileSetDonors,
  requestFileSetSamples,
  type FileSetObject,
  type MeasurementSetObject,
} from "../../lib/file-sets";
import { requestSeqspecDocuments, requestSeqspecFiles } from "../../lib/files";
import { type PageProps } from "../../lib/next-js";
import {
  getMeasurementSetAssayTitleDescriptionMap,
  getPreferredAssayTitleDescriptionMap,
  PhenotypeTermObject,
} from "../../lib/ontology-terms";
import { isJsonFormat } from "../../lib/query-utils";
import { SampleObject } from "../../lib/samples";
// root
import type {
  DocumentObject,
  DonorObject,
  FileObject,
  GeneObject,
  PublicationObject,
} from "../../globals";

/**
 * Props for the MeasurementSet page component.
 *
 * @param assayTitleDescriptionMap - Map of assay term titles to their descriptions
 * @param auxiliarySets - Auxiliary datasets associated with the measurement set
 * @param clsLibraryDesignFiles - Construct library design files associated with the measurement
 *                                set's construct library sets
 * @param controlFileSets - Control file sets associated with the measurement set
 * @param controlFor - File sets that have this measurement set as a control
 * @param documents - Documents associated with the measurement set
 * @param donors - Donors associated with the measurement set
 * @param enrichmentDesigns - Enrichment designs associated with the measurement set
 * @param files - Files associated with the measurement set
 * @param functionalAssayMechanisms - Functional assay mechanism phenotype terms associated with the
 *                                    measurement set
 * @param inputFileSetFor - File sets that this measurement set is an input for
 * @param libraryDesignFiles - Library design files associated with the measurement set's construct
 *                             library sets
 * @param measurementSet - Measurement set object to display assay details for
 * @param publications - Publications associated with the measurement set
 * @param samples - Samples associated with the measurement set
 * @param seqspecDocuments - Seqspec documents associated with the measurement set's files
 * @param seqspecFiles - Seqspec files associated with the measurement set's files
 * @param targetedGenes - Targeted genes associated with the measurement set
 */
interface MeasurementSetPageProps extends PageProps {
  assayTitleDescriptionMap: Record<string, string>;
  auxiliarySets: FileSetObject[];
  constructLibrarySets: ConstructLibrarySetObject[];
  controlFileSets: FileSetObject[];
  controlFor: FileSetObject[];
  documents: DocumentObject[];
  donors: DonorObject[];
  enrichmentDesigns: FileObject[];
  files: FileObject[];
  functionalAssayMechanisms: PhenotypeTermObject[];
  inputFileSetFor: FileSetObject[];
  libraryDesignFiles: FileObject[];
  measurementSet: MeasurementSetObject;
  publications: PublicationObject[];
  samples: SampleObject[];
  seqspecDocuments: DocumentObject[];
  seqspecFiles: FileObject[];
  targetedGenes: GeneObject[];
}

/**
 * Display the assay details panel for the measurement set.
 *
 * @param measurementSet - Measurement set object to display assay details for
 */
function AssayDetails({
  measurementSet,
}: {
  measurementSet: MeasurementSetObject;
}) {
  if (measurementSet.sequencing_library_types?.length > 0) {
    return (
      <>
        <DataAreaTitle id="assay-details">Assay Details</DataAreaTitle>
        <DataPanel>
          <DataArea>
            {measurementSet.sequencing_library_types?.length > 0 && (
              <>
                <DataItemLabel>Sequencing Library Types</DataItemLabel>
                <DataItemValueAnnotated
                  objectType={measurementSet["@type"][0]}
                  propertyName="sequencing_library_types"
                >
                  {measurementSet.sequencing_library_types}
                </DataItemValueAnnotated>
              </>
            )}
          </DataArea>
        </DataPanel>
      </>
    );
  }
  return null;
}

export default function MeasurementSet({
  measurementSet,
  controlFileSets,
  documents,
  publications,
  files,
  constructLibrarySets,
  auxiliarySets,
  inputFileSetFor,
  controlFor,
  samples,
  donors,
  functionalAssayMechanisms,
  seqspecFiles,
  seqspecDocuments,
  enrichmentDesigns,
  libraryDesignFiles,
  targetedGenes,
  supersedes,
  supersededBy,
  assayTitleDescriptionMap,
  attribution = null,
  isJson,
}: MeasurementSetPageProps) {
  const tooltipAttr = useTooltip("external-image-url");
  const sections = useSecDir({ isJson });
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);

  // Split the files into those with an @type of ImageFile and all others.
  const groupedFiles = _.groupBy(files, (file) =>
    file["@type"].includes("ImageFile") ? "image" : "other"
  );

  // Collect all sample summaries and display them as a collapsible list.
  const sampleSummaries =
    samples.length > 0 ? samples.map((sample) => sample.summary) : [];
  const uniqueSampleSummaries = [...new Set(sampleSummaries)];

  // Collect all sample protocols.
  const sampleProtocols = samples.flatMap((sample) => sample.protocols || []);

  // Combine measurement set and sample protocols.
  const combinedProtocols = sampleProtocols.concat(
    measurementSet.protocols || []
  );
  const uniqueCombinedProtocols = _.uniq(combinedProtocols);

  return (
    <>
      <Breadcrumbs item={measurementSet} />
      <EditableItem item={measurementSet}>
        <PagePreamble sections={sections} />
        <DoiControl doi={measurementSet.doi} />
        <AlternativeIdentifiers
          alternateAccessions={measurementSet.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={measurementSet} isJsonFormat={isJson}>
          <BatchDownloadFileSet fileSet={measurementSet} />
          <ControlledAccessIndicator item={measurementSet} />
          <DataUseLimitationSummaries
            summaries={measurementSet.data_use_limitation_summaries}
          />
        </ObjectPageHeader>
        <JsonDisplay item={measurementSet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={measurementSet} />
          <DataPanel>
            <DataArea>
              <FileSetDataItems
                item={measurementSet}
                publications={publications}
                assayTitleDescriptionMap={assayTitleDescriptionMap}
                preferredAssayTitleDescriptionMap={
                  preferredAssayTitleDescriptionMap
                }
              >
                {measurementSet.library_preparation_kit && (
                  <>
                    <DataItemLabel>Library Preparation Kit</DataItemLabel>
                    <DataItemValue>
                      {measurementSet.library_preparation_kit}
                    </DataItemValue>
                  </>
                )}
                {targetedGenes.length > 0 && (
                  <>
                    <DataItemLabel>Targeted Genes</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {targetedGenes.map((gene) => (
                          <Link key={gene["@id"]} href={gene["@id"]}>
                            {gene.symbol}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {uniqueSampleSummaries.length > 0 && (
                  <>
                    <DataItemLabel>Sample Summaries</DataItemLabel>
                    <DataItemList isCollapsible>
                      {uniqueSampleSummaries}
                    </DataItemList>
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
                {uniqueCombinedProtocols.length > 0 && (
                  <>
                    <DataItemLabel>Protocols</DataItemLabel>
                    <DataItemList isCollapsible isUrlList>
                      {uniqueCombinedProtocols.map((protocol) => (
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
                {measurementSet.strand_specificity && (
                  <>
                    <DataItemLabel>Strand Specificity</DataItemLabel>
                    <DataItemValue>
                      {measurementSet.strand_specificity}
                    </DataItemValue>
                  </>
                )}
                {measurementSet.external_image_urls?.length > 0 && (
                  <>
                    <DataItemLabel>
                      <div className="flex items-center gap-1">
                        External Image URLs
                        <TooltipRef tooltipAttr={tooltipAttr}>
                          <QuestionMarkCircleIcon className="h-4 w-4" />
                        </TooltipRef>
                        <Tooltip tooltipAttr={tooltipAttr}>
                          Image data is not hosted here due to size. Please use
                          the link.
                        </Tooltip>
                      </div>
                    </DataItemLabel>
                    <DataItemList isCollapsible isUrlList>
                      {measurementSet.external_image_urls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {url}
                        </a>
                      ))}
                    </DataItemList>
                  </>
                )}
              </FileSetDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <FileSetFilesTables
            files={groupedFiles.other}
            fileSet={measurementSet}
            seqspecFiles={seqspecFiles}
            seqspecDocuments={seqspecDocuments}
          >
            {groupedFiles.image?.length > 0 && (
              <ImagingFileTable
                key={`${measurementSet["@id"]}-image-files`}
                files={groupedFiles.image}
                fileSet={measurementSet}
                title="Imaging Results"
                panelId="imaging"
                hasDeprecatedOption
                externalDeprecated={{
                  defaultVisible: isDeprecatedStatus(measurementSet.status),
                }}
              />
            )}
          </FileSetFilesTables>
          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${measurementSet["@id"]}`}
              reportLabel="Report of Samples in This File Set"
              panelId="samples"
              isConstructLibraryColumnVisible
              isDeletedVisible
            />
          )}
          {donors.length > 0 && <DonorTable donors={donors} />}
          {constructLibrarySets.length > 0 && (
            <ConstructLibraryTable
              constructLibrarySets={constructLibrarySets}
              libraryDesignFiles={libraryDesignFiles}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
            />
          )}
          {libraryDesignFiles.length > 0 && (
            <FileTable
              files={libraryDesignFiles}
              title="Library Design Files"
              secDirTitle="Library Design Files"
              panelId="library-design-files"
            />
          )}
          <AssayDetails measurementSet={measurementSet} />
          {controlFileSets.length > 0 && (
            <FileSetTable
              fileSets={controlFileSets}
              title="Control File Sets"
              reportLink={`/multireport/?type=FileSet&control_for.@id=${measurementSet["@id"]}`}
              reportLabel="Report of Control File Sets in This File Set"
              panelId="control-file-sets"
              isDeletedVisible
            />
          )}
          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${measurementSet["@id"]}`}
              reportLabel="Report of file sets that this measurement set is an input for"
              title="File Sets Using This Measurement Set as an Input"
              panelId="input-file-sets-for"
            />
          )}
          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${measurementSet["@id"]}`}
              reportLabel="Report of file sets that have this measurement set as a control"
              title="File Sets Controlled by This Measurement Set"
              panelId="control-for"
            />
          )}
          {auxiliarySets.length > 0 && (
            <FileSetTable
              fileSets={auxiliarySets}
              title="Auxiliary Datasets"
              reportLink={`/multireport/?type=AuxiliarySet&measurement_sets.@id=${measurementSet["@id"]}`}
              fileSetMeta={{
                showFileSetFiles: true,
                fileFilter: (files) => {
                  // Only show non-seqspec files in the auxiliary datasets.
                  return files.filter(
                    (file) => file.content_type !== "seqspec"
                  );
                },
              }}
              isDeletedVisible
              panelId="auxiliary-sets"
            />
          )}
          {enrichmentDesigns.length > 0 && (
            <FileTable
              files={enrichmentDesigns}
              title="Enrichment Designs"
              reportLink={`/multireport/?type=TabularFile&enrichment_design_for=${measurementSet["@id"]}`}
              reportLabel="Report of files describing the assay-specific enrichment strategy."
              isDeletedVisible
              panelId="enrichment-designs"
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
}: GetServerSidePropsContext<{
  id: string;
}>): Promise<GetServerSidePropsResult<MeasurementSetPageProps>> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const measurementSet = (
    await request.getObject<MeasurementSetObject>(
      `/measurement-sets/${params.id}/`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(measurementSet)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      measurementSet,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const samples = await requestFileSetSamples([measurementSet], request);
    const donors = await requestFileSetDonors(measurementSet, request);

    const documents =
      measurementSet.documents?.length > 0
        ? await requestDocuments(
            pathsFromDatabaseObjects(measurementSet.documents),
            request
          )
        : [];

    const files =
      measurementSet.files?.length > 0
        ? await requestFiles(
            pathsFromDatabaseObjects(measurementSet.files),
            request
          )
        : [];

    const controlFileSets = await requestAssociatedFileSets(
      [measurementSet],
      "control_file_sets",
      request
    );

    const inputFileSetFor = await requestAssociatedFileSets(
      [measurementSet],
      "input_for",
      request
    );

    const controlFor = await requestAssociatedFileSets(
      [measurementSet],
      "control_for",
      request
    );

    // Request auxiliary sets associated with the measurement set.
    const auxiliarySets = await requestAssociatedFileSets(
      [measurementSet],
      "auxiliary_sets",
      request
    );

    const seqspecFiles =
      files.length > 0 ? await requestSeqspecFiles(files, request) : [];
    const seqspecDocuments = await requestSeqspecDocuments(files, request);

    const enrichmentDesigns = await requestFileSetAssociatedFiles(
      [measurementSet],
      "enrichment_designs",
      request
    );

    const constructLibrarySets =
      await requestAssociatedFileSets<ConstructLibrarySetObject>(
        [measurementSet],
        "construct_library_sets",
        request,
        ["integrated_content_files"]
      );
    const libraryDesignFiles = await requestFileSetAssociatedFiles(
      constructLibrarySets,
      "integrated_content_files",
      request
    );

    const targetedGenes =
      measurementSet.targeted_genes?.length > 0
        ? await requestGenes(
            pathsFromDatabaseObjects(measurementSet.targeted_genes),
            request
          )
        : [];

    const functionalAssayMechanisms =
      measurementSet.functional_assay_mechanisms?.length > 0
        ? await requestOntologyTerms<PhenotypeTermObject>(
            pathsFromDatabaseObjects(
              measurementSet.functional_assay_mechanisms
            ),
            request
          )
        : [];

    let publications = [];
    if (measurementSet.publications?.length > 0) {
      const publicationPaths = measurementSet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const { supersedes, supersededBy } = await requestSupersedes(
      measurementSet,
      "FileSet",
      request
    );

    const assayTitleDescriptionMap =
      await getMeasurementSetAssayTitleDescriptionMap(measurementSet, request);

    const attribution = await buildAttribution(
      measurementSet,
      req.headers.cookie
    );

    return {
      props: {
        measurementSet,
        controlFileSets,
        documents,
        publications,
        files,
        constructLibrarySets,
        auxiliarySets,
        inputFileSetFor,
        controlFor,
        samples,
        donors,
        functionalAssayMechanisms,
        seqspecFiles,
        seqspecDocuments,
        enrichmentDesigns,
        targetedGenes,
        libraryDesignFiles,
        assayTitleDescriptionMap,
        supersedes,
        supersededBy,
        pageContext: { title: measurementSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(measurementSet);
}

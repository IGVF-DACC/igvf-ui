// node_modules
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import PropTypes from "prop-types";
import { useContext } from "react";
import { Fragment } from "react";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
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
  DataPanel,
} from "../../components/data-area";
import { DataUseLimitationSummaries } from "../../components/data-use-limitation-status";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import FileSetFilesTables from "../../components/file-set-files-tables";
import FileTable from "../../components/file-table";
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
  requestDonors,
  requestFiles,
  requestFileSets,
  requestLibraryDesignFiles,
  requestPublications,
  requestSamples,
  requestSeqspecFiles,
  requestSupersedes,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  getMeasurementSetAssayTitleDescriptionMap,
  getPreferredAssayTitleDescriptionMap,
} from "../../lib/ontology-terms";
import { isJsonFormat } from "../../lib/query-utils";

/**
 * Display the assay details for the measurement set.
 */
function AssayDetails({ measurementSet }) {
  if (measurementSet.sequencing_library_types?.length > 0) {
    return (
      <>
        <DataAreaTitle id="assay-details">Assay Details</DataAreaTitle>
        <DataPanel>
          <DataArea>
            {measurementSet.sequencing_library_types?.length > 0 && (
              <>
                <DataItemLabel>Sequencing Library Types</DataItemLabel>
                <DataItemValue>
                  {measurementSet.sequencing_library_types.join(", ")}
                </DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
      </>
    );
  }
  return null;
}

AssayDetails.propTypes = {
  // Measurement set to display
  measurementSet: PropTypes.object.isRequired,
};

export default function MeasurementSet({
  measurementSet,
  assayTerm = null,
  controlFileSets,
  documents,
  publications,
  files,
  auxiliarySets,
  inputFileSetFor,
  controlFor,
  samples,
  donors,
  seqspecFiles,
  seqspecDocuments,
  primerDesigns,
  libraryDesignFiles,
  supersedes,
  supersededBy,
  assayTitleDescriptionMap,
  attribution = null,
  isJson,
}) {
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
    measurementSet.samples?.length > 0
      ? measurementSet.samples.map((sample) => sample.summary)
      : [];
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
        <AlternativeIdentifiers
          alternateAccessions={measurementSet.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={measurementSet} isJsonFormat={isJson}>
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
                {assayTerm && (
                  <>
                    <DataItemLabel>Assay Term</DataItemLabel>
                    <DataItemValue>
                      <Link href={assayTerm["@id"]}>{assayTerm.term_name}</Link>
                    </DataItemValue>
                  </>
                )}
                {measurementSet.targeted_genes && (
                  <>
                    <DataItemLabel>Targeted Genes</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {measurementSet.targeted_genes.map((gene) => (
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
                {measurementSet.functional_assay_mechanisms?.length > 0 && (
                  <>
                    <DataItemLabel>Functional Assay Mechanisms</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {measurementSet.functional_assay_mechanisms.map(
                          (phenotypeTerm) => (
                            <Link
                              href={phenotypeTerm["@id"]}
                              key={phenotypeTerm.term_id}
                            >
                              {phenotypeTerm.term_name}
                            </Link>
                          )
                        )}
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
              <FileTable
                files={groupedFiles.image}
                fileSet={measurementSet}
                title="Imaging Results"
                panelId="imaging"
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
          {measurementSet.construct_library_sets?.length > 0 && (
            <ConstructLibraryTable
              constructLibrarySets={measurementSet.construct_library_sets}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
            />
          )}
          {libraryDesignFiles.length > 0 && (
            <FileTable
              files={libraryDesignFiles}
              title="Library Design Files"
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
          {primerDesigns.length > 0 && (
            <FileTable
              files={primerDesigns}
              title="Primer Designs"
              reportLink={`/multireport/?type=TabularFile&primer_design_for=${measurementSet["@id"]}`}
              reportLabel="Report of primer designs for this measurement set"
              isDeletedVisible
              panelId="primer-designs"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

MeasurementSet.propTypes = {
  // Measurement set to display
  measurementSet: PropTypes.object.isRequired,
  // Assay term of the measurement set
  assayTerm: PropTypes.object,
  // Control File Sets of the measurement set
  controlFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Auxiliary datasets
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this measurement set is an input for
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that have this measurement set as a control
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sample objects associated with the measurement set
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donor objects associated with the measurement set
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec documents associated with `files`
  seqspecDocuments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Primer designs tabular files associated with the measurement set
  primerDesigns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Library design files associated with the measurement set's construct library sets
  libraryDesignFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this measurement set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this file set supersedes
  supersedes: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this file set is superseded by
  supersededBy: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Map of assay term titles to their descriptions
  assayTitleDescriptionMap: PropTypes.object.isRequired,
  // Attribution for this measurement set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const measurementSet = (
    await request.getObject(`/measurement-sets/${params.id}/`)
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

    const assayTerm = (
      await request.getObject(measurementSet.assay_term["@id"])
    ).optional();
    const documents = measurementSet.documents
      ? await requestDocuments(measurementSet.documents, request)
      : [];
    let files = [];
    if (measurementSet.files?.length > 0) {
      const filePaths = measurementSet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }
    let controlFileSets = [];
    if (measurementSet.control_file_sets?.length > 0) {
      const controlPaths = measurementSet.control_file_sets.map(
        (control) => control["@id"]
      );
      controlFileSets = await requestFileSets(controlPaths, request);
    }

    const inputFileSetFor =
      measurementSet.input_for?.length > 0 &&
      measurementSet.input_for.every(
        (item) => typeof item === "object" && item["@id"]
      )
        ? await requestFileSets(
            measurementSet.input_for.map((inputFor) => inputFor["@id"]),
            request
          )
        : [];

    let controlFor = [];
    if (measurementSet.control_for?.length > 0) {
      const controlForPaths = measurementSet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    let auxiliarySets = [];
    const auxiliarySetPaths =
      measurementSet.auxiliary_sets?.length > 0
        ? measurementSet.auxiliary_sets.map((dataset) => dataset["@id"])
        : [];
    if (auxiliarySetPaths.length > 0) {
      auxiliarySets = await requestFileSets(auxiliarySetPaths, request, [
        "files",
      ]);
    }

    let samples = [];
    const samplesPaths =
      measurementSet.samples?.length > 0
        ? measurementSet.samples.map((sample) => sample["@id"])
        : [];
    if (samplesPaths.length > 0) {
      samples = await requestSamples(samplesPaths, request);
    }

    const donors = await requestDonors(
      measurementSet.donors?.map((donor) => donor["@id"]) || [],
      request
    );

    // Use the files to retrieve all the seqspec files they might link to.
    const seqspecFiles =
      files.length > 0 ? await requestSeqspecFiles(files, request) : [];

    let seqspecDocuments = [];
    if (files.length > 0) {
      const seqspecDocumentPaths = files.map(
        (seqspecFile) => seqspecFile.seqspec_document
      );
      if (seqspecDocumentPaths.length > 0) {
        const uniqueDocumentPaths = [...new Set(seqspecDocumentPaths)];
        seqspecDocuments = await requestDocuments(uniqueDocumentPaths, request);
      }
    }

    const primerDesigns = measurementSet.primer_designs
      ? await requestFiles(measurementSet.primer_designs, request, [
          "TabularFile",
        ])
      : [];

    const libraryDesignFiles = await requestLibraryDesignFiles(
      measurementSet,
      request
    );

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
        assayTerm,
        controlFileSets,
        documents,
        publications,
        files,
        auxiliarySets,
        inputFileSetFor,
        controlFor,
        samples,
        donors,
        seqspecFiles,
        seqspecDocuments,
        primerDesigns,
        libraryDesignFiles,
        supersedes,
        supersededBy,
        assayTitleDescriptionMap,
        pageContext: { title: measurementSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(measurementSet);
}

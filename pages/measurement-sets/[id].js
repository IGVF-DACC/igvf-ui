// node_modules
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import AlternateAccessions from "../../components/alternate-accessions";
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
  DataItemValueUrl,
  DataPanel,
} from "../../components/data-area";
import { DataUseLimitationSummaries } from "../../components/data-use-limitation-status";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import FileSetFilesTables from "../../components/file-set-files-tables";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
import { StatusPreviewDetail } from "../../components/status";
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
  requestPublications,
  requestSamples,
  requestSeqspecFiles,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

/**
 * Maximum number of samples to include in the related multiome datasets report link. This is based
 * on the maximum URL size of 4000 (really 4096, but we'll be conservative) characters. Subtract a
 * longish demo domain name and the `/multireport/?type=MeasurementSet` search string, and subtract
 * the length of the `field=prop` queries for displaying all possible report columns. Then divide
 * by the length of the `samples.accession=...` query string to get the maximum number of samples
 * that can be included in the report link.
 */
const MAX_SAMPLES_IN_REPORT_LINK = 100;

/**
 * Compose the report link for the related multiome datasets table.
 */
function composeRelatedDatasetReportLink(measurementSet) {
  if (measurementSet.samples.length > 0) {
    const samples = measurementSet.samples.slice(0, MAX_SAMPLES_IN_REPORT_LINK);
    const sampleQueries = samples.map(
      (sample) => `samples.accession=${sample.accession}`
    );
    return `/multireport/?type=MeasurementSet&${sampleQueries.join(
      "&"
    )}&accession!=${measurementSet.accession}`;
  }
  return "";
}

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
  relatedMultiomeSets,
  auxiliarySets,
  inputFileSetFor,
  controlFor,
  samples,
  seqspecFiles,
  seqspecDocuments,
  attribution = null,
  isJson,
}) {
  const tooltipAttr = useTooltip("external-image-url");
  const sections = useSecDir();

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
        <AlternateAccessions
          alternateAccessions={measurementSet.alternate_accessions}
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
              >
                {assayTerm && (
                  <>
                    <DataItemLabel>Assay Term</DataItemLabel>
                    <DataItemValue>
                      <Link href={assayTerm["@id"]}>{assayTerm.term_name}</Link>
                    </DataItemValue>
                  </>
                )}
                {measurementSet.targeted_genes?.length > 0 && (
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
                {measurementSet.publication_identifiers?.length > 0 && (
                  <>
                    <DataItemLabel>Publication Identifiers</DataItemLabel>
                    <DataItemValue>
                      <DbxrefList
                        dbxrefs={measurementSet.publication_identifiers}
                        isCollapsible
                      />
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
                {measurementSet.external_image_url && (
                  <>
                    <DataItemLabel className="flex items-center gap-1">
                      External Image URL
                      <TooltipRef tooltipAttr={tooltipAttr}>
                        <QuestionMarkCircleIcon className="h-4 w-4" />
                      </TooltipRef>
                      <Tooltip tooltipAttr={tooltipAttr}>
                        Image data is not hosted here due to size. Please use
                        the link.
                      </Tooltip>
                    </DataItemLabel>
                    <DataItemValueUrl>
                      <a
                        href={measurementSet.external_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {measurementSet.external_image_url}
                      </a>
                    </DataItemValueUrl>
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
          {samples?.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${measurementSet["@id"]}`}
              reportLabel="Report of Samples in This File Set"
              panelId="samples"
              isConstructLibraryColumnVisible
            />
          )}
          {measurementSet.donors?.length > 0 && (
            <DonorTable donors={measurementSet.donors} />
          )}
          {measurementSet.construct_library_sets?.length > 0 && (
            <ConstructLibraryTable
              constructLibrarySets={measurementSet.construct_library_sets}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
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
          {relatedMultiomeSets.length > 0 && (
            <FileSetTable
              fileSets={relatedMultiomeSets}
              title="Related Multiome Datasets"
              reportLink={composeRelatedDatasetReportLink(measurementSet)}
              reportLabel="Report of Related Multiome Datasets"
              panelId="related-multiome-datasets"
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
              panelId="auxiliary-sets"
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
  // Related multiome datasets
  relatedMultiomeSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Auxiliary datasets
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this measurement set is an input for
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that have this measurement set as a control
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sample objects associated with the measurement set
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec documents associated with `files`
  seqspecDocuments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this measurement set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this measurement set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const measurementSet = (
    await request.getObject(`/measurement-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(measurementSet)) {
    const assayTerm = (
      await request.getObject(measurementSet.assay_term["@id"])
    ).optional();
    const documents = measurementSet.documents
      ? await requestDocuments(measurementSet.documents, request)
      : [];
    let files = [];
    if (measurementSet.files.length > 0) {
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
      measurementSet.input_for.length > 0
        ? await requestFileSets(measurementSet.input_for, request)
        : [];

    let controlFor = [];
    if (measurementSet.control_for.length > 0) {
      const controlForPaths = measurementSet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    let relatedMultiomeSets = [];
    const relatedMultiomeSetPaths =
      measurementSet.related_multiome_datasets?.length > 0
        ? measurementSet.related_multiome_datasets.map(
            (dataset) => dataset["@id"]
          )
        : [];
    if (relatedMultiomeSetPaths.length > 0) {
      relatedMultiomeSets = await requestFileSets(
        relatedMultiomeSetPaths,
        request
      );
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

    let publications = [];
    if (measurementSet.publications?.length > 0) {
      const publicationPaths = measurementSet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

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
        relatedMultiomeSets,
        auxiliarySets,
        inputFileSetFor,
        controlFor,
        samples,
        seqspecFiles,
        seqspecDocuments,
        pageContext: { title: measurementSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(measurementSet);
}

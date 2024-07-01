// node_modules
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import SequencingFileTable from "../../components/sequencing-file-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
  requestOntologyTerms,
  requestSamples,
  requestSeqspecFiles,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { splitIlluminaSequenceFiles } from "../../lib/files";
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
  if (
    measurementSet.library_construction_platform ||
    measurementSet.sequencing_library_types?.length > 0
  ) {
    return (
      <>
        <DataAreaTitle>Assay Details</DataAreaTitle>
        <DataPanel>
          <DataArea>
            {measurementSet.library_construction_platform && (
              <>
                <DataItemLabel>Library Construction Platform</DataItemLabel>
                <DataItemValue>
                  <Link
                    href={measurementSet.library_construction_platform["@id"]}
                  >
                    {measurementSet.library_construction_platform.term_name}
                  </Link>
                </DataItemValue>
              </>
            )}
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
  files,
  relatedMultiomeSets,
  auxiliarySets,
  samples,
  seqspecFiles,
  sequencingPlatforms,
  attribution = null,
  isJson,
}) {
  const { filesWithReadType, filesWithoutReadType, imageFileType } =
    splitIlluminaSequenceFiles(files);

  // Collect all the embedded construct library sets from all the samples in the FileSet. Remove
  // those with duplicate `@id` values.
  const constructLibrarySets = measurementSet.samples.reduce(
    (acc, sample) =>
      sample.construct_library_sets
        ? acc.concat(sample.construct_library_sets)
        : acc,
    []
  );
  const uniqueConstructLibrarySets = constructLibrarySets.filter(
    (fileSet, index, self) =>
      index ===
      self.findIndex((otherFileSet) => otherFileSet["@id"] === fileSet["@id"])
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
      <Breadcrumbs />
      <EditableItem item={measurementSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={measurementSet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={measurementSet} isJsonFormat={isJson} />
        <JsonDisplay item={measurementSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileSetDataItems item={measurementSet}>
                {assayTerm && (
                  <>
                    <DataItemLabel>Assay Term</DataItemLabel>
                    <DataItemValue>
                      <Link href={assayTerm["@id"]}>{assayTerm.term_name}</Link>
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
                {uniqueConstructLibrarySets.length > 0 && (
                  <>
                    <DataItemLabel>Construct Library Sets</DataItemLabel>
                    <DataItemList isCollapsible>
                      {uniqueConstructLibrarySets.map((fileSet) => (
                        <Fragment key={fileSet["@id"]}>
                          <Link href={fileSet["@id"]}>{fileSet.accession}</Link>
                          <span className="text-gray-600 dark:text-gray-400">
                            {" "}
                            {fileSet.summary}
                          </span>
                        </Fragment>
                      ))}
                    </DataItemList>
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
              </FileSetDataItems>
            </DataArea>
          </DataPanel>
          {measurementSet.samples?.length > 0 && (
            <SampleTable
              samples={measurementSet.samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${measurementSet["@id"]}`}
            />
          )}
          {measurementSet.donors?.length > 0 && (
            <DonorTable donors={measurementSet.donors} />
          )}
          <AssayDetails measurementSet={measurementSet} />
          {filesWithReadType.length > 0 && (
            <SequencingFileTable
              files={filesWithReadType}
              title="Sequencing Results (Illumina)"
              isIlluminaReadType={true}
              itemPath={measurementSet["@id"]}
              seqspecFiles={seqspecFiles}
              sequencingPlatforms={sequencingPlatforms}
              hasReadType
            />
          )}
          {filesWithoutReadType.length > 0 && (
            <SequencingFileTable
              files={filesWithoutReadType}
              title="Sequencing Results"
              isIlluminaReadType={false}
              itemPath={measurementSet["@id"]}
              seqspecFiles={seqspecFiles}
              sequencingPlatforms={sequencingPlatforms}
            />
          )}
          {imageFileType.length > 0 && (
            <FileTable
              files={imageFileType}
              fileSet={measurementSet}
              title="Imaging Results"
            />
          )}
          {controlFileSets.length > 0 && (
            <FileSetTable
              fileSets={controlFileSets}
              title="Control File Sets"
              reportLinkSpecs={{
                fileSetType: "FileSet",
                identifierProp: "control_for.accession",
                itemIdentifier: measurementSet.accession,
              }}
            />
          )}
          {relatedMultiomeSets.length > 0 && (
            <FileSetTable
              fileSets={relatedMultiomeSets}
              title="Related Multiome Datasets"
              reportLink={composeRelatedDatasetReportLink(measurementSet)}
            />
          )}
          {auxiliarySets.length > 0 && (
            <FileSetTable
              fileSets={auxiliarySets}
              title="Auxiliary Datasets"
              reportLinkSpecs={{
                fileSetType: "AuxiliarySet",
                identifierProp: "measurement_sets.accession",
                itemIdentifier: measurementSet.accession,
              }}
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
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
  // samples
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sequencing platform objects associated with `files`
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
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
      auxiliarySets = await requestFileSets(auxiliarySetPaths, request);
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

    // Use the files to retrieve all the sequencing platform objects they link to.
    const sequencingPlatformPaths = files
      .map((file) => file.sequencing_platform)
      .filter((sequencingPlatform) => sequencingPlatform);
    const uniqueSequencingPlatformPaths = [...new Set(sequencingPlatformPaths)];
    const sequencingPlatforms =
      uniqueSequencingPlatformPaths.length > 0
        ? await requestOntologyTerms(uniqueSequencingPlatformPaths, request)
        : [];

    const breadcrumbs = await buildBreadcrumbs(
      measurementSet,
      measurementSet.accession,
      req.headers.cookie
    );
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
        files,
        relatedMultiomeSets,
        auxiliarySets,
        samples,
        seqspecFiles,
        sequencingPlatforms,
        pageContext: { title: measurementSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(measurementSet);
}

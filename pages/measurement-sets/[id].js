// node_modules
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
  DataItemValue,
  DataItemValueUrl,
  DataItemValueCollapseControl,
  DataItemValueControlLabel,
  DataPanel,
  useDataAreaCollapser,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
import SequencingFileTable from "../../components/sequencing-file-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestDonors,
  requestFiles,
  requestOntologyTerms,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { splitIlluminaSequenceFiles } from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function MeasurementSet({
  measurementSet,
  assayTerm = null,
  documents,
  donors,
  files,
  seqspecFiles,
  sequencingPlatforms,
  libraryConstructionPlatform = null,
  attribution = null,
  isJson,
}) {
  const samplesCollapser = useDataAreaCollapser(measurementSet.samples || []);
  const { filesWithReadType, filesWithoutReadType } =
    splitIlluminaSequenceFiles(files);

  // Collect all sample summaries and display them as a collapsible list.
  const sampleSummaries =
    measurementSet.samples?.length > 0
      ? measurementSet.samples.map((sample) => sample.summary)
      : [];
  const sampleSummariesCollapser = useDataAreaCollapser([
    ...new Set(sampleSummaries),
  ]);

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
                      />
                    </DataItemValue>
                  </>
                )}
                {donors.length > 0 && (
                  <>
                    <DataItemLabel>Donors</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {donors.map((donor) => (
                          <Link href={donor["@id"]} key={donor.uuid}>
                            {donor.accession}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {samplesCollapser.displayedData.length > 0 && (
                  <>
                    <DataItemLabel>Samples</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {samplesCollapser.displayedData.map((sample, index) => (
                          <Fragment key={sample["@id"]}>
                            <Link href={sample["@id"]}>{sample.accession}</Link>
                            {index ===
                              samplesCollapser.displayedData.length - 1 && (
                              <DataItemValueCollapseControl
                                key="more-control"
                                collapser={samplesCollapser}
                                className="ml-1 inline-block"
                              >
                                <DataItemValueControlLabel
                                  collapser={samplesCollapser}
                                />
                              </DataItemValueCollapseControl>
                            )}
                          </Fragment>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {sampleSummariesCollapser.displayedData.length > 0 && (
                  <>
                    <DataItemLabel>Sample Summaries</DataItemLabel>
                    <DataItemValue>
                      <>
                        {sampleSummariesCollapser.displayedData.map(
                          (summary) => (
                            <div
                              key={summary}
                              className="my-2 first:mt-0 last:mb-0"
                            >
                              {summary}
                            </div>
                          )
                        )}
                        <DataItemValueCollapseControl
                          collapser={sampleSummariesCollapser}
                        >
                          <DataItemValueControlLabel
                            collapser={sampleSummariesCollapser}
                          />
                        </DataItemValueCollapseControl>
                      </>
                    </DataItemValue>
                  </>
                )}
                {measurementSet.related_multiome_datasets?.length > 0 && (
                  <>
                    <DataItemLabel>Related Multiome Datasets</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {measurementSet.related_multiome_datasets.map(
                          (dataset) => (
                            <Link href={dataset["@id"]} key={dataset["@id"]}>
                              {dataset.accession}
                            </Link>
                          )
                        )}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {measurementSet.auxiliary_sets?.length > 0 && (
                  <>
                    <DataItemLabel>Auxiliary Sets</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {measurementSet.auxiliary_sets.map((set) => (
                          <Link href={set["@id"]} key={set["@id"]}>
                            {set.accession}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {measurementSet.control_file_sets?.length > 0 && (
                  <>
                    <DataItemLabel>Control File Sets</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {measurementSet.control_file_sets.map((set) => (
                          <Link href={set["@id"]} key={set["@id"]}>
                            {set.accession}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
            </DataArea>
          </DataPanel>
          {(libraryConstructionPlatform || measurementSet.protocol) && (
            <>
              <DataAreaTitle>Assay Details</DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {libraryConstructionPlatform && (
                    <>
                      <DataItemLabel>
                        Library Construction Platform
                      </DataItemLabel>
                      <DataItemValue>
                        <Link href={libraryConstructionPlatform["@id"]}>
                          {libraryConstructionPlatform.term_name}
                        </Link>
                      </DataItemValue>
                    </>
                  )}
                  {measurementSet.protocol && (
                    <>
                      <DataItemLabel>Protocol</DataItemLabel>
                      <DataItemValueUrl>
                        <a
                          href={measurementSet.protocol}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {measurementSet.protocol}
                        </a>
                      </DataItemValueUrl>
                    </>
                  )}
                </DataArea>
              </DataPanel>
            </>
          )}
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
          {documents.length > 0 && (
            <>
              <DataAreaTitle>Documents</DataAreaTitle>
              <DocumentTable documents={documents} />
            </>
          )}
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
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sequencing platform objects associated with `files`
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Library construction platform object
  libraryConstructionPlatform: PropTypes.object,
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
    let donors = [];
    if (measurementSet.donors) {
      const donorPaths = measurementSet.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }
    let files = [];
    if (measurementSet.files.length > 0) {
      const filePaths = measurementSet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }
    let libraryConstructionPlatform = null;
    if (measurementSet.library_construction_platform) {
      libraryConstructionPlatform = (
        await request.getObject(measurementSet.library_construction_platform)
      ).optional();
    }

    // Use the files to retrieve all the seqspec files they might link to.
    let seqspecFiles = [];
    if (files.length > 0) {
      const seqspecPaths = files
        .map((file) => file.seqspec)
        .filter((seqspec) => seqspec);
      const uniqueSeqspecPaths = [...new Set(seqspecPaths)];
      seqspecFiles =
        uniqueSeqspecPaths.length > 0
          ? await requestFiles(uniqueSeqspecPaths, request)
          : [];
    }

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
        documents,
        donors,
        files,
        seqspecFiles,
        sequencingPlatforms,
        libraryConstructionPlatform,
        pageContext: { title: measurementSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(measurementSet);
}

// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import { ConstructLibraryTable } from "../../components/construct-library-table";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { DataUseLimitationSummaries } from "../../components/data-use-limitation-status";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetFilesTables from "../../components/file-set-files-tables";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
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
  requestDonors,
  requestFiles,
  requestFileSets,
  requestPublications,
  requestSamples,
  requestSeqspecFiles,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  getAssayTitleDescriptionMap,
  getPreferredAssayTitleDescriptionMap,
} from "../../lib/ontology-terms";
import { isJsonFormat } from "../../lib/query-utils";

export default function AuxiliarySet({
  auxiliarySet,
  publications,
  barcodeMap,
  documents,
  files,
  relatedDatasets,
  seqspecFiles,
  seqspecDocuments,
  inputFileSetFor,
  controlFor,
  samples,
  donors,
  assayTitleDescriptionMap,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);

  // Split the files into those with an @type of TabularFile and all others.
  const groupedFiles = _.groupBy(files, (file) =>
    file["@type"].includes("TabularFile") ? "tabular" : "other"
  );

  return (
    <>
      <Breadcrumbs item={auxiliarySet} />
      <EditableItem item={auxiliarySet}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={auxiliarySet.alternate_accessions}
        />
        <ObjectPageHeader item={auxiliarySet} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={auxiliarySet} />
          <DataUseLimitationSummaries
            summaries={auxiliarySet.data_use_limitation_summaries}
          />
        </ObjectPageHeader>
        <JsonDisplay item={auxiliarySet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={auxiliarySet} />
          <DataPanel>
            <DataArea>
              <FileSetDataItems
                item={auxiliarySet}
                publications={publications}
                assayTitleDescriptionMap={assayTitleDescriptionMap}
                preferredAssayTitleDescriptionMap={
                  preferredAssayTitleDescriptionMap
                }
              />
              {barcodeMap && (
                <>
                  <DataItemLabel>Barcode Map</DataItemLabel>
                  <DataItemValue>
                    <Link href={barcodeMap["@id"]}>{barcodeMap.accession}</Link>
                  </DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <FileSetFilesTables
            files={groupedFiles.other}
            fileSet={auxiliarySet}
            seqspecFiles={seqspecFiles}
            seqspecDocuments={seqspecDocuments}
          >
            {groupedFiles.tabular?.length > 0 && (
              <FileTable
                files={groupedFiles.tabular}
                fileSet={auxiliarySet}
                title="Tabular Files"
                panelId="tabular"
              />
            )}
          </FileSetFilesTables>
          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${auxiliarySet["@id"]}`}
              reportLabel="Report of samples in this auxiliary set"
              isConstructLibraryColumnVisible
            />
          )}
          {donors.length > 0 && <DonorTable donors={donors} />}
          {auxiliarySet.construct_library_sets?.length > 0 && (
            <ConstructLibraryTable
              constructLibrarySets={auxiliarySet.construct_library_sets}
              title="Associated Construct Library Sets"
              panelId="associated-construct-library-sets"
            />
          )}
          {relatedDatasets.length > 0 && (
            <FileSetTable
              fileSets={relatedDatasets}
              title="Related Measurement Sets"
              reportLink={`/multireport/?type=MeasurementSet&auxiliary_sets.@id=${auxiliarySet["@id"]}`}
              reportLabel="Report of measurement sets related to this auxiliary set"
              panelId="related-datasets"
            />
          )}
          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${auxiliarySet["@id"]}`}
              reportLabel="Report of file sets that this auxiliary set is an input for"
              title="File Sets Using This Auxiliary Set as an Input"
              panelId="input-file-set-for"
            />
          )}
          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=MeasurementSet&control_file_sets.@id=${auxiliarySet["@id"]}`}
              reportLabel="Report of file sets this auxiliary set serves as a control for"
              title="File Sets Controlled by This Auxiliary Set"
              panelId="control-for"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

AuxiliarySet.propTypes = {
  // Auxiliary set to display
  auxiliarySet: PropTypes.object.isRequired,
  // Barcode map
  barcodeMap: PropTypes.object,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Related Datasets to display
  relatedDatasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec documents associated with `files`
  seqspecDocuments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this file set is input for
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets controlled by this file set
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples associated with this file set
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with this file set
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Assay title description map for this analysis set
  assayTitleDescriptionMap: PropTypes.object.isRequired,
  // Publications associated with this file set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this measurement set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const auxiliarySet = (
    await request.getObject(`/auxiliary-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(auxiliarySet)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      auxiliarySet,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const documents = auxiliarySet.documents
      ? await requestDocuments(auxiliarySet.documents, request)
      : [];

    let files = [];
    if (auxiliarySet.files?.length > 0) {
      const filePaths = auxiliarySet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }

    let samples = [];
    if (auxiliarySet.samples?.length > 0) {
      const samplePaths = auxiliarySet.samples.map((sample) => sample["@id"]);
      samples = await requestSamples(samplePaths, request);
    }

    const donors = await requestDonors(
      auxiliarySet.donors?.map((donor) => donor["@id"]) || [],
      request
    );

    let relatedDatasets = [];
    if (auxiliarySet.measurement_sets?.length > 0) {
      const datasetPaths =
        auxiliarySet.measurement_sets.map((dataset) => dataset["@id"]) || [];
      relatedDatasets = await requestFileSets(datasetPaths, request);
    }

    const seqspecFiles =
      files.length > 0 ? await requestSeqspecFiles(files, request) : [];

    let seqspecDocuments = [];
    if (files.length > 0) {
      const seqspecDocumentPaths = files.reduce(
        (acc, seqspecFile) =>
          seqspecFile.seqspec_document
            ? acc.concat(seqspecFile.seqspec_document)
            : acc,
        []
      );
      if (seqspecDocumentPaths.length > 0) {
        const uniqueDocumentPaths = [...new Set(seqspecDocumentPaths)];
        seqspecDocuments = await requestDocuments(uniqueDocumentPaths, request);
      }
    }

    const inputFileSetFor =
      auxiliarySet.input_for?.length > 0
        ? await requestFileSets(auxiliarySet.input_for, request)
        : [];

    let controlFor = [];
    if (auxiliarySet.control_for?.length > 0) {
      const controlForPaths = auxiliarySet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    let publications = [];
    if (auxiliarySet.publications?.length > 0) {
      const publicationPaths = auxiliarySet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const barcodeMap = auxiliarySet.barcode_map
      ? (await request.getObject(auxiliarySet.barcode_map)).optional()
      : null;

    const assayTitleDescriptionMap =
      auxiliarySet.assay_titles?.length > 0
        ? await getAssayTitleDescriptionMap(auxiliarySet.assay_titles, request)
        : {};

    const attribution = await buildAttribution(
      auxiliarySet,
      req.headers.cookie
    );
    return {
      props: {
        auxiliarySet,
        publications,
        barcodeMap,
        documents,
        files,
        relatedDatasets,
        seqspecFiles,
        seqspecDocuments,
        inputFileSetFor,
        samples,
        donors,
        controlFor,
        assayTitleDescriptionMap,
        pageContext: { title: auxiliarySet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(auxiliarySet);
}

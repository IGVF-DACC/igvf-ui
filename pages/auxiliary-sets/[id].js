// node_modules
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetFilesTables from "../../components/file-set-files-tables";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import { usePagePanels } from "../../components/page-panels";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
  requestPublications,
  requestSeqspecFiles,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function AuxiliarySet({
  auxiliarySet,
  publications,
  barcodeMap,
  documents,
  files,
  relatedDatasets,
  seqspecFiles,
  inputFileSetFor,
  controlFor,
  attribution = null,
  isJson,
}) {
  const pagePanels = usePagePanels(auxiliarySet["@id"]);

  // Split the files into those with an @type of TabularFile and all others.
  const groupedFiles = _.groupBy(files, (file) =>
    file["@type"].includes("TabularFile") ? "tabular" : "other"
  );

  return (
    <>
      <Breadcrumbs item={auxiliarySet} />
      <EditableItem item={auxiliarySet}>
        <PagePreamble />
        <AlternateAccessions
          alternateAccessions={auxiliarySet.alternate_accessions}
        />
        <ObjectPageHeader item={auxiliarySet} isJsonFormat={isJson} />
        <JsonDisplay item={auxiliarySet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileSetDataItems
                item={auxiliarySet}
                publications={publications}
              />
              {barcodeMap && (
                <>
                  <DataItemLabel>Barcode Map</DataItemLabel>
                  <DataItemValue>
                    <Link href={barcodeMap["@id"]}>{barcodeMap.accession}</Link>
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          <FileSetFilesTables
            files={groupedFiles.other}
            fileSet={auxiliarySet}
            seqspecFiles={seqspecFiles}
          >
            {groupedFiles.tabular?.length > 0 && (
              <FileTable
                files={groupedFiles.tabular}
                fileSet={auxiliarySet}
                title="Tabular Files"
              />
            )}
          </FileSetFilesTables>
          {auxiliarySet.samples?.length > 0 && (
            <SampleTable
              samples={auxiliarySet.samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${auxiliarySet["@id"]}`}
              reportLabel="Report of samples in this auxiliary set"
              pagePanels={pagePanels}
              pagePanelId="samples"
            />
          )}
          {auxiliarySet.donors?.length > 0 && (
            <DonorTable
              donors={auxiliarySet.donors}
              pagePanels={pagePanels}
              pagePanelId="donors"
            />
          )}
          {relatedDatasets.length > 0 && (
            <FileSetTable
              fileSets={relatedDatasets}
              title="Related Measurement Sets"
              reportLink={`/multireport/?type=MeasurementSet&auxiliary_sets.@id=${auxiliarySet["@id"]}`}
              reportLabel="Report of measurement sets related to this auxiliary set"
              pagePanels={pagePanels}
              pagePanelId="related-datasets"
            />
          )}
          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${auxiliarySet["@id"]}`}
              reportLabel="Report of file sets that this auxiliary set is an input for"
              title="File Sets Using This Auxiliary Set as an Input"
              pagePanels={pagePanels}
              pagePanelId="input-file-sets"
            />
          )}
          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=MeasurementSet&control_file_sets.@id=${auxiliarySet["@id"]}`}
              reportLabel="Report of file sets this auxiliary set serves as a control for"
              title="File Sets Controlled by This Auxiliary Set"
            />
          )}
          {documents.length > 0 && (
            <DocumentTable
              documents={documents}
              pagePanels={pagePanels}
              pagePanelId="documents"
            />
          )}

          <Attribution attribution={attribution} />
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
  // File sets that this file set is input for
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets controlled by this file set
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this file set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  const auxiliarySet = (
    await request.getObject(`/auxiliary-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(auxiliarySet)) {
    const documents = auxiliarySet.documents
      ? await requestDocuments(auxiliarySet.documents, request)
      : [];

    let files = [];
    if (auxiliarySet.files.length > 0) {
      const filePaths = auxiliarySet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }

    let relatedDatasets = [];
    if (auxiliarySet.measurement_sets?.length > 0) {
      const datasetPaths =
        auxiliarySet.measurement_sets.map((dataset) => dataset["@id"]) || [];
      relatedDatasets = await requestFileSets(datasetPaths, request);
    }

    const seqspecFiles =
      files.length > 0 ? await requestSeqspecFiles(files, request) : [];

    const inputFileSetFor =
      auxiliarySet.input_for.length > 0
        ? await requestFileSets(auxiliarySet.input_for, request)
        : [];

    let controlFor = [];
    if (auxiliarySet.control_for.length > 0) {
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
        inputFileSetFor,
        controlFor,
        pageContext: { title: auxiliarySet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(auxiliarySet);
}

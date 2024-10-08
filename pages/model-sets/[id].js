// node_modules
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
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import { usePagePanels } from "../../components/page-panels";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
  requestPublications,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function ModelSet({
  modelSet,
  softwareVersion = null,
  documents,
  publications,
  files,
  inputFileSets,
  inputFileSetFor,
  controlFor,
  attribution = null,
  isJson,
}) {
  const pagePanels = usePagePanels();

  return (
    <>
      <Breadcrumbs item={modelSet} />
      <EditableItem item={modelSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={modelSet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={modelSet} isJsonFormat={isJson} />
        <JsonDisplay item={modelSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileSetDataItems item={modelSet} publications={publications}>
                <DataItemLabel>Accession</DataItemLabel>
                <DataItemValue>{modelSet.accession}</DataItemValue>
                <DataItemLabel>Model Version</DataItemLabel>
                <DataItemValue>{modelSet.model_version}</DataItemValue>
                {modelSet.prediction_objects.length > 0 && (
                  <>
                    <DataItemLabel>Prediction Objects</DataItemLabel>
                    <DataItemValue>
                      {modelSet.prediction_objects.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {modelSet.model_zoo_location && (
                  <>
                    <DataItemLabel>Model Zoo Location</DataItemLabel>
                    <DataItemValue>
                      <a
                        href={modelSet.model_zoo_location}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {modelSet.model_zoo_location}
                      </a>
                    </DataItemValue>
                  </>
                )}
                {softwareVersion && (
                  <>
                    <DataItemLabel>Software Version</DataItemLabel>
                    <DataItemValue>
                      <Link href={softwareVersion["@id"]}>
                        {softwareVersion.name}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {modelSet.publication_identifiers?.length > 0 && (
                  <>
                    <DataItemLabel>Publication Identifiers</DataItemLabel>
                    <DataItemValue>
                      <DbxrefList
                        dbxrefs={modelSet.publication_identifiers}
                        isCollapsible
                      />
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
            </DataArea>
          </DataPanel>

          {inputFileSets.length > 0 && (
            <FileSetTable
              fileSets={inputFileSets}
              title="Input File Sets"
              reportLink={`/multireport/?type=FileSet&input_file_set_for=${modelSet["@id"]}`}
              reportLabel={`View file sets used as input file sets for ${modelSet.accession}`}
              pagePanels={pagePanels}
              pagePanelId="input-file-sets"
            />
          )}

          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${modelSet["@id"]}`}
              reportLabel="Report of file sets that this model set is an input for"
              title="File Sets Using This Model Set as an Input"
              pagePanels={pagePanels}
              pagePanelId="input-file-set-for"
            />
          )}

          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${modelSet["@id"]}`}
              reportLabel="Report of file sets that have this model set as a control"
              title="File Sets Controlled by This Model Set"
              pagePanels={pagePanels}
              pagePanelId="control-for"
            />
          )}

          {files.length > 0 && (
            <FileTable
              files={files}
              fileSet={modelSet}
              isDownloadable
              pagePanels={pagePanels}
              pagePanelId="files"
              isDefaultExpanded
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

ModelSet.propTypes = {
  // Model Set to display
  modelSet: PropTypes.object.isRequired,
  // Software version associated with this model
  softwareVersion: PropTypes.object,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file sets to display
  inputFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file sets for this model set
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control for file sets
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this model set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this measurement set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const modelSet = (
    await request.getObject(`/model-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(modelSet)) {
    const softwareVersion = modelSet.software_version
      ? (await request.getObject(modelSet.software_version)).optional()
      : null;
    const documents = modelSet.documents
      ? await requestDocuments(modelSet.documents, request)
      : [];

    const filePaths = modelSet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    let inputFileSets = [];
    if (modelSet.input_file_sets) {
      const inputFileSetPaths = modelSet.input_file_sets.map(
        (inputFileSet) => inputFileSet["@id"]
      );
      inputFileSets = await requestFileSets(inputFileSetPaths, request);
    }

    const inputFileSetFor =
      modelSet.input_file_set_for.length > 0
        ? await requestFileSets(modelSet.input_file_set_for, request)
        : [];

    let controlFor = [];
    if (modelSet.control_for.length > 0) {
      const controlForPaths = modelSet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    let publications = [];
    if (modelSet.publications?.length > 0) {
      const publicationPaths = modelSet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const attribution = await buildAttribution(modelSet, req.headers.cookie);

    return {
      props: {
        modelSet,
        softwareVersion,
        documents,
        publications,
        files,
        inputFileSets,
        inputFileSetFor,
        controlFor,
        pageContext: { title: modelSet.model_name },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modelSet);
}

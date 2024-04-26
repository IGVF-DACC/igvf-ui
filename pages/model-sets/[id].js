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
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function ModelSet({
  modelSet,
  softwareVersion = null,
  documents,
  files,
  inputFileSets,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
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
              <FileSetDataItems item={modelSet}>
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
            <FileSetTable fileSets={inputFileSets} title="Input File Sets" />
          )}
          {files.length > 0 && (
            <FileTable files={files} fileSetPath={modelSet["@id"]} />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
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

    const breadcrumbs = await buildBreadcrumbs(
      modelSet,
      modelSet.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(modelSet, req.headers.cookie);

    return {
      props: {
        modelSet,
        softwareVersion,
        documents,
        files,
        inputFileSets,
        pageContext: { title: modelSet.model_name },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modelSet);
}

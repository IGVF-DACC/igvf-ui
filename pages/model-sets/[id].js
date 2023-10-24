// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestDocuments, requestFiles } from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function ModelSet({
  modelSet,
  softwareVersion = null,
  documents,
  files,
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
              <DataItemLabel>Accession</DataItemLabel>
              <DataItemValue>{modelSet.accession}</DataItemValue>
              <DataItemLabel>Model Version</DataItemLabel>
              <DataItemValue>{modelSet.model_version}</DataItemValue>
              <DataItemLabel>File Set Type</DataItemLabel>
              <DataItemValue>{modelSet.file_set_type}</DataItemValue>
              {modelSet.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={modelSet.aliases} />
                  </DataItemValue>
                </>
              )}
              {modelSet.prediction_objects.length > 0 && (
                <>
                  <DataItemLabel>Prediction Objects</DataItemLabel>
                  <DataItemValue>
                    {modelSet.prediction_objects.join(", ")}
                  </DataItemValue>
                </>
              )}
              {modelSet.input_file_sets?.length > 0 && (
                <>
                  <DataItemLabel>Input File Sets</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {modelSet.input_file_sets.map((fileSet) => (
                        <Link href={fileSet["@id"]} key={fileSet["@id"]}>
                          {fileSet.accession}
                        </Link>
                      ))}
                    </SeparatedList>
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
                    <DbxrefList dbxrefs={modelSet.publication_identifiers} />
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {files.length > 0 && (
            <FileTable files={files} itemPath={modelSet["@id"]} />
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

ModelSet.propTypes = {
  // Model Set to display
  modelSet: PropTypes.object.isRequired,
  // Software version associated with this model
  softwareVersion: PropTypes.object,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  const modelSet = await request.getObject(`/model-sets/${params.id}/`);
  if (FetchRequest.isResponseSuccess(modelSet)) {
    const softwareVersion = modelSet.software_version
      ? await request.getObject(modelSet.software_version, null)
      : null;
    const documents = modelSet.documents
      ? await requestDocuments(modelSet.documents, request)
      : [];
    const filePaths = modelSet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

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
        pageContext: { title: modelSet.model_name },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(modelSet);
}

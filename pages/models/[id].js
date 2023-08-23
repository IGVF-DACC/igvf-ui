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

export default function Model({
  model,
  softwareVersion = null,
  documents,
  files,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={model}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={model.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={model} isJsonFormat={isJson} />
        <JsonDisplay item={model} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Accession</DataItemLabel>
              <DataItemValue>{model.accession}</DataItemValue>
              <DataItemLabel>Model Version</DataItemLabel>
              <DataItemValue>{model.model_version}</DataItemValue>
              <DataItemLabel>Model Type</DataItemLabel>
              <DataItemValue>{model.model_type}</DataItemValue>
              {model.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={model.aliases} />
                  </DataItemValue>
                </>
              )}
              {model.prediction_objects.length > 0 && (
                <>
                  <DataItemLabel>Prediction Objects</DataItemLabel>
                  <DataItemValue>
                    {model.prediction_objects.join(", ")}
                  </DataItemValue>
                </>
              )}
              {model.input_file_sets?.length > 0 && (
                <>
                  <DataItemLabel>Input File Sets</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {model.input_file_sets.map((fileSet) => (
                        <Link href={fileSet["@id"]} key={fileSet["@id"]}>
                          {fileSet.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {model.model_zoo_location && (
                <>
                  <DataItemLabel>Model Zoo Location</DataItemLabel>
                  <DataItemValue>
                    <a
                      href={model.model_zoo_location}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {model.model_zoo_location}
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
              {model.publication_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList dbxrefs={model.publication_identifiers} />
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {files.length > 0 && (
            <>
              <DataAreaTitle>Files</DataAreaTitle>
              <FileTable files={files} />
            </>
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

Model.propTypes = {
  // Model to display
  model: PropTypes.object.isRequired,
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
  const model = await request.getObject(`/models/${params.id}/`);
  if (FetchRequest.isResponseSuccess(model)) {
    const softwareVersion = model.software_version
      ? await request.getObject(model.software_version, null)
      : null;
    const documents = model.documents
      ? await requestDocuments(model.documents, request)
      : [];
    const filePaths = model.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    const breadcrumbs = await buildBreadcrumbs(
      model,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(model, req.headers.cookie);

    return {
      props: {
        model,
        softwareVersion,
        documents,
        files,
        pageContext: { title: model.model_name },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(model);
}

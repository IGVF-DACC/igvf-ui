// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import { DataArea, DataAreaTitle, DataPanel } from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SequencingFileTable from "../../components/sequencing-file-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
  requestOntologyTerms,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function ConfigurationFile({
  attribution,
  configurationFile,
  fileSet = null,
  seqspecOf,
  sequencingPlatforms,
  documents,
  derivedFrom,
  derivedFromFileSets,
  fileFormatSpecifications,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={configurationFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={configurationFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={configurationFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={configurationFile} />
        </ObjectPageHeader>
        <JsonDisplay item={configurationFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems item={configurationFile} fileSet={fileSet} />
            </DataArea>
          </DataPanel>
          {seqspecOf.length > 0 && (
            <>
              <DataAreaTitle>seqspec File Of</DataAreaTitle>
              <SequencingFileTable
                files={seqspecOf}
                sequencingPlatforms={sequencingPlatforms}
                isSeqspecHidden={true}
              />
            </>
          )}
          {derivedFrom.length > 0 && (
            <>
              <DataAreaTitle>
                Files {configurationFile.accession} Derives From
              </DataAreaTitle>
              <DerivedFromTable
                derivedFrom={derivedFrom}
                derivedFromFileSets={derivedFromFileSets}
              />
            </>
          )}
          {fileFormatSpecifications.length > 0 && (
            <>
              <DataAreaTitle>File Format Specifications</DataAreaTitle>
              <DocumentTable documents={fileFormatSpecifications} />
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

ConfigurationFile.propTypes = {
  // ConfigurationFile object to display
  configurationFile: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
  // The file is a seqspec of
  seqspecOf: PropTypes.array.isRequired,
  // Sequencing platform objects associated with the files it is a seqspec of
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents set associate with this file
  documents: PropTypes.array.isRequired,
  // The file is derived from
  derivedFrom: PropTypes.array.isRequired,
  // Filesets derived from files belong to
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.array.isRequired,
  // Attribution for this file
  attribution: PropTypes.object.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  // Redirect to the file page if the URL is a file download link.
  const isPathForFileDownload = checkForFileDownloadPath(resolvedUrl);
  if (isPathForFileDownload) {
    return {
      redirect: {
        destination: convertFileDownloadPathToFilePagePath(resolvedUrl),
        permanent: false,
      },
    };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const configurationFile = await request.getObject(
    `/configuration-files/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(configurationFile)) {
    const fileSet = await request.getObject(configurationFile.file_set, null);
    const seqspecOf = configurationFile.seqspec_of
      ? await requestFiles(configurationFile.seqspec_of, request)
      : [];
    const documents = configurationFile.documents
      ? await requestDocuments(configurationFile.documents, request)
      : [];
    const derivedFrom = configurationFile.derived_from
      ? await requestFiles(configurationFile.derived_from, request)
      : [];
    const derivedFromFileSetPaths = derivedFrom
      .map((file) => file.file_set)
      .filter((fileSet) => fileSet);
    const uniqueDerivedFromFileSetPaths = [...new Set(derivedFromFileSetPaths)];
    const derivedFromFileSets =
      uniqueDerivedFromFileSetPaths.length > 0
        ? await requestFileSets(uniqueDerivedFromFileSetPaths, request)
        : [];
    const fileFormatSpecifications =
      configurationFile.file_format_specifications
        ? await requestDocuments(
            configurationFile.file_format_specifications,
            request
          )
        : [];
    const sequencingPlatformPaths = seqspecOf
      .map((file) => file.sequencing_platform)
      .filter((sequencingPlatform) => sequencingPlatform);
    const uniqueSequencingPlatformPaths = [...new Set(sequencingPlatformPaths)];
    const sequencingPlatforms =
      uniqueSequencingPlatformPaths.length > 0
        ? await requestOntologyTerms(uniqueSequencingPlatformPaths, request)
        : [];

    const breadcrumbs = await buildBreadcrumbs(
      configurationFile,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      configurationFile,
      req.headers.cookie
    );
    return {
      props: {
        configurationFile,
        fileSet,
        seqspecOf,
        sequencingPlatforms,
        documents,
        derivedFrom,
        derivedFromFileSets,
        fileFormatSpecifications,
        pageContext: { title: configurationFile.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(configurationFile);
}

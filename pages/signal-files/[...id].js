// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function SignalFile({
  attribution,
  signalFile,
  fileSet = null,
  documents,
  derivedFrom,
  derivedFromFileSets,
  fileFormatSpecifications,
  referenceFiles,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={signalFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={signalFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={signalFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={signalFile} />
        </ObjectPageHeader>
        <JsonDisplay item={signalFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems item={signalFile} fileSet={fileSet} />
            </DataArea>
          </DataPanel>
          <DataAreaTitle>Signal Details</DataAreaTitle>
          <DataPanel>
            <DataArea>
              {referenceFiles.length > 0 && (
                <>
                  <DataItemLabel>Reference Files</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {referenceFiles.map((file) => (
                        <Link href={file["@id"]} key={file["@id"]}>
                          {file.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              <>
                <DataItemLabel>Strand Specificity</DataItemLabel>
                <DataItemValue>{signalFile.strand_specificity}</DataItemValue>
              </>
              {signalFile.filtered && (
                <>
                  <DataItemLabel>Filtered</DataItemLabel>
                  <DataItemValue>True</DataItemValue>
                </>
              )}
              {signalFile.normalized && (
                <>
                  <DataItemLabel>Normalized</DataItemLabel>
                  <DataItemValue>True</DataItemValue>
                </>
              )}
              {signalFile.start_view_position && (
                <>
                  <DataItemLabel>Start View Position</DataItemLabel>
                  <DataItemValue>
                    {signalFile.start_view_position}
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {derivedFrom.length > 0 && (
            <>
              <DataAreaTitle>
                Files {signalFile.accession} Derives From
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

SignalFile.propTypes = {
  // SignalFile object to display
  signalFile: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
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
  // Reference files used to generate this file
  referenceFiles: PropTypes.array.isRequired,
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
  const signalFile = (await request.getObject(`/signal-files/${params.id}/`)).union();
  if (FetchRequest.isResponseSuccess(signalFile)) {
    const fileSet = (await request.getObject(signalFile.file_set)).optional();
    const documents = signalFile.documents
      ? await requestDocuments(signalFile.documents, request)
      : [];
    const derivedFrom = signalFile.derived_from
      ? await requestFiles(signalFile.derived_from, request)
      : [];
    const derivedFromFileSetPaths = derivedFrom
      .map((file) => file.file_set)
      .filter((fileSet) => fileSet);
    const uniqueDerivedFromFileSetPaths = [...new Set(derivedFromFileSetPaths)];
    const derivedFromFileSets =
      uniqueDerivedFromFileSetPaths.length > 0
        ? await requestFileSets(uniqueDerivedFromFileSetPaths, request)
        : [];
    const fileFormatSpecifications = signalFile.file_format_specifications
      ? await requestDocuments(signalFile.file_format_specifications, request)
      : [];
    const referenceFiles = signalFile.reference_files
      ? await requestFiles(signalFile.reference_files, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      signalFile,
      signalFile.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(signalFile, req.headers.cookie);
    return {
      props: {
        signalFile,
        fileSet,
        documents,
        derivedFrom,
        derivedFromFileSets,
        fileFormatSpecifications,
        pageContext: { title: signalFile.accession },
        breadcrumbs,
        attribution,
        referenceFiles,
        isJson,
      },
    };
  }
  return errorObjectToProps(signalFile);
}

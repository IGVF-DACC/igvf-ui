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
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function MatrixFile({
  matrixFile,
  attribution,
  fileSet,
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
      <EditableItem item={matrixFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={matrixFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={matrixFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={matrixFile} />
        </ObjectPageHeader>
        <JsonDisplay item={matrixFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems item={matrixFile} fileSet={fileSet} />
            </DataArea>
          </DataPanel>
          <DataAreaTitle>Matrix Details</DataAreaTitle>
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
              <DataItemLabel>First Dimension</DataItemLabel>
              <DataItemValue>{matrixFile.dimension1}</DataItemValue>
              <DataItemLabel>Second Dimension</DataItemLabel>
              <DataItemValue>{matrixFile.dimension2}</DataItemValue>
            </DataArea>
          </DataPanel>
          {derivedFrom.length > 0 && (
            <>
              <DataAreaTitle>
                Files {matrixFile.accession} Derives From
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

MatrixFile.propTypes = {
  // MatrixFile object to display
  matrixFile: PropTypes.object.isRequired,
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
  const matrixFile = (
    await request.getObject(`/matrix-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(matrixFile)) {
    const fileSet = (await request.getObject(matrixFile.file_set)).optional();
    const documents = matrixFile.documents
      ? await requestDocuments(matrixFile.documents, request)
      : [];
    const derivedFrom = matrixFile.derived_from
      ? await requestFiles(matrixFile.derived_from, request)
      : [];
    const derivedFromFileSetPaths = derivedFrom
      .map((file) => file.file_set)
      .filter((fileSet) => fileSet);
    const uniqueDerivedFromFileSetPaths = [...new Set(derivedFromFileSetPaths)];
    const derivedFromFileSets =
      uniqueDerivedFromFileSetPaths.length > 0
        ? await requestFileSets(uniqueDerivedFromFileSetPaths, request)
        : [];
    const fileFormatSpecifications = matrixFile.file_format_specifications
      ? await requestDocuments(matrixFile.file_format_specifications, request)
      : [];
    const referenceFiles = matrixFile.reference_files
      ? await requestFiles(matrixFile.reference_files, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      matrixFile,
      matrixFile.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(matrixFile, req.headers.cookie);
    return {
      props: {
        matrixFile,
        fileSet,
        documents,
        derivedFrom,
        derivedFromFileSets,
        fileFormatSpecifications,
        pageContext: { title: matrixFile.accession },
        breadcrumbs,
        attribution,
        referenceFiles,
        isJson,
      },
    };
  }
  return errorObjectToProps(matrixFile);
}

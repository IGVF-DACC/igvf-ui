// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import { DataArea, DataPanel } from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
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

export default function ImageFile({
  imageFile,
  attribution,
  fileSet,
  documents,
  derivedFrom,
  derivedFromFileSets,
  fileFormatSpecifications,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={imageFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={imageFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={imageFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={imageFile} />
        </ObjectPageHeader>
        <JsonDisplay item={imageFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems item={imageFile} fileSet={fileSet} />
            </DataArea>
          </DataPanel>
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              derivedFromFileSets={derivedFromFileSets}
              reportLink={`/multireport/?type=File&input_file_for=${imageFile["@id"]}`}
              reportLabel={`Report of files ${imageFile.accession} derives from`}
              title={`Files ${imageFile.accession} Derives From`}
            />
          )}
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

ImageFile.propTypes = {
  // ImageFile object to display
  imageFile: PropTypes.object.isRequired,
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
  const imageFile = (
    await request.getObject(`/image-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(imageFile)) {
    const fileSet = (await request.getObject(imageFile.file_set)).optional();
    const documents = imageFile.documents
      ? await requestDocuments(imageFile.documents, request)
      : [];
    const derivedFrom = imageFile.derived_from
      ? await requestFiles(imageFile.derived_from, request)
      : [];
    const derivedFromFileSetPaths = derivedFrom
      .map((file) => file.file_set)
      .filter((fileSet) => fileSet);
    const uniqueDerivedFromFileSetPaths = [...new Set(derivedFromFileSetPaths)];
    const derivedFromFileSets =
      uniqueDerivedFromFileSetPaths.length > 0
        ? await requestFileSets(uniqueDerivedFromFileSetPaths, request)
        : [];
    const fileFormatSpecifications = imageFile.file_format_specifications
      ? await requestDocuments(imageFile.file_format_specifications, request)
      : [];
    const referenceFiles = imageFile.reference_files
      ? await requestFiles(imageFile.reference_files, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      imageFile,
      imageFile.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(imageFile, req.headers.cookie);
    return {
      props: {
        imageFile,
        fileSet,
        documents,
        derivedFrom,
        derivedFromFileSets,
        fileFormatSpecifications,
        pageContext: { title: imageFile.accession },
        breadcrumbs,
        attribution,
        referenceFiles,
        isJson,
      },
    };
  }
  return errorObjectToProps(imageFile);
}

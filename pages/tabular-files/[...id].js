// node_modules
import PropTypes from "prop-types";
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
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
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

export default function TabularFile({
  tabularFile,
  documents,
  derivedFrom,
  derivedFromFileSets,
  inputFileFor,
  fileFormatSpecifications,
  integratedIn,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs item={tabularFile} />
      <EditableItem item={tabularFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={tabularFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={tabularFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={tabularFile} />
        </ObjectPageHeader>
        <JsonDisplay item={tabularFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems item={tabularFile} />
            </DataArea>
          </DataPanel>
          {(tabularFile.assembly || tabularFile.transcriptome_annotation) && (
            <>
              <DataAreaTitle>Reference Source Details</DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {tabularFile.assembly && (
                    <>
                      <DataItemLabel>Genome Assembly</DataItemLabel>
                      <DataItemValue>{tabularFile.assembly}</DataItemValue>
                    </>
                  )}
                  {tabularFile.transcriptome_annotation && (
                    <>
                      <DataItemLabel>Transcriptome Annotation</DataItemLabel>
                      <DataItemValue>
                        {tabularFile.transcriptome_annotation}
                      </DataItemValue>
                    </>
                  )}
                </DataArea>
              </DataPanel>
            </>
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              derivedFromFileSets={derivedFromFileSets}
              reportLink={`/multireport/?type=File&input_file_for=${tabularFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title={`Files ${tabularFile.accession} Derives From`}
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${tabularFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
            />
          )}
          {integratedIn.length > 0 && (
            <FileSetTable
              fileSets={integratedIn}
              title="Integrated In"
              reportLink={`/multireport/?type=ConstructLibrarySet&integrated_content_files.@id=${tabularFile["@id"]}`}
              reportLabel={`Report of ConstructLibrarySets that integrate ${tabularFile.accession}`}
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

TabularFile.propTypes = {
  // TabularFile object to display
  tabularFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // FileSets derived from files belong to
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.array.isRequired,
  // ConstructLibraryset this file was integrated in
  integratedIn: PropTypes.arrayOf(PropTypes.object),
  // Attribution for this ReferenceFile
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  // Redirect to the file page if the URL is a file download link.
  if (checkForFileDownloadPath(resolvedUrl)) {
    return {
      redirect: {
        destination: convertFileDownloadPathToFilePagePath(resolvedUrl),
        permanent: false,
      },
    };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const tabularFile = (
    await request.getObject(`/tabular-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(tabularFile)) {
    const documents = tabularFile.documents
      ? await requestDocuments(tabularFile.documents, request)
      : [];
    const derivedFrom = tabularFile.derived_from
      ? await requestFiles(tabularFile.derived_from, request)
      : [];
    const derivedFromFileSetPaths = derivedFrom
      .map((file) => file.file_set)
      .filter((fileSet) => fileSet);
    const uniqueDerivedFromFileSetPaths = [...new Set(derivedFromFileSetPaths)];
    const derivedFromFileSets =
      uniqueDerivedFromFileSetPaths.length > 0
        ? await requestFileSets(uniqueDerivedFromFileSetPaths, request)
        : [];
    const inputFileFor =
      tabularFile.input_file_for.length > 0
        ? await requestFiles(tabularFile.input_file_for, request)
        : [];
    const fileFormatSpecifications = tabularFile.file_format_specifications
      ? await requestDocuments(tabularFile.file_format_specifications, request)
      : [];
    let integratedIn = [];
    if (tabularFile.integrated_in.length > 0) {
      const integratedInPaths = tabularFile.integrated_in.map(
        (fileSet) => fileSet["@id"]
      );
      integratedIn = await requestFileSets(integratedInPaths, request);
    }

    const attribution = await buildAttribution(tabularFile, req.headers.cookie);
    return {
      props: {
        tabularFile,
        documents,
        derivedFrom,
        derivedFromFileSets,
        inputFileFor,
        fileFormatSpecifications,
        integratedIn,
        pageContext: { title: tabularFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(tabularFile);
}

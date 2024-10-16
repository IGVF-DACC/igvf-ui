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
  DataItemValueUrl,
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
import { usePagePanels } from "../../components/page-panels";
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

export default function ReferenceFile({
  referenceFile,
  documents,
  derivedFrom,
  derivedFromFileSets,
  inputFileFor,
  fileFormatSpecifications,
  integratedIn,
  attribution = null,
  isJson,
}) {
  const pagePanels = usePagePanels(referenceFile["@id"]);

  return (
    <>
      <Breadcrumbs item={referenceFile} />
      <EditableItem item={referenceFile}>
        <PagePreamble />
        <AlternateAccessions
          alternateAccessions={referenceFile.alternate_accessions}
        />
        <ObjectPageHeader item={referenceFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={referenceFile} />
        </ObjectPageHeader>
        <JsonDisplay item={referenceFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems item={referenceFile} />
            </DataArea>
          </DataPanel>
          {(referenceFile.assembly ||
            referenceFile.source_url ||
            referenceFile.transcriptome_annotation) && (
            <>
              <DataAreaTitle>Reference Source Details</DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {referenceFile.assembly && (
                    <>
                      <DataItemLabel>Genome Assembly</DataItemLabel>
                      <DataItemValue>{referenceFile.assembly}</DataItemValue>
                    </>
                  )}
                  {referenceFile.transcriptome_annotation && (
                    <>
                      <DataItemLabel>Transcriptome Annotation</DataItemLabel>
                      <DataItemValue>
                        {referenceFile.transcriptome_annotation}
                      </DataItemValue>
                    </>
                  )}
                  {referenceFile.source_url && (
                    <>
                      <DataItemLabel>Source URL</DataItemLabel>
                      <DataItemValueUrl>
                        <a
                          href={referenceFile.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {referenceFile.source_url}
                        </a>
                      </DataItemValueUrl>
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
              reportLink={`/multireport/?type=File&input_file_for=${referenceFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
              pagePanels={pagePanels}
              pagePanelId="derived-from"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${referenceFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
              pagePanels={pagePanels}
              pagePanelId="input-file-for"
            />
          )}
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
              pagePanels={pagePanels}
              pagePanelId="file-format-specifications"
            />
          )}
          {integratedIn.length > 0 && (
            <FileSetTable
              fileSets={integratedIn}
              title="Integrated In"
              reportLink={`/multireport/?type=ConstructLibrarySet&integrated_content_files.@id=${referenceFile["@id"]}`}
              reportLabel={`View ConstructLibrarySets integrated with ${referenceFile.accession}`}
              pagePanels={pagePanels}
              pagePanelId="integrated-in"
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

ReferenceFile.propTypes = {
  // ReferenceFile object to display
  referenceFile: PropTypes.object.isRequired,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Filesets derived from files belong to
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
  const referenceFile = (
    await request.getObject(`/reference-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(referenceFile)) {
    const documents = referenceFile.documents
      ? await requestDocuments(referenceFile.documents, request)
      : [];
    const derivedFrom = referenceFile.derived_from
      ? await requestFiles(referenceFile.derived_from, request)
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
      referenceFile.input_file_for.length > 0
        ? await requestFiles(referenceFile.input_file_for, request)
        : [];
    const fileFormatSpecifications = referenceFile.file_format_specifications
      ? await requestDocuments(
          referenceFile.file_format_specifications,
          request
        )
      : [];
    let integratedIn = [];
    if (referenceFile.integrated_in.length > 0) {
      const integratedInPaths = referenceFile.integrated_in.map(
        (fileSet) => fileSet["@id"]
      );
      integratedIn = await requestFileSets(integratedInPaths, request);
    }

    const attribution = await buildAttribution(
      referenceFile,
      req.headers.cookie
    );
    return {
      props: {
        referenceFile,
        documents,
        derivedFrom,
        derivedFromFileSets,
        inputFileFor,
        fileFormatSpecifications,
        integratedIn,
        pageContext: { title: referenceFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(referenceFile);
}

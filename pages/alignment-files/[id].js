// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
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
import { requestDocuments, requestFiles } from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import AlternateAccession from "../../components/alternate-accessions";

export default function AlignmentFile({
  attribution,
  alignmentFile,
  fileSet = null,
  documents,
  derivedFrom,
  referenceFiles,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={alignmentFile}>
        <PagePreamble />
        <ObjectPageHeader item={alignmentFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={alignmentFile} />
        </ObjectPageHeader>
        <AlternateAccession altAcc={alignmentFile.alternate_accessions} />
        <JsonDisplay item={alignmentFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems
                item={alignmentFile}
                fileSet={fileSet}
                derivedFrom={derivedFrom}
              >
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
                  <DataItemLabel>Redacted</DataItemLabel>
                  <DataItemValue>
                    {alignmentFile.redacted ? "Yes" : "No"}
                  </DataItemValue>
                </>
                <DataItemLabel>Filtered</DataItemLabel>
                <DataItemValue>
                  {alignmentFile.filtered ? "Yes" : "No"}
                </DataItemValue>
                <DataItemLabel>Content Summary</DataItemLabel>
                <DataItemValue>{alignmentFile.content_summary}</DataItemValue>
              </FileDataItems>
            </DataArea>
          </DataPanel>
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

AlignmentFile.propTypes = {
  // AlignmentFile object to display
  alignmentFile: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
  // Documents set associate with this file
  documents: PropTypes.array.isRequired,
  // The file is derived from
  derivedFrom: PropTypes.array.isRequired,
  // Attribution for this file
  attribution: PropTypes.object.isRequired,
  // The file is derived from
  referenceFiles: PropTypes.array.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const alignmentFile = await request.getObject(
    `/alignment-files/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(alignmentFile)) {
    const fileSet = await request.getObject(alignmentFile.file_set, null);
    const documents = alignmentFile.documents
      ? await requestDocuments(alignmentFile.documents, request)
      : [];
    const derivedFrom = alignmentFile.derived_from
      ? await requestFiles(alignmentFile.derived_from, request)
      : [];
    const referenceFiles = alignmentFile.reference_files
      ? await requestFiles(alignmentFile.reference_files, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      alignmentFile,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      alignmentFile,
      req.headers.cookie
    );
    return {
      props: {
        alignmentFile,
        fileSet,
        documents,
        derivedFrom,
        pageContext: { title: alignmentFile.accession },
        breadcrumbs,
        attribution,
        referenceFiles,
        isJson,
      },
    };
  }
  return errorObjectToProps(alignmentFile);
}

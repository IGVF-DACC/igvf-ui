// node_modules
import Link from "next/link";
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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestDocuments, requestFiles } from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function ReferenceFile({
  referenceFile,
  fileSet,
  documents,
  derivedFrom,
  fileFormatSpecifications,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={referenceFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={referenceFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={referenceFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={referenceFile} />
        </ObjectPageHeader>
        <JsonDisplay item={referenceFile} isJsonFormat={isJson}>
          <FileDataItems item={referenceFile} fileSet={fileSet}></FileDataItems>
          {("assembly" in referenceFile || "source_url" in referenceFile) && (
            <>
              <DataAreaTitle>Reference Details</DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {referenceFile.assembly && (
                    <>
                      <DataItemLabel>Genome Assembly</DataItemLabel>
                      <DataItemValue>{referenceFile.assembly}</DataItemValue>
                    </>
                  )}
                  {referenceFile.source_url && (
                    <>
                      <DataItemLabel>Source URL</DataItemLabel>
                      <DataItemValue>
                        <Link
                          href={referenceFile.source_url}
                          key={referenceFile.source_url}
                        >
                          {referenceFile.source_url}
                        </Link>
                      </DataItemValue>
                    </>
                  )}
                </DataArea>
              </DataPanel>
            </>
          )}
          {derivedFrom?.length > 0 && (
            <>
              <DataAreaTitle>
                Files {referenceFile.accession} derives from
              </DataAreaTitle>
              <DerivedFromTable derivedFrom={derivedFrom} />
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

ReferenceFile.propTypes = {
  // ReferenceFile object to display
  referenceFile: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.array,
  // Attribution for this ReferenceFile
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const referenceFile = await request.getObject(
    `/reference-files/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(referenceFile)) {
    const fileSet = await request.getObject(referenceFile.file_set, null);
    const documents = referenceFile.documents
      ? await requestDocuments(referenceFile.documents, request)
      : [];
    const derivedFrom = referenceFile.derived_from
      ? await requestFiles(referenceFile.derived_from, request)
      : [];
    const fileFormatSpecifications = referenceFile.file_format_specifications
      ? await requestDocuments(
          referenceFile.file_format_specifications,
          request
        )
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      referenceFile,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      referenceFile,
      req.headers.cookie
    );
    return {
      props: {
        referenceFile,
        fileSet,
        documents,
        derivedFrom,
        fileFormatSpecifications,
        pageContext: { title: referenceFile.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(referenceFile);
}

// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { DataAreaTitle } from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { FileDataItems } from "../../components/common-data-items";
import buildAttribution from "../../lib/attribution";

export default function SignalFile({
  attribution = null,
  signalFile,
  fileSet,
  documents,
  derivedFrom,
  referenceFiles,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={signalFile}>
        <PagePreamble />
        <ObjectPageHeader item={signalFile} />
        <DataPanel>
          <DataArea>
            <FileDataItems
              file={signalFile}
              fileSet={fileSet}
              derivedFrom={derivedFrom}
            >
              {referenceFiles.length > 0 && (
                <>
                  <DataItemLabel>Reference Files</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {referenceFiles.map((file) => (
                        <Link href={file["@id"]} key={file.uuid}>
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
              {"filtered" in signalFile && (
                <>
                  <DataItemLabel>Filtered</DataItemLabel>
                  <DataItemValue>
                    {signalFile.filtered ? "Yes" : "No"}
                  </DataItemValue>
                </>
              )}
              {"normalized" in signalFile && (
                <>
                  <DataItemLabel>Normalized</DataItemLabel>
                  <DataItemValue>
                    {signalFile.normalized ? "Yes" : "No"}
                  </DataItemValue>
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
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Attribution for this file
  attribution: PropTypes.object,
  // The file is derived from
  referenceFiles: PropTypes.array.isRequired,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const signalFile = await request.getObject(`/signal-files/${params.id}/`);
  if (FetchRequest.isResponseSuccess(signalFile)) {
    const fileSet = await request.getObject(signalFile.file_set, null);
    const documents = signalFile.documents
      ? await request.getMultipleObjects(signalFile.documents, null, {
          filterErrors: true,
        })
      : [];
    const derivedFrom = signalFile.derived_from
      ? await request.getMultipleObjects(signalFile.derived_from, null, {
          filterErrors: true,
        })
      : [];
    const referenceFiles = signalFile.reference_files
      ? await request.getMultipleObjects(signalFile.reference_files, null)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      signalFile,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(signalFile, req.headers.cookie);
    return {
      props: {
        signalFile,
        fileSet,
        documents,
        derivedFrom,
        pageContext: { title: signalFile.accession },
        breadcrumbs,
        attribution,
        referenceFiles,
      },
    };
  }
  return errorObjectToProps(signalFile);
}

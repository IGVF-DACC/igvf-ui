// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
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
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function ReferenceFile({
  referenceFile,
  fileSet,
  documents,
  derivedFrom,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={referenceFile}>
        <PagePreamble />
        <ObjectPageHeader item={referenceFile} />
        <DataPanel>
          <DataArea>
            <FileDataItems
              file={referenceFile}
              fileSet={fileSet}
              derivedFrom={derivedFrom}
            >
              {referenceFile.assembly && (
                <>
                  <DataItemLabel>Genome Assembly</DataItemLabel>
                  <DataItemValue>{referenceFile.assembly}</DataItemValue>
                </>
              )}
              {referenceFile.source && (
                <>
                  <DataItemLabel>Source</DataItemLabel>
                  <DataItemValue>
                    <Link
                      href={referenceFile.source}
                      key={referenceFile.source}
                    >
                      {referenceFile.source}
                    </Link>
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

ReferenceFile.propTypes = {
  // ReferenceFile object to display
  referenceFile: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Attribution for this ReferenceFile
  attribution: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const referenceFile = await request.getObject(
    `/reference-files/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(referenceFile)) {
    const fileSet = await request.getObject(referenceFile.file_set, null);
    const documents = referenceFile.documents
      ? await request.getMultipleObjects(referenceFile.documents, null, {
          filterErrors: true,
        })
      : [];
    const derivedFrom = referenceFile.derived_from
      ? await request.getMultipleObjects(referenceFile.derived_from, null, {
          filterErrors: true,
        })
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
        pageContext: { title: referenceFile.accession },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(referenceFile);
}
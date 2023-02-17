// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
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
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { DataAreaTitle } from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { FileDataItems } from "../../components/common-data-items";

export default function ReferenceData({
  referenceData,
  award = null,
  lab = null,
  fileSet,
  documents,
  derivedFrom,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={referenceData}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={referenceData.status} />
            </DataItemValue>
            <FileDataItems
              file={referenceData}
              fileSet={fileSet}
              derivedFrom={derivedFrom}
            >
              {referenceData.assembly && (
                <>
                  <DataItemLabel>Genome Assembly</DataItemLabel>
                  <DataItemValue>{referenceData.assembly}</DataItemValue>
                </>
              )}
              {referenceData.source && (
                <>
                  <DataItemLabel>Source</DataItemLabel>
                  <DataItemValue>
                    <Link
                      href={referenceData.source}
                      key={referenceData.source}
                    >
                      {referenceData.source}
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
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
}

ReferenceData.propTypes = {
  // File object to display
  referenceData: PropTypes.object.isRequired,
  // Award applied to this file
  award: PropTypes.object,
  // Lab that submitted this sile
  lab: PropTypes.object,
  // File set that contains this file
  fileSet: PropTypes.object,
  // Documents set that contains this file
  documents: PropTypes.array,
  // The files participating as inputs into software to produce this output file
  derivedFrom: PropTypes.array,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const referenceData = await request.getObject(
    `/reference-data/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(referenceData)) {
    const award = await request.getObject(referenceData.award, null);
    const lab = await request.getObject(referenceData.lab, null);
    const fileSet = await request.getObject(referenceData.file_set, null);
    const documents = referenceData.documents
      ? await request.getMultipleObjects(referenceData.documents, null, {
          filterErrors: true,
        })
      : [];
    const derivedFrom = referenceData.derived_from
      ? await request.getMultipleObjects(referenceData.derived_from, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      referenceData,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        referenceData,
        award,
        lab,
        fileSet,
        documents,
        derivedFrom,
        pageContext: { title: referenceData.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(referenceData);
}

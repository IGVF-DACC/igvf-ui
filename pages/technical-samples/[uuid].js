// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { SampleDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { formatDate } from "../../lib/dates";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function TechnicalSample({ sample, documents }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sample}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={sample.status} />
            </DataItemValue>
            <SampleDataItems sample={sample} source={sample.source}>
              {sample.date && (
                <>
                  <DataItemLabel>Technical Sample Date</DataItemLabel>
                  <DataItemValue>{formatDate(sample.date)}</DataItemValue>
                </>
              )}
              <DataItemLabel>Sample Material</DataItemLabel>
              <DataItemValue>{sample.sample_material}</DataItemValue>
              <DataItemLabel>Technical Sample Term</DataItemLabel>
              <DataItemValue>
                <Link href={sample.technical_sample_term["@id"]}>
                  {sample.technical_sample_term.term_name}
                </Link>
              </DataItemValue>
            </SampleDataItems>
          </DataArea>
        </DataPanel>
        {documents.length > 0 && (
          <>
            <DataAreaTitle>Documents</DataAreaTitle>
            <DocumentTable documents={documents} />
          </>
        )}
        <Attribution award={sample.award} lab={sample.lab} />
      </EditableItem>
    </>
  );
}

TechnicalSample.propTypes = {
  // Technical sample to display
  sample: PropTypes.object.isRequired,
  // Documents associated with this technical sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sample = await request.getObject(`/technical-samples/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(sample)) {
    const documents = sample.documents
      ? await request.getMultipleObjects(sample.documents, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      sample,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        sample,
        documents,
        pageContext: {
          title: sample.accession,
        },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(sample);
}

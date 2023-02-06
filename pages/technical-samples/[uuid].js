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

const TechnicalSample = ({
  sample,
  award = null,
  documents,
  lab = null,
  source = null,
  technicalSampleTerm,
}) => {
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
            <SampleDataItems sample={sample} source={source}>
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
                <Link href={technicalSampleTerm["@id"]}>
                  {technicalSampleTerm.term_name}
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
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
};

TechnicalSample.propTypes = {
  // Technical sample to display
  sample: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.object,
  // Documents associated with this technical sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.object,
  // Source lab or source for this technical sample
  source: PropTypes.object,
  // Tehnical sample ontology for the technical sample
  technicalSampleTerm: PropTypes.object.isRequired,
};

export default TechnicalSample;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sample = await request.getObject(`/technical-samples/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(sample)) {
    const award = await request.getObject(sample.award, null);
    const documents = sample.documents
      ? await request.getMultipleObjects(sample.documents, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(sample.lab, null);
    const source = await request.getObject(sample.source, null);
    const technicalSampleTerm = await request.getObject(
      sample.technical_sample_term,
      null
    );
    const breadcrumbs = await buildBreadcrumbs(
      sample,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        sample,
        award,
        documents,
        lab,
        source,
        technicalSampleTerm,
        pageContext: {
          title: `${
            technicalSampleTerm ? `${technicalSampleTerm.term_name} — ` : ""
          }${sample.accession}`,
        },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(sample);
};

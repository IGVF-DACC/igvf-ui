// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
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
import TreatmentTable from "../../components/treatment-table";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function WholeOrganism({
  sample,
  donors,
  award = null,
  documents,
  lab = null,
  source = null,
  treatments,
  biosampleTerm = null,
  diseaseTerms,
  pooledFrom,
  partOf,
}) {
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
            <BiosampleDataItems
              biosample={sample}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerms={diseaseTerms}
              pooledFrom={pooledFrom}
              partOf={partOf}
              options={{
                dateObtainedTitle: "Date Obtained",
              }}
            ></BiosampleDataItems>
          </DataArea>
        </DataPanel>
        {treatments.length > 0 && (
          <>
            <DataAreaTitle>Treatments</DataAreaTitle>
            <TreatmentTable treatments={treatments} />
          </>
        )}
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

WholeOrganism.propTypes = {
  // WholeOrganism sample to display
  sample: PropTypes.object.isRequired,
  // Award applied to this sample
  award: PropTypes.object,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this sample
  lab: PropTypes.object,
  // Source lab or source for this sample
  source: PropTypes.object,
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample ontology for this sample
  biosampleTerm: PropTypes.object,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample(s) Pooled From
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Part of Biosample
  partOf: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sample = await request.getObject(`/whole-organisms/${params.id}/`);
  if (FetchRequest.isResponseSuccess(sample)) {
    const award = await request.getObject(sample.award, null);
    const biosampleTerm = sample.biosample_term
      ? await request.getObject(sample.biosample_term, null)
      : null;
    const diseaseTerms = sample.disease_terms
      ? await request.getMultipleObjects(sample.disease_terms, null, {
          filterErrors: true,
        })
      : [];
    const documents = sample.documents
      ? await request.getMultipleObjects(sample.documents, null, {
          filterErrors: true,
        })
      : [];
    const donors = sample.donors
      ? await request.getMultipleObjects(sample.donors, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(sample.lab, null);
    const source = await request.getObject(sample.source, null);
    const treatments = sample.treatments
      ? await request.getMultipleObjects(sample.treatments, null, {
          filterErrors: true,
        })
      : [];
    const pooledFrom =
      sample.pooled_from?.length > 1
        ? await request.getMultipleObjects(sample.pooled_from, null, {
            filterErrors: true,
          })
        : [];
    const partOf = sample.part_of
      ? await request.getObject(sample.part_of, null)
      : null;
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
        donors,
        lab,
        source,
        treatments,
        biosampleTerm,
        diseaseTerms,
        pooledFrom,
        partOf,
        pageContext: {
          title: `${biosampleTerm ? `${biosampleTerm.term_name} — ` : ""}${
            sample.accession
          }`,
        },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(sample);
}

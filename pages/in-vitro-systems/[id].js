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
import buildAttribution from "../../lib/attribution";

export default function InVitroSystem({
  inVitroSystem,
  biosampleTerm = null,
  diseaseTerms,
  documents,
  donors,
  source = null,
  treatments,
  pooledFrom,
  partOf,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={inVitroSystem}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={inVitroSystem.status} />
            </DataItemValue>
            <BiosampleDataItems
              biosample={inVitroSystem}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerms={diseaseTerms}
              pooledFrom={pooledFrom}
              partOf={partOf}
              options={{
                dateObtainedTitle: "Date Collected",
              }}
            >
              <DataItemLabel>Classification</DataItemLabel>
              <DataItemValue>{inVitroSystem.classification}</DataItemValue>
              {inVitroSystem.passage_number && (
                <>
                  <DataItemLabel>Passage Number</DataItemLabel>
                  <DataItemValue>{inVitroSystem.passage_number}</DataItemValue>
                </>
              )}
            </BiosampleDataItems>
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
        <Attribution attribution={attribution} />
      </EditableItem>
    </>
  );
}

InVitroSystem.propTypes = {
  // In Vitro System sample to display
  inVitroSystem: PropTypes.object.isRequired,
  // Biosample ontology for this sample
  biosampleTerm: PropTypes.object,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Source lab or source for this sample
  source: PropTypes.object,
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample(s) Pooled From
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Part of Biosample
  partOf: PropTypes.object,
  // Attribution for this sample
  attribution: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const inVitroSystem = await request.getObject(
    `/in-vitro-systems/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(inVitroSystem)) {
    const biosampleTerm = inVitroSystem.biosample_term
      ? await request.getObject(inVitroSystem.biosample_term["@id"], null)
      : null;
    let diseaseTerms = [];
    if (inVitroSystem.disease_terms) {
      const diseaseTermPaths = inVitroSystem.disease_terms.map(
        (diseaseTerm) => diseaseTerm["@id"]
      );
      diseaseTerms = await request.getMultipleObjects(diseaseTermPaths, null, {
        filterErrors: true,
      });
    }
    const documents = inVitroSystem.documents
      ? await request.getMultipleObjects(inVitroSystem.documents, null, {
          filterErrors: true,
        })
      : [];
    const donors = inVitroSystem.donors
      ? await request.getMultipleObjects(inVitroSystem.donors, null, {
          filterErrors: true,
        })
      : [];
    const source = await request.getObject(inVitroSystem.source["@id"], null);
    let treatments = [];
    if (inVitroSystem.treatments) {
      const treatmentPaths = inVitroSystem.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await request.getMultipleObjects(treatmentPaths, null, {
        filterErrors: true,
      });
    }
    const pooledFrom =
      inVitroSystem.pooled_from?.length > 0
        ? await request.getMultipleObjects(inVitroSystem.pooled_from, null, {
            filterErrors: true,
          })
        : [];
    const partOf = inVitroSystem.part_of
      ? await request.getObject(inVitroSystem.part_of, null)
      : null;
    const breadcrumbs = await buildBreadcrumbs(
      inVitroSystem,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      inVitroSystem,
      req.headers.cookie
    );
    return {
      props: {
        inVitroSystem,
        biosampleTerm,
        diseaseTerms,
        documents,
        donors,
        source,
        treatments,
        pooledFrom,
        partOf,
        pageContext: {
          title: `${biosampleTerm ? `${biosampleTerm.term_name} — ` : ""}${
            inVitroSystem.accession
          }`,
        },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(inVitroSystem);
}

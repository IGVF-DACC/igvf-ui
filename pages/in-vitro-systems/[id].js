// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import BiomarkerTable from "../../components/biomarker-table";
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
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import PagePreamble from "../../components/page-preamble";
import TreatmentTable from "../../components/treatment-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function InVitroSystem({
  inVitroSystem,
  biosampleTerm = null,
  diseaseTerms,
  documents,
  donors,
  source = null,
  treatments,
  pooledFrom,
  biomarkers,
  partOf,
  targetedSampleTerm = null,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={inVitroSystem}>
        <PagePreamble />
        <JsonDisplay item={inVitroSystem} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                biosample={inVitroSystem}
                source={source}
                donors={donors}
                biosampleTerm={biosampleTerm}
                diseaseTerms={diseaseTerms}
                pooledFrom={pooledFrom}
                partOf={partOf}
                classification={inVitroSystem.classification}
                options={{
                  dateObtainedTitle: "Date Collected",
                }}
              >
                {targetedSampleTerm && (
                  <>
                    <DataItemLabel>Targeted Sample Term</DataItemLabel>
                    <DataItemValue>
                      <Link href={targetedSampleTerm["@id"]}>
                        {targetedSampleTerm.term_name}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {truthyOrZero(inVitroSystem.passage_number) && (
                  <>
                    <DataItemLabel>Passage Number</DataItemLabel>
                    <DataItemValue>
                      {inVitroSystem.passage_number}
                    </DataItemValue>
                  </>
                )}
              </BiosampleDataItems>
            </DataArea>
          </DataPanel>
          {biomarkers.length > 0 && (
            <>
              <DataAreaTitle>Biomarkers</DataAreaTitle>
              <BiomarkerTable biomarkers={biomarkers} />
            </>
          )}
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
        </JsonDisplay>
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
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Part of Biosample
  partOf: PropTypes.object,
  // The targeted endpoint biosample resulting from differentation or reprogramming
  targetedSampleTerm: PropTypes.object,
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
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
    const targetedSampleTerm = inVitroSystem.targeted_sample_term
      ? await request.getObject(inVitroSystem.targeted_sample_term, null)
      : null;
    const biomarkers =
      inVitroSystem.biomarkers?.length > 0
        ? await request.getMultipleObjects(inVitroSystem.biomarkers, null, {
            filterErrors: true,
          })
        : [];
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
        targetedSampleTerm,
        biomarkers,
        pageContext: {
          title: `${biosampleTerm ? `${biosampleTerm.term_name} — ` : ""}${
            inVitroSystem.accession
          }`,
        },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(inVitroSystem);
}

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
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
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ModificationsTable from "../../components/modification-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import TreatmentTable from "../../components/treatment-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestBiomarkers,
  requestBiosamples,
  requestDocuments,
  requestDonors,
  requestOntologyTerms,
  requestTreatments,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function InVitroSystem({
  inVitroSystem,
  diseaseTerms,
  documents,
  donors,
  sources,
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
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={inVitroSystem.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={inVitroSystem} isJsonFormat={isJson} />
        <JsonDisplay item={inVitroSystem} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={inVitroSystem}
                sources={sources}
                donors={donors}
                sampleTerms={inVitroSystem.sample_terms}
                diseaseTerms={diseaseTerms}
                pooledFrom={pooledFrom}
                partOf={partOf}
                classification={inVitroSystem.classification}
                options={{
                  dateObtainedTitle: "Date Collected",
                }}
              >
                {inVitroSystem.originated_from && (
                  <>
                    <DataItemLabel>Originated From Biosample</DataItemLabel>
                    <DataItemValue>
                      <Link href={inVitroSystem.originated_from["@id"]}>
                        {inVitroSystem.originated_from.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
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
                {truthyOrZero(inVitroSystem.time_post_change) && (
                  <>
                    <DataItemLabel>Time Post Change</DataItemLabel>
                    <DataItemValue>
                      {inVitroSystem.time_post_change}
                      {inVitroSystem.time_post_change_units ? (
                        <> {inVitroSystem.time_post_change_units}</>
                      ) : (
                        ""
                      )}
                    </DataItemValue>
                  </>
                )}
              </BiosampleDataItems>
            </DataArea>
          </DataPanel>
          {inVitroSystem.file_sets?.length > 0 && (
            <>
              <DataAreaTitle>File Sets</DataAreaTitle>
              <FileSetTable fileSets={inVitroSystem.file_sets} />
            </>
          )}
          {inVitroSystem.modifications?.length > 0 && (
            <>
              <DataAreaTitle>Modifications</DataAreaTitle>
              <ModificationsTable modifications={inVitroSystem.modifications} />
            </>
          )}
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
          {inVitroSystem.cell_fate_change_treatments?.length > 0 && (
            <>
              <DataAreaTitle>Cell Fate Change Treatments</DataAreaTitle>
              <TreatmentTable
                treatments={inVitroSystem.cell_fate_change_treatments}
              />
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
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample(s) Pooled From
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Part of Biosample
  partOf: PropTypes.object,
  // The targeted endpoint biosample resulting from differentiation or reprogramming
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
    let diseaseTerms = [];
    if (inVitroSystem.disease_terms) {
      const diseaseTermPaths = inVitroSystem.disease_terms.map(
        (diseaseTerm) => diseaseTerm["@id"]
      );
      diseaseTerms = await requestOntologyTerms(diseaseTermPaths, request);
    }
    const documents = inVitroSystem.documents
      ? await requestDocuments(inVitroSystem.documents, request)
      : [];
    const donors = inVitroSystem.donors
      ? await requestDonors(inVitroSystem.donors, request)
      : [];
    let sources = [];
    if (inVitroSystem.sources?.length > 0) {
      const sourcePaths = inVitroSystem.sources.map((source) => source["@id"]);
      sources = await request.getMultipleObjects(sourcePaths, null, {
        filterErrors: true,
      });
    }
    let treatments = [];
    if (inVitroSystem.treatments) {
      const treatmentPaths = inVitroSystem.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }
    const pooledFrom =
      inVitroSystem.pooled_from?.length > 0
        ? await requestBiosamples(inVitroSystem.pooled_from, request)
        : [];
    const partOf = inVitroSystem.part_of
      ? await request.getObject(inVitroSystem.part_of, null)
      : null;
    const targetedSampleTerm = inVitroSystem.targeted_sample_term
      ? await request.getObject(inVitroSystem.targeted_sample_term, null)
      : null;
    const biomarkers =
      inVitroSystem.biomarkers?.length > 0
        ? await requestBiomarkers(inVitroSystem.biomarkers, request)
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
        diseaseTerms,
        documents,
        donors,
        sources,
        treatments,
        pooledFrom,
        partOf,
        targetedSampleTerm,
        biomarkers,
        pageContext: {
          title: `${inVitroSystem.sample_terms[0].term_name} — ${inVitroSystem.accession}`,
        },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(inVitroSystem);
}

// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
import { DataArea, DataAreaTitle, DataPanel } from "../../components/data-area";
import BiomarkerTable from "../../components/biomarker-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
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
import { isJsonFormat } from "../../lib/query-utils";

export default function WholeOrganism({
  sample,
  donors,
  documents,
  sources = null,
  treatments,
  sampleTerms = null,
  diseaseTerms,
  pooledFrom,
  biomarkers,
  partOf,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sample}>
        <PagePreamble />
        <ObjectPageHeader item={sample} isJsonFormat={isJson} />
        <JsonDisplay item={sample} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={sample}
                sources={sources}
                donors={donors}
                sampleTerms={sampleTerms}
                diseaseTerms={diseaseTerms}
                pooledFrom={pooledFrom}
                partOf={partOf}
                options={{
                  dateObtainedTitle: "Date Obtained",
                }}
              ></BiosampleDataItems>
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

WholeOrganism.propTypes = {
  // WholeOrganism sample to display
  sample: PropTypes.object.isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample ontology for this sample
  sampleTerms: PropTypes.arrayOf(PropTypes.object),
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample(s) Pooled From
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Part of Biosample
  partOf: PropTypes.object,
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sample = await request.getObject(`/whole-organisms/${params.id}/`);
  if (FetchRequest.isResponseSuccess(sample)) {
    const sampleTerms =
      sample.sample_terms?.length > 0 ? sample.sample_terms : [];
    let diseaseTerms = [];
    if (sample.disease_terms?.length > 0) {
      const diseaseTermPaths = sample.disease_terms.map(
        (diseaseTerm) => diseaseTerm["@id"]
      );
      diseaseTerms = await requestOntologyTerms(diseaseTermPaths, request);
    }
    const documents = sample.documents
      ? await requestDocuments(sample.documents, request)
      : [];
    const donors = sample.donors
      ? await requestDonors(sample.donors, request)
      : [];
    const sources = sample.sources?.length > 0 ? sample.sources : [];
    let treatments = [];
    if (sample.treatments?.length > 0) {
      const treatmentPaths = sample.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }
    const pooledFrom =
      sample.pooled_from?.length > 0
        ? await requestBiosamples(sample.pooled_from, request)
        : [];
    const biomarkers =
      sample.biomarkers?.length > 0
        ? await requestBiomarkers(
            // Biomarkers are embedded in whole organism, so we map
            // to get as a list of IDs for the request
            sample.biomarkers.map((m) => m["@id"]),
            request
          )
        : [];
    const partOf = sample.part_of
      ? await request.getObject(sample.part_of, null)
      : null;
    const breadcrumbs = await buildBreadcrumbs(
      sample,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(sample, req.headers.cookie);
    return {
      props: {
        sample,
        documents,
        donors,
        sources,
        treatments,
        sampleTerms,
        diseaseTerms,
        pooledFrom,
        partOf,
        biomarkers,
        pageContext: {
          title: `${
            sampleTerms.length > 0 ? `${sampleTerms[0].term_name} — ` : ""
          }${sample.accession}`,
        },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(sample);
}

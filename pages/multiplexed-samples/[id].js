// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import BiomarkerTable from "../../components/biomarker-table";
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
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ModificationsTable from "../../components/modification-table";
import MultiplexedTable from "../../components/multiplexed-sample-table";
import TreatmentTable from "../../components/treatment-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
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

export default function MultiplexedSample({
  sample,
  documents,
  attribution = null,
  sources,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sample}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={sample.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={sample} isJsonFormat={isJson} />
        <JsonDisplay item={sample} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <SampleDataItems item={sample} sources={sources}>
                {sample.date && (
                  <>
                    <DataItemLabel>Date Harvested</DataItemLabel>
                    <DataItemValue>
                      {formatDate(sample.date_obtained)}
                    </DataItemValue>
                  </>
                )}
                <DataItemLabel>Sample Material</DataItemLabel>
                <DataItemValue>{sample.sample_material}</DataItemValue>
                <DataItemLabel>Sample Terms</DataItemLabel>
                <DataItemValue>
                  <Link href={sample.sample_terms[0]["@id"]}>
                    {sample.sample_terms[0].term_name}
                  </Link>
                </DataItemValue>
              </SampleDataItems>
            </DataArea>
          </DataPanel>
          {sample.multiplexed_samples?.length > 0 && (
            <>
              <DataAreaTitle>Multiplexed Sample</DataAreaTitle>
              <MultiplexedTable
                multiplexed_samples={sample.multiplexed_samples}
              />
            </>
          )}
          {sample.modifications?.length > 0 && (
            <>
              <DataAreaTitle>Modifications</DataAreaTitle>
              <ModificationsTable modifications={sample.modifications} />
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

MultiplexedSample.propTypes = {
  // MultiplexedSample-cell sample to display
  multiplexedSample: PropTypes.object.isRequired,
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
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const multiplexedSample = await request.getObject(
    `/multiplexed-samples/${params.uuid}/`
  );
  if (FetchRequest.isResponseSuccess(multiplexedSample)) {
    let diseaseTerms = [];
    if (multiplexedSample.disease_terms?.length > 0) {
      const diseaseTermPaths = multiplexedSample.disease_terms.map(
        (diseaseTerm) => diseaseTerm["@id"]
      );
      diseaseTerms = await requestOntologyTerms(diseaseTermPaths, request);
    }
    const documents = multiplexedSample.documents
      ? await requestDocuments(multiplexedSample.documents, request)
      : [];
    const donors = multiplexedSample.donors
      ? await requestDonors(multiplexedSample.donors, request)
      : [];
    let sources = [];
    if (multiplexedSample.sources?.length > 0) {
      const sourcePaths = multiplexedSample.sources.map(
        (source) => source["@id"]
      );
      sources = await request.getMultipleObjects(sourcePaths, null, {
        filterErrors: true,
      });
    }
    const treatments = multiplexedSample.treatments
      ? await requestTreatments(multiplexedSample.treatments, request)
      : [];
    const pooledFrom =
      multiplexedSample.pooled_from?.length > 0
        ? await requestBiosamples(multiplexedSample.pooled_from, request)
        : [];
    const partOf = multiplexedSample.part_of
      ? await request.getObject(multiplexedSample.part_of, null)
      : null;
    const biomarkers =
      multiplexedSample.biomarkers?.length > 0
        ? await requestBiomarkers(multiplexedSample.biomarkers, request)
        : [];
    const breadcrumbs = await buildBreadcrumbs(
      multiplexedSample,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      multiplexedSample,
      req.headers.cookie
    );
    return {
      props: {
        multiplexedSample,
        diseaseTerms,
        documents,
        donors,
        sources,
        treatments,
        pooledFrom,
        partOf,
        biomarkers,
        pageContext: {
          title: `${multiplexedSample.sample_terms[0].term_name} — ${multiplexedSample.accession}`,
        },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(multiplexedSample);
}

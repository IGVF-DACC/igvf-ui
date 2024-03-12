// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
import { DataArea, DataPanel } from "../../components/data-area";
import BiomarkerTable from "../../components/biomarker-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ModificationTable from "../../components/modification-table";
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
  requestFileSets,
  requestOntologyTerms,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function WholeOrganism({
  sample,
  biomarkers,
  constructLibrarySets,
  diseaseTerms,
  documents,
  donors,
  partOf,
  parts,
  pooledFrom,
  pooledIn,
  sortedFractions,
  sources,
  attribution = null,
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
              <BiosampleDataItems
                item={sample}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                donors={donors}
                partOf={partOf}
                parts={parts}
                pooledFrom={pooledFrom}
                pooledIn={pooledIn}
                sampleTerms={sample.sample_terms}
                sortedFractions={sortedFractions}
                sources={sources}
                options={{
                  dateObtainedTitle: "Date Obtained",
                }}
              />
            </DataArea>
          </DataPanel>
          {sample.file_sets.length > 0 && (
            <FileSetTable
              fileSets={sample.file_sets}
              reportLinkSpecs={{
                fileSetType: "FileSet",
                identifierProp: "samples.accession",
                itemIdentifier: sample.accession,
              }}
            />
          )}
          {sample.modifications?.length > 0 && (
            <ModificationTable modifications={sample.modifications} />
          )}
          {biomarkers.length > 0 && <BiomarkerTable biomarkers={biomarkers} />}
          {sample.treatments?.length > 0 && (
            <TreatmentTable treatments={sample.treatments} />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

WholeOrganism.propTypes = {
  // WholeOrganism sample to display
  sample: PropTypes.object.isRequired,
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Construct library sets associated with the sample
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Part of Sample
  partOf: PropTypes.object,
  // Sample parts
  parts: PropTypes.arrayOf(PropTypes.object),
  // Pooled from sample
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Pooled in sample
  pooledIn: PropTypes.arrayOf(PropTypes.object),
  // Sorted fractions sample
  sortedFractions: PropTypes.arrayOf(PropTypes.object),
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sample = (
    await request.getObject(`/whole-organisms/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(sample)) {
    const biomarkers =
      sample.biomarkers?.length > 0
        ? await requestBiomarkers(sample.biomarkers, request)
        : [];
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
    const partOf = sample.part_of
      ? (await request.getObject(sample.part_of)).optional()
      : null;
    const parts =
      sample.parts?.length > 0
        ? await requestBiosamples(sample.parts, request)
        : [];
    const pooledFrom =
      sample.pooled_from?.length > 0
        ? await requestBiosamples(sample.pooled_from, request)
        : [];
    const pooledIn =
      sample.pooled_in?.length > 0
        ? await requestBiosamples(sample.pooled_in, request)
        : [];
    const sortedFractions =
      sample.sorted_fractions?.length > 0
        ? await requestBiosamples(sample.sorted_fractions, request)
        : [];
    let sources = [];
    if (sample.sources?.length > 0) {
      const sourcePaths = sample.sources.map((source) => source["@id"]);
      sources = Ok.all(
        await request.getMultipleObjects(sourcePaths, {
          filterErrors: true,
        })
      );
    }
    const constructLibrarySets = sample.construct_library_sets
      ? await requestFileSets(sample.construct_library_sets, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      sample,
      sample.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(sample, req.headers.cookie);
    return {
      props: {
        sample,
        biomarkers,
        constructLibrarySets,
        diseaseTerms,
        documents,
        donors,
        partOf,
        parts,
        pooledFrom,
        pooledIn,
        sortedFractions,
        sources,
        pageContext: {
          title: `${sample.sample_terms[0].term_name} — ${sample.accession}`,
        },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(sample);
}

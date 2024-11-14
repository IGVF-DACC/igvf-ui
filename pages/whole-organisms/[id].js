// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import BiomarkerTable from "../../components/biomarker-table";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
import { DataArea, DataPanel } from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ModificationTable from "../../components/modification-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import TreatmentTable from "../../components/treatment-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestBiomarkers,
  requestBiosamples,
  requestDocuments,
  requestDonors,
  requestFileSets,
  requestOntologyTerms,
  requestPublications,
  requestTreatments,
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
  parts,
  pooledIn,
  publications,
  sortedFractions,
  treatments,
  sources,
  multiplexedInSamples,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={sample} />
      <EditableItem item={sample}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={sample.alternate_accessions}
        />
        <ObjectPageHeader item={sample} isJsonFormat={isJson} />
        <JsonDisplay item={sample} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={sample}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                donors={donors}
                institutionalCertificates={sample.institutional_certificates}
                publications={publications}
                sampleTerms={sample.sample_terms}
                sources={sources}
                options={{
                  dateObtainedTitle: "Date Obtained",
                }}
              />
            </DataArea>
          </DataPanel>
          {donors.length > 0 && <DonorTable donors={donors} />}
          {sample.file_sets.length > 0 && (
            <FileSetTable
              fileSets={sample.file_sets}
              reportLink={`/multireport/?type=FileSet&samples.@id=${sample["@id"]}`}
              reportLabel="Report of file sets containing this sample"
            />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${sample["@id"]}`}
              reportLabel="Report of multiplexed samples in which this sample is included"
              title="Multiplexed In Samples"
              panelId="multiplexed-in-samples"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${sample["@id"]}`}
              reportLabel="Report of pooled samples in which this sample is included"
              title="Pooled In"
              panelId="pooled-in"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${sample["@id"]}`}
              reportLabel="Report of parts into which this sample has been divided"
              title="Sample Parts"
              panelId="sample-parts"
            />
          )}
          {sample.modifications?.length > 0 && (
            <ModificationTable
              modifications={sample.modifications}
              reportLink={`/multireport/?type=Modification&biosamples_modified=${sample["@id"]}`}
              reportLabel={`Report of genetic modifications for ${sample.accession}`}
            />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${sample["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
              panelId="sorted-fractions"
            />
          )}
          {biomarkers.length > 0 && (
            <BiomarkerTable
              biomarkers={biomarkers}
              reportLink={`/multireport/?type=Biomarker&biomarker_for=${sample["@id"]}`}
              reportLabel={`Report of biological markers that are associated with biosample ${sample.accession}`}
            />
          )}
          {treatments.length > 0 && (
            <TreatmentTable
              treatments={treatments}
              reportLink={`/multireport/?type=Treatment&biosamples_treated=${sample["@id"]}`}
              reportLabel={`Report of treatments applied to the biosample ${sample.accession}`}
            />
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
  // Sample parts
  parts: PropTypes.arrayOf(PropTypes.object),
  // Pooled in sample
  pooledIn: PropTypes.arrayOf(PropTypes.object),
  // Publications associated with the sample
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sorted fractions sample
  sortedFractions: PropTypes.arrayOf(PropTypes.object),
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Multiplexed in samples
  multiplexedInSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
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
    let biomarkers = [];
    if (sample.biomarkers?.length > 0) {
      const biomarkerPaths = sample.biomarkers.map(
        (biomarker) => biomarker["@id"]
      );
      biomarkers = await requestBiomarkers(biomarkerPaths, request);
    }
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
    const parts =
      sample.parts?.length > 0
        ? await requestBiosamples(sample.parts, request)
        : [];
    const pooledIn =
      sample.pooled_in?.length > 0
        ? await requestBiosamples(sample.pooled_in, request)
        : [];
    const sortedFractions =
      sample.sorted_fractions?.length > 0
        ? await requestBiosamples(sample.sorted_fractions, request)
        : [];
    let treatments = [];
    if (sample.treatments?.length > 0) {
      const treatmentPaths = sample.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }
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
    let multiplexedInSamples = [];
    if (sample.multiplexed_in.length > 0) {
      const multiplexedInPaths = sample.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestBiosamples(
        multiplexedInPaths,
        request
      );
    }
    let publications = [];
    if (sample.publications?.length > 0) {
      const publicationPaths = sample.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }
    const attribution = await buildAttribution(sample, req.headers.cookie);
    return {
      props: {
        sample,
        biomarkers,
        constructLibrarySets,
        diseaseTerms,
        documents,
        donors,
        parts,
        pooledIn,
        publications,
        sortedFractions,
        treatments,
        sources,
        multiplexedInSamples,
        pageContext: {
          title: `${sample.sample_terms[0].term_name} — ${sample.accession}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(sample);
}

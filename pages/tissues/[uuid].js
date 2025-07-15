// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import BiomarkerTable from "../../components/biomarker-table";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import FileSetTable from "../../components/file-set-table";
import { InstitutionalCertificateTable } from "../../components/institutional-certificate-table";
import JsonDisplay from "../../components/json-display";
import ModificationTable from "../../components/modification-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
import TreatmentTable from "../../components/treatment-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestBiomarkers,
  requestBiosamples,
  requestDocuments,
  requestDonors,
  requestFileSets,
  requestInstitutionalCertificates,
  requestOntologyTerms,
  requestPublications,
  requestSamples,
  requestTreatments,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function Tissue({
  tissue,
  biomarkers,
  constructLibrarySets,
  donors,
  originOf,
  documents,
  diseaseTerms,
  annotatedFrom,
  parts,
  partOf,
  pooledFrom,
  pooledIn,
  publications,
  sortedFractions,
  sources,
  treatments,
  multiplexedInSamples,
  institutionalCertificates,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={tissue} />
      <EditableItem item={tissue}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={tissue.alternate_accessions}
        />
        <ObjectPageHeader item={tissue} isJsonFormat={isJson} />
        <JsonDisplay item={tissue} isJsonFormat={isJson}>
          <StatusPreviewDetail item={tissue} />
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={tissue}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                annotatedFrom={annotatedFrom}
                partOf={partOf}
                publications={publications}
                sampleTerms={tissue.sample_terms}
                sources={sources}
                options={{
                  dateObtainedTitle: "Date Harvested",
                }}
              >
                {tissue.pmi && (
                  <>
                    <DataItemLabel>Post-mortem Interval</DataItemLabel>
                    <DataItemValue>
                      {tissue.pmi}
                      {tissue.pmi_units ? (
                        <>
                          {" "}
                          {tissue.pmi_units}
                          {tissue.pmi_units === 1 ? "" : "s"}
                        </>
                      ) : (
                        ""
                      )}
                    </DataItemValue>
                  </>
                )}
                {tissue.preservation_method && (
                  <>
                    <DataItemLabel>Preservation Method</DataItemLabel>
                    <DataItemValue>{tissue.preservation_method}</DataItemValue>
                  </>
                )}
                {tissue.ccf_id && (
                  <>
                    <DataItemLabel>
                      Common Coordinate Framework Identifier
                    </DataItemLabel>
                    <a
                      href={`https://portal.hubmapconsortium.org/browse/sample/${tissue.ccf_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tissue.ccf_id}
                    </a>
                  </>
                )}
              </BiosampleDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {donors.length > 0 && <DonorTable donors={donors} />}
          {tissue.file_sets.length > 0 && (
            <FileSetTable fileSets={tissue.file_sets} />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${tissue["@id"]}`}
              reportLabel="Report of multiplexed samples in which this sample is included"
              title="Multiplexed In Samples"
              panelId="multiplexed-in-samples"
            />
          )}
          {pooledFrom.length > 0 && (
            <SampleTable
              samples={pooledFrom}
              reportLink={`/multireport/?type=Sample&pooled_in=${tissue["@id"]}`}
              reportLabel="Report of biosamples this biosample is pooled from"
              title="Biosamples Pooled From"
              panelId="pooled-from"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${tissue["@id"]}`}
              reportLabel="Report of pooled samples in which this sample is included"
              title="Pooled In"
              panelId="pooled-in"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${tissue["@id"]}`}
              reportLabel="Report of parts into which this sample has been divided"
              title="Sample Parts"
              panelId="sample-parts"
            />
          )}
          {originOf.length > 0 && (
            <SampleTable
              samples={originOf}
              reportLink={`/multireport/?type=Biosample&originated_from.@id=${tissue["@id"]}`}
              reportLabel="Report of samples which originate from this sample"
              title="Origin Sample Of"
              panelId="origin-of"
            />
          )}
          {tissue.modifications?.length > 0 && (
            <ModificationTable
              modifications={tissue.modifications}
              reportLink={`/multireport/?type=Modification&biosamples_modified=${tissue["@id"]}`}
              reportLabel={`Report of genetic modifications for ${tissue.accession}`}
            />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${tissue["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
              panelId="sorted-fractions"
            />
          )}
          {biomarkers.length > 0 && (
            <BiomarkerTable
              biomarkers={biomarkers}
              reportLink={`/multireport/?type=Biomarker&biomarker_for=${tissue["@id"]}`}
              reportLabel={`Report of biological markers that are associated with biosample ${tissue.accession}`}
            />
          )}
          {treatments.length > 0 && (
            <TreatmentTable
              treatments={treatments}
              reportLink={`/multireport/?type=Treatment&biosamples_treated=${tissue["@id"]}`}
              reportLabel={`Report of treatments applied to the biosample ${tissue.accession}`}
            />
          )}
          {institutionalCertificates.length > 0 && (
            <InstitutionalCertificateTable
              institutionalCertificates={institutionalCertificates}
              reportLink={`/multireport/?type=InstitutionalCertificate&samples=${tissue["@id"]}`}
              reportLabel={`Report of institutional certificates associated with ${tissue.accession}`}
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Tissue.propTypes = {
  // Tissue sample to display
  tissue: PropTypes.object.isRequired,
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Construct library sets associated with the sample
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Annotated from sample
  annotatedFrom: PropTypes.object,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Origin of sample
  originOf: PropTypes.arrayOf(PropTypes.object),
  // Part of Sample
  partOf: PropTypes.object,
  // Sample parts
  parts: PropTypes.arrayOf(PropTypes.object),
  // Pooled from sample
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
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
  // Institutional certificates referencing this sample
  institutionalCertificates: PropTypes.arrayOf(PropTypes.object),
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const tissue = (await request.getObject(`/tissues/${params.uuid}/`)).union();
  if (FetchRequest.isResponseSuccess(tissue)) {
    let biomarkers = [];
    if (tissue.biomarkers?.length > 0) {
      const biomarkerPaths = tissue.biomarkers.map(
        (biomarker) => biomarker["@id"]
      );
      biomarkers = await requestBiomarkers(biomarkerPaths, request);
    }
    let diseaseTerms = [];
    if (tissue.disease_terms?.length > 0) {
      const diseaseTermPaths = tissue.disease_terms.map((term) => term["@id"]);
      diseaseTerms = await requestOntologyTerms(diseaseTermPaths, request);
    }
    const documents = tissue.documents
      ? await requestDocuments(tissue.documents, request)
      : [];
    let donors = [];
    if (tissue.donors?.length > 0) {
      const donorPaths = tissue.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }
    const partOf = tissue.part_of
      ? (await request.getObject(tissue.part_of)).optional()
      : null;
    const parts =
      tissue.parts?.length > 0
        ? await requestBiosamples(tissue.parts, request)
        : [];
    const pooledFrom =
      tissue.pooled_from?.length > 0
        ? await requestBiosamples(tissue.pooled_from, request)
        : [];
    const pooledIn =
      tissue.pooled_in?.length > 0
        ? await requestBiosamples(tissue.pooled_in, request)
        : [];
    const originOf =
      tissue.origin_of?.length > 0
        ? await requestBiosamples(tissue.origin_of, request)
        : [];
    const sortedFractions =
      tissue.sorted_fractions?.length > 0
        ? await requestSamples(tissue.sorted_fractions, request)
        : [];
    let sources = [];
    if (tissue.sources?.length > 0) {
      const sourcePaths = tissue.sources.map((source) => source["@id"]);
      sources = Ok.all(
        await request.getMultipleObjects(sourcePaths, {
          filterErrors: true,
        })
      );
    }
    let treatments = [];
    if (tissue.treatments?.length > 0) {
      const treatmentPaths = tissue.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }
    let constructLibrarySets = [];
    if (tissue.construct_library_sets?.length > 0) {
      const constructLibrarySetPaths = tissue.construct_library_sets.map(
        (constructLibrarySet) => constructLibrarySet["@id"]
      );
      constructLibrarySets = await requestFileSets(
        constructLibrarySetPaths,
        request
      );
    }
    let multiplexedInSamples = [];
    if (tissue.multiplexed_in.length > 0) {
      const multiplexedInPaths = tissue.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestSamples(multiplexedInPaths, request);
    }
    let institutionalCertificates = [];
    if (tissue.institutional_certificates?.length > 0) {
      const institutionalCertificatePaths =
        tissue.institutional_certificates.map(
          (institutionalCertificate) => institutionalCertificate["@id"]
        );
      institutionalCertificates = await requestInstitutionalCertificates(
        institutionalCertificatePaths,
        request
      );
    }
    const annotatedFrom = tissue.annotated_from
      ? (await request.getObject(tissue.annotated_from)).optional()
      : null;
    let publications = [];
    if (tissue.publications?.length > 0) {
      const publicationPaths = tissue.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }
    const attribution = await buildAttribution(tissue, req.headers.cookie);
    return {
      props: {
        tissue,
        biomarkers,
        constructLibrarySets,
        diseaseTerms,
        annotatedFrom,
        documents,
        donors,
        originOf,
        parts,
        partOf,
        pooledFrom,
        pooledIn,
        publications,
        sortedFractions,
        sources,
        treatments,
        multiplexedInSamples,
        institutionalCertificates,
        pageContext: {
          title: `${tissue.accession} ${UC.mdash} ${tissue.sample_terms[0].term_name}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(tissue);
}

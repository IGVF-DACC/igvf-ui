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
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
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
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
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
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function PrimaryCell({
  primaryCell,
  biomarkers,
  constructLibrarySets,
  diseaseTerms,
  annotatedFrom,
  documents,
  donors,
  originOf,
  partOf,
  parts,
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
      <Breadcrumbs item={primaryCell} />
      <EditableItem item={primaryCell}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={primaryCell.alternate_accessions}
        />
        <ObjectPageHeader item={primaryCell} isJsonFormat={isJson} />
        <JsonDisplay item={primaryCell} isJsonFormat={isJson}>
          <StatusPreviewDetail item={primaryCell} />
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={primaryCell}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                annotatedFrom={annotatedFrom}
                partOf={partOf}
                publications={publications}
                sampleTerms={primaryCell.sample_terms}
                sources={sources}
                options={{
                  dateObtainedTitle: "Date Harvested",
                }}
              >
                {truthyOrZero(primaryCell.passage_number) && (
                  <>
                    <DataItemLabel>Passage Number</DataItemLabel>
                    <DataItemValue>{primaryCell.passage_number}</DataItemValue>
                  </>
                )}
              </BiosampleDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {donors.length > 0 && <DonorTable donors={donors} />}
          {primaryCell.file_sets?.length > 0 && (
            <FileSetTable fileSets={primaryCell.file_sets} />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${primaryCell["@id"]}`}
              reportLabel="Report of multiplexed samples in which this sample is included"
              title="Multiplexed In Samples"
              panelId="multiplexed-in-samples"
            />
          )}
          {pooledFrom.length > 0 && (
            <SampleTable
              samples={pooledFrom}
              reportLink={`/multireport/?type=Sample&pooled_in=${primaryCell["@id"]}`}
              reportLabel="Report of biosamples this sample is pooled from"
              title="Biosamples Pooled From"
              panelId="pooled-from"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${primaryCell["@id"]}`}
              reportLabel="Report of pooled samples in which this sample is included"
              title="Pooled In"
              panelId="pooled-in"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${primaryCell["@id"]}`}
              reportLabel="Report of parts into which this sample has been divided"
              title="Sample Parts"
              panelId="sample-parts"
            />
          )}
          {originOf.length > 0 && (
            <SampleTable
              samples={originOf}
              reportLink={`/multireport/?type=Biosample&originated_from.@id=${primaryCell["@id"]}`}
              reportLabel="Report of samples which originate from this sample"
              title="Origin Sample Of"
              panelId="origin-of"
            />
          )}
          {primaryCell.modifications?.length > 0 && (
            <ModificationTable
              modifications={primaryCell.modifications}
              reportLink={`/multireport/?type=Modification&biosamples_modified=${primaryCell["@id"]}`}
              reportLabel={`Report of genetic modifications for ${primaryCell.accession}`}
            />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${primaryCell["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
              panelId="sorted-fractions"
            />
          )}
          {biomarkers.length > 0 && (
            <BiomarkerTable
              biomarkers={biomarkers}
              reportLink={`/multireport/?type=Biomarker&biomarker_for=${primaryCell["@id"]}`}
              reportLabel={`Report of biological markers that are associated with biosample ${primaryCell.accession}`}
            />
          )}
          {treatments.length > 0 && (
            <TreatmentTable
              treatments={treatments}
              reportLink={`/multireport/?type=Treatment&biosamples_treated=${primaryCell["@id"]}`}
              reportLabel={`Report of treatments applied to the biosample ${primaryCell.accession}`}
            />
          )}
          {institutionalCertificates.length > 0 && (
            <InstitutionalCertificateTable
              institutionalCertificates={institutionalCertificates}
              reportLink={`/multireport/?type=InstitutionalCertificate&samples=${primaryCell["@id"]}`}
              reportLabel={`Report of institutional certificates associated with ${primaryCell.accession}`}
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

PrimaryCell.propTypes = {
  // Primary-cell sample to display
  primaryCell: PropTypes.object.isRequired,
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

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const primaryCell = (
    await request.getObject(`/primary-cells/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(primaryCell)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      primaryCell,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    let biomarkers = [];
    if (primaryCell.biomarkers?.length > 0) {
      const biomarkerPaths = primaryCell.biomarkers.map(
        (biomarker) => biomarker["@id"]
      );
      biomarkers = await requestBiomarkers(biomarkerPaths, request);
    }
    let diseaseTerms = [];
    if (primaryCell.disease_terms?.length > 0) {
      const diseaseTermPaths = primaryCell.disease_terms.map(
        (diseaseTerm) => diseaseTerm["@id"]
      );
      diseaseTerms = await requestOntologyTerms(diseaseTermPaths, request);
    }
    const documents = primaryCell.documents
      ? await requestDocuments(primaryCell.documents, request)
      : [];
    let donors = [];
    if (primaryCell.donors?.length > 0) {
      const donorPaths = primaryCell.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }
    const partOf = primaryCell.part_of
      ? (await request.getObject(primaryCell.part_of)).optional()
      : null;
    const parts =
      primaryCell.parts?.length > 0
        ? await requestBiosamples(primaryCell.parts, request)
        : [];
    const pooledFrom =
      primaryCell.pooled_from?.length > 0
        ? await requestBiosamples(primaryCell.pooled_from, request)
        : [];
    const pooledIn =
      primaryCell.pooled_in?.length > 0
        ? await requestBiosamples(primaryCell.pooled_in, request)
        : [];
    const originOf =
      primaryCell.origin_of?.length > 0
        ? await requestBiosamples(primaryCell.origin_of, request)
        : [];
    const sortedFractions =
      primaryCell.sorted_fractions?.length > 0
        ? await requestSamples(primaryCell.sorted_fractions, request)
        : [];
    let sources = [];
    if (primaryCell.sources?.length > 0) {
      const sourcePaths = primaryCell.sources.map((source) => source["@id"]);
      sources = Ok.all(
        await request.getMultipleObjects(sourcePaths, {
          filterErrors: true,
        })
      );
    }
    let treatments = [];
    if (primaryCell.treatments?.length > 0) {
      const treatmentPaths = primaryCell.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }
    let constructLibrarySets = [];
    if (primaryCell.construct_library_sets?.length > 0) {
      const constructLibrarySetPaths = primaryCell.construct_library_sets.map(
        (constructLibrarySet) => constructLibrarySet["@id"]
      );
      constructLibrarySets = await requestFileSets(
        constructLibrarySetPaths,
        request
      );
    }
    let multiplexedInSamples = [];
    if (primaryCell.multiplexed_in?.length > 0) {
      const multiplexedInPaths = primaryCell.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestSamples(multiplexedInPaths, request);
    }
    let institutionalCertificates = [];
    if (primaryCell.institutional_certificates?.length > 0) {
      const institutionalCertificatePaths =
        primaryCell.institutional_certificates.map(
          (institutionalCertificate) => institutionalCertificate["@id"]
        );
      institutionalCertificates = await requestInstitutionalCertificates(
        institutionalCertificatePaths,
        request
      );
    }
    const annotatedFrom = primaryCell.annotated_from
      ? (await request.getObject(primaryCell.annotated_from)).optional()
      : null;
    let publications = [];
    if (primaryCell.publications?.length > 0) {
      const publicationPaths = primaryCell.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }
    const attribution = await buildAttribution(primaryCell, req.headers.cookie);
    return {
      props: {
        primaryCell,
        biomarkers,
        constructLibrarySets,
        annotatedFrom,
        diseaseTerms,
        documents,
        donors,
        originOf,
        partOf,
        parts,
        pooledFrom,
        pooledIn,
        publications,
        sortedFractions,
        sources,
        treatments,
        multiplexedInSamples,
        institutionalCertificates,
        pageContext: {
          title: `${primaryCell.accession} ${UC.mdash} ${primaryCell.sample_terms[0].term_name}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(primaryCell);
}

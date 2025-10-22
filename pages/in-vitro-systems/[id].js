// node_modules
import PropTypes from "prop-types";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
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
import Link from "../../components/link-no-prefetch";
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
  requestSupersedes,
  requestTreatments,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function InVitroSystem({
  inVitroSystem,
  cellFateProtocol,
  constructLibrarySets,
  demultiplexedFrom,
  demultiplexedTo,
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
  biomarkers,
  multiplexedInSamples,
  institutionalCertificates,
  supersedes,
  supersededBy,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={inVitroSystem} />
      <EditableItem item={inVitroSystem}>
        <PagePreamble sections={sections} />
        <AlternativeIdentifiers
          alternateAccessions={inVitroSystem.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={inVitroSystem} isJsonFormat={isJson} />
        <JsonDisplay item={inVitroSystem} isJsonFormat={isJson}>
          <StatusPreviewDetail item={inVitroSystem} />
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={inVitroSystem}
                classifications={inVitroSystem.classifications}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                annotatedFrom={annotatedFrom}
                parts={parts}
                partOf={partOf}
                publications={publications}
                sampleTerms={inVitroSystem.sample_terms}
                sources={sources}
                options={{
                  dateObtainedTitle: "Date Collected",
                }}
              >
                {inVitroSystem.targeted_sample_term && (
                  <>
                    <DataItemLabel>Targeted Sample Term</DataItemLabel>
                    <DataItemValue>
                      <Link href={inVitroSystem.targeted_sample_term["@id"]}>
                        {inVitroSystem.targeted_sample_term.term_name}
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
                      {inVitroSystem.time_post_change}{" "}
                      {inVitroSystem.time_post_change > 1
                        ? `${inVitroSystem.time_post_change_units}s`
                        : inVitroSystem.time_post_change_units}
                    </DataItemValue>
                  </>
                )}
                {inVitroSystem.growth_medium && (
                  <>
                    <DataItemLabel>Growth Medium</DataItemLabel>
                    <DataItemValue>{inVitroSystem.growth_medium}</DataItemValue>
                  </>
                )}
                {demultiplexedFrom && (
                  <>
                    <DataItemLabel>Demultiplexed From Sample</DataItemLabel>
                    <DataItemValue>
                      <Link href={demultiplexedFrom["@id"]}>
                        {demultiplexedFrom.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {cellFateProtocol && (
                  <>
                    <DataItemLabel>Cell Fate Change Protocol</DataItemLabel>
                    <DataItemValue>
                      <Link href={cellFateProtocol["@id"]}>
                        {cellFateProtocol.attachment.download}
                      </Link>
                    </DataItemValue>
                  </>
                )}
              </BiosampleDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {donors.length > 0 && <DonorTable donors={donors} />}
          {inVitroSystem.file_sets?.length > 0 && (
            <FileSetTable fileSets={inVitroSystem.file_sets} />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of multiplexed samples in which this sample is included"
              title="Multiplexed In Samples"
              panelId="multiplexed-in-samples"
            />
          )}
          {pooledFrom.length > 0 && (
            <SampleTable
              samples={pooledFrom}
              reportLink={`/multireport/?type=Sample&pooled_in=${inVitroSystem["@id"]}`}
              reportLabel="Report of samples this biosample is pooled from"
              title="Biosamples Pooled From"
              panelId="pooled-from"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${inVitroSystem["@id"]}`}
              reportLabel="Report of pooled biosamples in which this sample is included"
              title="Pooled In"
              panelId="pooled-in"
            />
          )}
          {demultiplexedTo.length > 0 && (
            <SampleTable
              samples={demultiplexedTo}
              reportLink={`/multireport/?type=Biosample&demultiplexed_from=${inVitroSystem["@id"]}`}
              reportLabel="Report of parts into which this sample has been demultiplexed"
              title="Demultiplexed To Sample"
              panelId="demultiplexed-to"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${inVitroSystem["@id"]}`}
              reportLabel="Report of parts into which this sample has been divided"
              title="Sample Parts"
              panelId="parts"
            />
          )}
          {originOf.length > 0 && (
            <SampleTable
              samples={originOf}
              reportLink={`/multireport/?type=Biosample&originated_from.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of samples which originate from this sample"
              title="Origin Sample Of"
              panelId="origin-of"
            />
          )}
          {inVitroSystem.modifications?.length > 0 && (
            <ModificationTable
              modifications={inVitroSystem.modifications}
              reportLink={`/multireport/?type=Modification&biosamples_modified=${inVitroSystem["@id"]}`}
              reportLabel={`Report of genetic modifications for ${inVitroSystem.accession}`}
            />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
              panelId="sorted-fractions"
            />
          )}
          {biomarkers.length > 0 && (
            <BiomarkerTable
              biomarkers={biomarkers}
              reportLink={`/multireport/?type=Biomarker&biomarker_for=${inVitroSystem["@id"]}`}
              reportLabel={`Report of biological markers that are associated with biosample ${inVitroSystem.accession}`}
            />
          )}
          {treatments.length > 0 && (
            <TreatmentTable
              treatments={treatments}
              reportLink={`/multireport/?type=Treatment&biosamples_treated=${inVitroSystem["@id"]}`}
              reportLabel={`Report of treatments applied to the biosample ${inVitroSystem.accession}`}
            />
          )}
          {institutionalCertificates.length > 0 && (
            <InstitutionalCertificateTable
              institutionalCertificates={institutionalCertificates}
              reportLink={`/multireport/?type=InstitutionalCertificate&samples=${inVitroSystem["@id"]}`}
              reportLabel={`Report of institutional certificates associated with ${inVitroSystem.accession}`}
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

InVitroSystem.propTypes = {
  // In Vitro System sample to display
  inVitroSystem: PropTypes.object.isRequired,
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Cell Fate Change Protocols of the sample
  cellFateProtocol: PropTypes.object,
  // Construct libraries that link to this object
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Demultiplexed from sample
  demultiplexedFrom: PropTypes.object,
  // Demultiplexed to sample
  demultiplexedTo: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  publications: PropTypes.arrayOf(PropTypes.object),
  // Sorted fractions sample
  sortedFractions: PropTypes.arrayOf(PropTypes.object),
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Treatments of the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Multiplexed in samples
  multiplexedInSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Institutional certificates referencing this sample
  institutionalCertificates: PropTypes.arrayOf(PropTypes.object),
  // Samples that this sample supersedes
  supersedes: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples that supersede this sample
  supersededBy: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const inVitroSystem = (
    await request.getObject(`/in-vitro-systems/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(inVitroSystem)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      inVitroSystem,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    let biomarkers = [];
    if (inVitroSystem.biomarkers?.length > 0) {
      const biomarkerPaths = inVitroSystem.biomarkers.map(
        (biomarker) => biomarker["@id"]
      );
      biomarkers = await requestBiomarkers(biomarkerPaths, request);
    }
    let cellFateProtocol = null;
    if (inVitroSystem.cell_fate_change_protocol) {
      cellFateProtocol = (
        await request.getObject(inVitroSystem.cell_fate_change_protocol)
      ).optional();
    }
    const demultiplexedFrom = inVitroSystem.demultiplexed_from
      ? (await request.getObject(inVitroSystem.demultiplexed_from)).optional()
      : null;
    const demultiplexedTo =
      inVitroSystem.demultiplexed_to?.length > 0
        ? await requestBiosamples(inVitroSystem.demultiplexed_to, request)
        : [];
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
    let donors = [];
    if (inVitroSystem.donors?.length > 0) {
      const donorPaths = inVitroSystem.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }
    const partOf = inVitroSystem.part_of
      ? (await request.getObject(inVitroSystem.part_of)).optional()
      : null;
    const parts =
      inVitroSystem.parts?.length > 0
        ? await requestBiosamples(inVitroSystem.parts, request)
        : [];
    const pooledFrom =
      inVitroSystem.pooled_from?.length > 0
        ? await requestBiosamples(inVitroSystem.pooled_from, request)
        : [];
    const pooledIn =
      inVitroSystem.pooled_in?.length > 0
        ? await requestBiosamples(inVitroSystem.pooled_in, request)
        : [];
    const originOf =
      inVitroSystem.origin_of?.length > 0
        ? await requestBiosamples(inVitroSystem.origin_of, request)
        : [];
    const sortedFractions =
      inVitroSystem.sorted_fractions?.length > 0
        ? await requestSamples(inVitroSystem.sorted_fractions, request)
        : [];
    let sources = [];
    if (inVitroSystem.sources?.length > 0) {
      const sourcePaths = inVitroSystem.sources.map((source) => source["@id"]);
      sources = Ok.all(
        await request.getMultipleObjects(sourcePaths, {
          filterErrors: true,
        })
      );
    }
    let treatments = [];
    if (inVitroSystem.treatments?.length > 0) {
      const treatmentPaths = inVitroSystem.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }
    let constructLibrarySets = [];
    if (inVitroSystem.construct_library_sets?.length > 0) {
      const constructLibrarySetPaths = inVitroSystem.construct_library_sets.map(
        (constructLibrarySet) => constructLibrarySet["@id"]
      );
      constructLibrarySets = await requestFileSets(
        constructLibrarySetPaths,
        request
      );
    }
    let multiplexedInSamples = [];
    if (inVitroSystem.multiplexed_in?.length > 0) {
      const multiplexedInPaths = inVitroSystem.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestSamples(multiplexedInPaths, request);
    }
    let institutionalCertificates = [];
    if (inVitroSystem.institutional_certificates?.length > 0) {
      const institutionalCertificatePaths =
        inVitroSystem.institutional_certificates.map(
          (institutionalCertificate) => institutionalCertificate["@id"]
        );
      institutionalCertificates = await requestInstitutionalCertificates(
        institutionalCertificatePaths,
        request
      );
    }
    const annotatedFrom = inVitroSystem.annotated_from
      ? (await request.getObject(inVitroSystem.annotated_from)).optional()
      : null;
    let publications = [];
    if (inVitroSystem.publications?.length > 0) {
      const publicationPaths = inVitroSystem.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }
    const { supersedes, supersededBy } = await requestSupersedes(
      inVitroSystem,
      "Sample",
      request
    );
    const attribution = await buildAttribution(
      inVitroSystem,
      req.headers.cookie
    );
    return {
      props: {
        inVitroSystem,
        biomarkers,
        cellFateProtocol,
        constructLibrarySets,
        demultiplexedFrom,
        demultiplexedTo,
        annotatedFrom,
        diseaseTerms,
        documents,
        donors,
        originOf,
        pooledFrom,
        parts,
        partOf,
        pooledIn,
        publications,
        sortedFractions,
        sources,
        treatments,
        multiplexedInSamples,
        institutionalCertificates,
        supersedes,
        supersededBy,
        pageContext: {
          title: `${inVitroSystem.accession} ${UC.mdash} ${inVitroSystem.sample_terms[0].term_name}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(inVitroSystem);
}

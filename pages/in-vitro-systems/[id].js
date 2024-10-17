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
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ModificationTable from "../../components/modification-table";
import ObjectPageHeader from "../../components/object-page-header";
import { usePagePanels } from "../../components/page-panels";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
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
  cellFateChangeTreatments,
  biomarkers,
  targetedSampleTerm = null,
  multiplexedInSamples,
  attribution = null,
  isJson,
}) {
  const pagePanels = usePagePanels(inVitroSystem["@id"]);

  return (
    <>
      <Breadcrumbs item={inVitroSystem} />
      <EditableItem item={inVitroSystem}>
        <PagePreamble />
        <AlternateAccessions
          alternateAccessions={inVitroSystem.alternate_accessions}
        />
        <ObjectPageHeader item={inVitroSystem} isJsonFormat={isJson} />
        <JsonDisplay item={inVitroSystem} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={inVitroSystem}
                classifications={inVitroSystem.classifications}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                parts={parts}
                partOf={partOf}
                institutionalCertificates={
                  inVitroSystem.institutional_certificates
                }
                publications={publications}
                sampleTerms={inVitroSystem.sample_terms}
                sources={sources}
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
            </DataArea>
          </DataPanel>
          {donors.length > 0 && (
            <DonorTable
              donors={donors}
              pagePanels={pagePanels}
              pagePanelId="donors"
            />
          )}
          {inVitroSystem.file_sets.length > 0 && (
            <FileSetTable
              fileSets={inVitroSystem.file_sets}
              reportLink={`/multireport/?type=FileSet&samples.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of file sets associated with this sample"
              pagePanels={pagePanels}
              pagePanelId="file-sets"
            />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of multiplexed samples in which this sample is included"
              title="Multiplexed In Samples"
              pagePanels={pagePanels}
              pagePanelId="multiplexed-in-samples"
            />
          )}
          {pooledFrom.length > 0 && (
            <SampleTable
              samples={pooledFrom}
              reportLink={`/multireport/?type=Sample&pooled_in=${inVitroSystem["@id"]}`}
              reportLabel="Report of samples this biosample is pooled from"
              title="Biosamples Pooled From"
              pagePanels={pagePanels}
              pagePanelId="biosamples-pooled-from"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${inVitroSystem["@id"]}`}
              reportLabel="Report of pooled biosamples in which this sample is included"
              title="Pooled In"
              pagePanels={pagePanels}
              pagePanelId="pooled-in"
            />
          )}
          {demultiplexedTo.length > 0 && (
            <SampleTable
              samples={demultiplexedTo}
              reportLink={`/multireport/?type=Biosample&demultiplexed_from=${inVitroSystem["@id"]}`}
              reportLabel="Report of parts into which this sample has been demultiplexed"
              title="Demultiplexed To Sample"
              pagePanels={pagePanels}
              pagePanelId="demultiplexed-to-sample"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${inVitroSystem["@id"]}`}
              reportLabel="Report of parts into which this sample has been divided"
              title="Sample Parts"
              pagePanels={pagePanels}
              pagePanelId="sample-parts"
            />
          )}
          {originOf.length > 0 && (
            <SampleTable
              samples={originOf}
              reportLink={`/multireport/?type=Biosample&originated_from.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of samples which originate from this sample"
              title="Origin Sample Of"
              pagePanels={pagePanels}
              pagePanelId="origin-sample-of"
            />
          )}
          {inVitroSystem.modifications?.length > 0 && (
            <ModificationTable
              modifications={inVitroSystem.modifications}
              reportLink={`/multireport/?type=Modification&biosamples_modified=${inVitroSystem["@id"]}`}
              reportLabel={`Report of genetic modifications for ${inVitroSystem.accession}`}
              pagePanels={pagePanels}
              pagePanelId="modifications"
            />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
              pagePanels={pagePanels}
              pagePanelId="sorted-fractions-of-sample"
            />
          )}
          {biomarkers.length > 0 && (
            <BiomarkerTable
              biomarkers={biomarkers}
              reportLink={`/multireport/?type=Biomarker&biomarker_for=${inVitroSystem["@id"]}`}
              reportLabel={`Report of biological markers that are associated with biosample ${inVitroSystem.accession}`}
              pagePanels={pagePanels}
              pagePanelId="biomarkers"
            />
          )}
          {treatments.length > 0 && (
            <TreatmentTable
              treatments={treatments}
              reportLink={`/multireport/?type=Treatment&biosamples_treated=${inVitroSystem["@id"]}`}
              reportLabel={`Report of treatments applied to the biosample ${inVitroSystem.accession}`}
              pagePanels={pagePanels}
              pagePanelId="treatments"
            />
          )}
          {cellFateChangeTreatments.length > 0 && (
            <TreatmentTable
              treatments={cellFateChangeTreatments}
              title="Cell Fate Change Treatments"
              pagePanels={pagePanels}
              pagePanelId="cell-fate-change-treatments"
            />
          )}
          {documents.length > 0 && (
            <DocumentTable
              documents={documents}
              pagePanels={pagePanels}
              pagePanelId="documents"
            />
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
  // Treatments for cell fate change of the sample
  cellFateChangeTreatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // The targeted endpoint biosample resulting from differentiation or reprogramming
  targetedSampleTerm: PropTypes.object,
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
  const inVitroSystem = (
    await request.getObject(`/in-vitro-systems/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(inVitroSystem)) {
    const biomarkers =
      inVitroSystem.biomarkers?.length > 0
        ? await requestBiomarkers(inVitroSystem.biomarkers, request)
        : [];
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
    const donors = inVitroSystem.donors
      ? await requestDonors(inVitroSystem.donors, request)
      : [];
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
        ? await requestBiosamples(inVitroSystem.sorted_fractions, request)
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
    let cellFateChangeTreatments = [];
    if (inVitroSystem.cell_fate_change_treatments?.length > 0) {
      const cellFateChangeTreatmentPaths =
        inVitroSystem.cell_fate_change_treatments.map(
          (treatment) => treatment["@id"]
        );
      cellFateChangeTreatments = await requestTreatments(
        cellFateChangeTreatmentPaths,
        request
      );
    }
    const targetedSampleTerm = inVitroSystem.targeted_sample_term
      ? (await request.getObject(inVitroSystem.targeted_sample_term)).optional()
      : null;
    const constructLibrarySets = inVitroSystem.construct_library_sets
      ? await requestFileSets(inVitroSystem.construct_library_sets, request)
      : [];
    let multiplexedInSamples = [];
    if (inVitroSystem.multiplexed_in.length > 0) {
      const multiplexedInPaths = inVitroSystem.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestBiosamples(
        multiplexedInPaths,
        request
      );
    }
    let publications = [];
    if (inVitroSystem.publications?.length > 0) {
      const publicationPaths = inVitroSystem.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }
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
        cellFateChangeTreatments,
        targetedSampleTerm,
        multiplexedInSamples,
        pageContext: {
          title: `${inVitroSystem.sample_terms[0].term_name} — ${inVitroSystem.accession}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(inVitroSystem);
}

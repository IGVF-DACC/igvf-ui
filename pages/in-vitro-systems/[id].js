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
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
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
                classifications={inVitroSystem.classifications}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                parts={parts}
                partOf={partOf}
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
                {truthyOrZero(inVitroSystem.growth_medium) && (
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
          {donors.length > 0 && <DonorTable donors={donors} />}
          {inVitroSystem.file_sets.length > 0 && (
            <FileSetTable
              fileSets={inVitroSystem.file_sets}
              reportLinkSpecs={{
                fileSetType: "FileSet",
                identifierProp: "samples.accession",
                itemIdentifier: inVitroSystem.accession,
              }}
            />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${inVitroSystem["@id"]}`}
              title="Multiplexed In Samples"
            />
          )}
          {inVitroSystem.originated_from && (
            <>
              <DataItemLabel>Originated From Sample</DataItemLabel>
              <DataItemValue>
                <Link href={inVitroSystem.originated_from["@id"]}>
                  {inVitroSystem.originated_from.accession}
                </Link>
              </DataItemValue>
            </>
          )}
          {pooledFrom.length > 0 && (
            <SampleTable
              samples={pooledFrom}
              reportLink={`/multireport/?type=Sample&pooled_in=${inVitroSystem["@id"]}`}
              title="Biosamples Pooled From"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${inVitroSystem["@id"]}`}
              title="Pooled In"
            />
          )}
          {demultiplexedTo.length > 0 && (
            <SampleTable
              samples={demultiplexedTo}
              reportLink={`/multireport/?type=Biosample&demultiplexed_from=${inVitroSystem["@id"]}`}
              title="Demultiplexed To Sample"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${inVitroSystem["@id"]}`}
              title="Sample Parts"
            />
          )}
          {originOf.length > 0 && (
            <SampleTable
              samples={originOf}
              reportLink={`/multireport/?type=Biosample&originated_from.@id=${inVitroSystem["@id"]}`}
              title="Origin Sample Of"
            />
          )}
          {inVitroSystem.modifications?.length > 0 && (
            <ModificationTable modifications={inVitroSystem.modifications} />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${inVitroSystem["@id"]}`}
              title="Sorted Fractions of Sample"
            />
          )}
          {biomarkers.length > 0 && <BiomarkerTable biomarkers={biomarkers} />}
          {treatments.length > 0 && <TreatmentTable treatments={treatments} />}
          {cellFateChangeTreatments.length > 0 && (
            <TreatmentTable
              treatments={cellFateChangeTreatments}
              title="Cell Fate Change Treatments"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
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
    const breadcrumbs = await buildBreadcrumbs(
      inVitroSystem,
      inVitroSystem.accession,
      req.headers.cookie
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
        diseaseTerms,
        documents,
        donors,
        originOf,
        pooledFrom,
        parts,
        partOf,
        pooledIn,
        sortedFractions,
        sources,
        treatments,
        cellFateChangeTreatments,
        targetedSampleTerm,
        multiplexedInSamples,
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

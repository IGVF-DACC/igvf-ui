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
import JsonDisplay from "../../components/json-display";
import ModificationTable from "../../components/modification-table";
import ObjectPageHeader from "../../components/object-page-header";
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
  requestTreatments,
} from "../../lib/common-requests";
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
  documents,
  donors,
  partOf,
  parts,
  pooledFrom,
  pooledIn,
  sortedFractions,
  sources,
  treatments,
  multiplexedInSamples,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs item={primaryCell} />
      <EditableItem item={primaryCell}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={primaryCell.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={primaryCell} isJsonFormat={isJson} />
        <JsonDisplay item={primaryCell} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={primaryCell}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                partOf={partOf}
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
            </DataArea>
          </DataPanel>
          {donors.length > 0 && <DonorTable donors={donors} />}
          {primaryCell.file_sets.length > 0 && (
            <FileSetTable
              fileSets={primaryCell.file_sets}
              reportLinkSpecs={{
                fileSetType: "FileSet",
                identifierProp: "samples.accession",
                itemIdentifier: primaryCell.accession,
              }}
            />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${primaryCell["@id"]}`}
              reportLabel="Report of multiplexed samples in which this sample is included"
              title="Multiplexed In Samples"
            />
          )}
          {pooledFrom.length > 0 && (
            <SampleTable
              samples={pooledFrom}
              reportLink={`/multireport/?type=Sample&pooled_in=${primaryCell["@id"]}`}
              reportLabel="Report of biosamples this sample is pooled from"
              title="Biosamples Pooled From"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${primaryCell["@id"]}`}
              reportLabel="Report of pooled samples in which this sample is included"
              title="Pooled In"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${primaryCell["@id"]}`}
              reportLabel="Report of parts into which this sample has been divided"
              title="Sample Parts"
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
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
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
  const primaryCell = (
    await request.getObject(`/primary-cells/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(primaryCell)) {
    const biomarkers =
      primaryCell.biomarkers?.length > 0
        ? await requestBiomarkers(primaryCell.biomarkers, request)
        : [];
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
    const donors = primaryCell.donors
      ? await requestDonors(primaryCell.donors, request)
      : [];
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
    const sortedFractions =
      primaryCell.sorted_fractions?.length > 0
        ? await requestBiosamples(primaryCell.sorted_fractions, request)
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
    const constructLibrarySets = primaryCell.construct_library_sets
      ? await requestFileSets(primaryCell.construct_library_sets, request)
      : [];
    let multiplexedInSamples = [];
    if (primaryCell.multiplexed_in.length > 0) {
      const multiplexedInPaths = primaryCell.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestBiosamples(
        multiplexedInPaths,
        request
      );
    }
    const attribution = await buildAttribution(primaryCell, req.headers.cookie);
    return {
      props: {
        primaryCell,
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
        treatments,
        multiplexedInSamples,
        pageContext: {
          title: `${primaryCell.sample_terms[0].term_name} — ${primaryCell.accession}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(primaryCell);
}

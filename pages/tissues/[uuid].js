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
import { EditableItem } from "../../components/edit";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
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
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function Tissue({
  tissue,
  biomarkers,
  constructLibrarySets,
  donors,
  documents,
  diseaseTerms,
  parts,
  partOf,
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
      <Breadcrumbs />
      <EditableItem item={tissue}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={tissue.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={tissue} isJsonFormat={isJson} />
        <JsonDisplay item={tissue} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={tissue}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                partOf={partOf}
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
                    <Link
                      href={`https://portal.hubmapconsortium.org/browse/sample/${tissue.ccf_id}`}
                    >
                      {tissue.ccf_id}
                    </Link>
                  </>
                )}
              </BiosampleDataItems>
            </DataArea>
          </DataPanel>
          {donors.length > 0 && <DonorTable donors={donors} />}
          {tissue.file_sets.length > 0 && (
            <FileSetTable
              fileSets={tissue.file_sets}
              reportLinkSpecs={{
                fileSetType: "FileSet",
                identifierProp: "samples.accession",
                itemIdentifier: tissue.accession,
              }}
            />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${tissue["@id"]}`}
              title="Multiplexed In Samples"
            />
          )}
          {pooledFrom.length > 0 && (
            <SampleTable
              samples={pooledFrom}
              reportLink={`/multireport/?type=Sample&pooled_in=${tissue["@id"]}`}
              title="Biosamples Pooled From"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${tissue["@id"]}`}
              title="Pooled In"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${tissue["@id"]}`}
              title="Sample Parts"
            />
          )}
          {tissue.modifications?.length > 0 && (
            <ModificationTable modifications={tissue.modifications} />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${tissue["@id"]}`}
              title="Sorted Fractions of Sample"
            />
          )}
          {biomarkers.length > 0 && <BiomarkerTable biomarkers={biomarkers} />}
          {treatments.length > 0 && <TreatmentTable treatments={treatments} />}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
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
  const tissue = (await request.getObject(`/tissues/${params.uuid}/`)).union();
  if (FetchRequest.isResponseSuccess(tissue)) {
    const biomarkers =
      tissue.biomarkers?.length > 0
        ? await requestBiomarkers(tissue.biomarkers, request)
        : [];
    let diseaseTerms = [];
    if (tissue.disease_terms?.length > 0) {
      const diseaseTermPaths = tissue.disease_terms.map((term) => term["@id"]);
      diseaseTerms = await requestOntologyTerms(diseaseTermPaths, request);
    }
    const documents = tissue.documents
      ? await requestDocuments(tissue.documents, request)
      : [];
    const donors = tissue.donors
      ? await requestDonors(tissue.donors, request)
      : [];
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
    const sortedFractions =
      tissue.sorted_fractions?.length > 0
        ? await requestBiosamples(tissue.sorted_fractions, request)
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
    const constructLibrarySets = tissue.construct_library_sets
      ? await requestFileSets(tissue.construct_library_sets, request)
      : [];
    let multiplexedInSamples = [];
    if (tissue.multiplexed_in.length > 0) {
      const multiplexedInPaths = tissue.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestBiosamples(
        multiplexedInPaths,
        request
      );
    }
    const breadcrumbs = await buildBreadcrumbs(
      tissue,
      tissue.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(tissue, req.headers.cookie);
    return {
      props: {
        tissue,
        biomarkers,
        constructLibrarySets,
        diseaseTerms,
        documents,
        donors,
        parts,
        partOf,
        pooledFrom,
        pooledIn,
        sortedFractions,
        sources,
        treatments,
        multiplexedInSamples,
        pageContext: {
          title: `${tissue.sample_terms[0].term_name} — ${tissue.accession}`,
        },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(tissue);
}

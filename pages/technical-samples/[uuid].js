// node_modules
import PropTypes from "prop-types";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { SampleDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import { InstitutionalCertificateTable } from "../../components/institutional-certificate-table";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
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
  requestDocuments,
  requestFileSets,
  requestInstitutionalCertificates,
  requestPublications,
  requestSamples,
  requestSupersedes,
  requestTreatments,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function TechnicalSample({
  sample,
  constructLibrarySets,
  institutionalCertificates,
  publications,
  documents,
  attribution = null,
  sortedFractions,
  sources,
  multiplexedInSamples,
  originOf,
  supersedes,
  supersededBy,
  treatments,
  partOf,
  parts,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={sample} />
      <EditableItem item={sample}>
        <PagePreamble sections={sections} />
        <AlternativeIdentifiers
          alternateAccessions={sample.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={sample} isJsonFormat={isJson} />
        <JsonDisplay item={sample} isJsonFormat={isJson}>
          <StatusPreviewDetail item={sample} />
          <DataPanel>
            <DataArea>
              <SampleDataItems
                item={sample}
                constructLibrarySets={constructLibrarySets}
                sources={sources}
                publications={publications}
              >
                <DataItemLabel>Sample Material</DataItemLabel>
                <DataItemValue>{sample.sample_material}</DataItemValue>
                <DataItemLabel>Sample Terms</DataItemLabel>
                <DataItemValue>
                  <Link href={sample.sample_terms[0]["@id"]}>
                    {sample.sample_terms[0].term_name}
                  </Link>
                </DataItemValue>
                {sample.selection_conditions?.length > 0 && (
                  <>
                    <DataItemLabel>Selection Conditions</DataItemLabel>
                    <DataItemValue>
                      {sample.selection_conditions.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {partOf && (
                  <>
                    <DataItemLabel>Part of Sample</DataItemLabel>
                    <DataItemValue>
                      <Link href={partOf["@id"]}>{partOf.accession}</Link>
                    </DataItemValue>
                  </>
                )}
                {sample.originated_from && (
                  <>
                    <DataItemLabel>Originated From Sample</DataItemLabel>
                    <DataItemValue>
                      <Link href={sample.originated_from["@id"]}>
                        {sample.originated_from.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
              </SampleDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {treatments.length > 0 && (
            <TreatmentTable
              treatments={treatments}
              reportLink={`/multireport/?type=Treatment&biosamples_treated=${sample["@id"]}`}
              reportLabel={`Report of treatments applied to the sample ${sample.accession}`}
              isDeletedVisible
            />
          )}
          {sample.file_sets?.length > 0 && (
            <FileSetTable fileSets={sample.file_sets} />
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
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${sample["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
              panelId="sorted-fractions"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Sample&part_of=${sample["@id"]}`}
              reportLabel="Report of samples into which this sample has been divided"
              title="Technical Sample Parts"
              panelId="parts"
            />
          )}
          {originOf.length > 0 && (
            <SampleTable
              samples={originOf}
              reportLink={`/multireport/?type=Sample&originated_from.@id=${sample["@id"]}`}
              reportLabel="Report of samples which originate from this sample"
              title="Origin Sample Of"
              panelId="origin-of"
            />
          )}
          {institutionalCertificates.length > 0 && (
            <InstitutionalCertificateTable
              institutionalCertificates={institutionalCertificates}
              reportLink={`/multireport/?type=InstitutionalCertificate&samples=${sample["@id"]}`}
              reportLabel={`Report of institutional certificates associated with ${sample.accession}`}
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

TechnicalSample.propTypes = {
  // Technical sample to display
  sample: PropTypes.object.isRequired,
  // Construct library sets associated with this technical sample
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object),
  // Institutional certificates associated with this technical sample
  institutionalCertificates: PropTypes.arrayOf(PropTypes.object),
  // Publications associated with this technical sample
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this technical sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sorted fractions sample
  sortedFractions: PropTypes.arrayOf(PropTypes.object),
  // Source lab or source for this technical sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Multiplexed in samples
  multiplexedInSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Origin of sample
  originOf: PropTypes.arrayOf(PropTypes.object),
  // Samples into which this sample has been divided
  parts: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sample that represents a larger sample from which this sample was taken
  partOf: PropTypes.object,
  // Samples that this sample supersedes
  supersedes: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples that supersede this sample
  supersededBy: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Treatments of the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this technical sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sample = (
    await request.getObject(`/technical-samples/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(sample)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      sample,
      resolvedUrl,
      query,
      ["uuid"]
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    let publications = [];
    if (sample.publications?.length > 0) {
      const publicationPaths = sample.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const documents =
      sample.documents?.length > 0
        ? await requestDocuments(sample.documents, request)
        : [];
    const sortedFractions =
      sample.sorted_fractions?.length > 0
        ? await requestSamples(sample.sorted_fractions, request)
        : [];
    const institutionalCertificates =
      sample.institutional_certificates?.length > 0
        ? await requestInstitutionalCertificates(
            sample.institutional_certificates,
            request
          )
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
    let constructLibrarySets = [];
    if (sample.construct_library_sets?.length > 0) {
      const constructLibrarySetPaths = sample.construct_library_sets.map(
        (constructLibrarySet) => constructLibrarySet["@id"]
      );
      constructLibrarySets = await requestFileSets(
        constructLibrarySetPaths,
        request
      );
    }
    const multiplexedInSamples =
      sample.multiplexed_in?.length > 0
        ? await requestSamples(sample.multiplexed_in, request)
        : [];
    const { supersedes, supersededBy } = await requestSupersedes(
      sample,
      "Sample",
      request
    );
    const originOf =
      sample.origin_of?.length > 0
        ? await requestSamples(sample.origin_of, request)
        : [];
    const partOf = sample.part_of
      ? (await request.getObject(sample.part_of)).optional()
      : null;
    const parts =
      sample.parts?.length > 0
        ? await requestSamples(sample.parts, request)
        : [];

    let treatments = [];
    if (sample.treatments?.length > 0) {
      const treatmentPaths = sample.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }

    const attribution = await buildAttribution(sample, req.headers.cookie);
    return {
      props: {
        sample,
        constructLibrarySets,
        institutionalCertificates,
        publications,
        documents,
        sortedFractions,
        sources,
        multiplexedInSamples,
        originOf,
        parts,
        partOf,
        supersedes,
        supersededBy,
        treatments,
        pageContext: {
          title: `${sample.accession} ${UC.mdash} ${sample.sample_terms[0].term_name}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(sample);
}

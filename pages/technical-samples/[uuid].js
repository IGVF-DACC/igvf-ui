// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestBiosamples,
  requestDocuments,
  requestFileSets,
  requestInstitutionalCertificates,
  requestPublications,
} from "../../lib/common-requests";
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
  isJson,
}) {
  return (
    <>
      <Breadcrumbs item={sample} />
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
              <SampleDataItems
                item={sample}
                constructLibrarySets={constructLibrarySets}
                institutionalCertificates={institutionalCertificates}
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
              </SampleDataItems>
            </DataArea>
          </DataPanel>
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
            />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${sample["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
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
  // Attribution for this technical sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sample = (
    await request.getObject(`/technical-samples/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(sample)) {
    let publications = [];
    if (sample.publications?.length > 0) {
      const publicationPaths = sample.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const documents = sample.documents
      ? await requestDocuments(sample.documents, request)
      : [];
    const sortedFractions =
      sample.sorted_fractions?.length > 0
        ? await requestBiosamples(sample.sorted_fractions, request)
        : [];
    const institutionalCertificates =
      sample.institutional_certificates.length > 0
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

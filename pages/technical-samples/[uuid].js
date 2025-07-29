// node_modules
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
import { InstitutionalCertificateTable } from "../../components/institutional-certificate-table";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFileSets,
  requestInstitutionalCertificates,
  requestPublications,
  requestSamples,
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
  isJson,
}) {
  const sections = useSecDir({ isJson });

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
              </SampleDataItems>
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
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
          title: `${sample.accession} ${UC.mdash} ${sample.sample_terms[0].term_name}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(sample);
}

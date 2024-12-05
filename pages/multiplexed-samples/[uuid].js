// node_modules
import { Fragment } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import BiomarkerTable from "../../components/biomarker-table";
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
import ModificationTable from "../../components/modification-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
import { StatusPreviewDetail } from "../../components/status";
import TreatmentTable from "../../components/treatment-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestBiomarkers,
  requestBiosamples,
  requestDocuments,
  requestFileSets,
  requestInstitutionalCertificates,
  requestPublications,
  requestTreatments,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";

export default function MultiplexedSample({
  multiplexedSample,
  constructLibrarySets,
  biomarkers,
  institutionalCertificates,
  publications,
  documents,
  attribution = null,
  sortedFractions,
  sources,
  treatments,
  multiplexedInSamples,
  barcodeMap,
  isJson,
}) {
  const sections = useSecDir();

  const reportLink = `/multireport/?type=Sample&field=%40id&field=multiplexed_in&field=taxa&field=sample_terms.term_name&field=donors&field=disease_terms&field=status&field=summary&field=%40type&multiplexed_in.accession=${multiplexedSample.accession}&field=construct_library_sets`;

  return (
    <>
      <Breadcrumbs item={multiplexedSample} />
      <EditableItem item={multiplexedSample}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={multiplexedSample.alternate_accessions}
        />
        <ObjectPageHeader item={multiplexedSample} isJsonFormat={isJson} />
        <JsonDisplay item={multiplexedSample} isJsonFormat={isJson}>
          <StatusPreviewDetail item={multiplexedSample} />
          <DataPanel>
            <DataArea>
              <SampleDataItems
                item={multiplexedSample}
                constructLibrarySets={constructLibrarySets}
                institutionalCertificates={institutionalCertificates}
                publications={publications}
              >
                {multiplexedSample.multiplexing_methods.length > 0 && (
                  <>
                    <DataItemLabel>Multiplexing Method</DataItemLabel>
                    <DataItemValue>
                      {multiplexedSample.multiplexing_methods.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {sources?.length > 0 && (
                  <>
                    <DataItemLabel>Sources</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {sources.map((source) => (
                          <Link href={source["@id"]} key={source["@id"]}>
                            {source.title}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {multiplexedSample.cellular_sub_pool && (
                  <>
                    <DataItemLabel>Cellular Sub Pool</DataItemLabel>
                    <DataItemValue>
                      {multiplexedSample.cellular_sub_pool}
                    </DataItemValue>
                  </>
                )}
                {barcodeMap && (
                  <>
                    <DataItemLabel>Barcode Map</DataItemLabel>
                    <DataItemValue>
                      <Link href={barcodeMap["@id"]}>
                        {barcodeMap.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
              </SampleDataItems>
            </DataArea>
          </DataPanel>
          {multiplexedSample.file_sets.length > 0 && (
            <FileSetTable
              fileSets={multiplexedSample.file_sets}
              reportLink={`/multireport/?type=FileSet&samples.@id=${multiplexedSample["@id"]}`}
              reportLabel="Report of file sets associated with this sample"
            />
          )}
          {multiplexedSample.multiplexed_samples.length > 0 && (
            <SampleTable
              samples={multiplexedSample.multiplexed_samples}
              reportLink={reportLink}
              reportLabel="Report of samples multiplexed together to produce this sample"
              title="Multiplexed Samples"
              panelId="multiplexed-samples"
            />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${multiplexedSample["@id"]}`}
              reportLabel="Report of multiplexed samples in which this sample is included"
              title="Multiplexed In Samples"
              panelId="multiplexed-in-samples"
            />
          )}
          {multiplexedSample.modifications?.length > 0 && (
            <ModificationTable
              modifications={multiplexedSample.modifications}
            />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${multiplexedSample["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
              panelId="sorted-fractions"
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

MultiplexedSample.propTypes = {
  // MultiplexedSample-cell sample to display
  multiplexedSample: PropTypes.object.isRequired,
  // Construct libraries that link to this MultiplexedSample
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Institutional certificates associated with the sample
  institutionalCertificates: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with the sample
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sorted fractions sample
  sortedFractions: PropTypes.arrayOf(PropTypes.object),
  // Sources associated with the sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Multiplexed in samples
  multiplexedInSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Barcode map file
  barcodeMap: PropTypes.object,
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const multiplexedSample = (
    await request.getObject(`/multiplexed-samples/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(multiplexedSample)) {
    // Request the construct library sets from all the embedded multiplexed samples instead of the
    // `construct_library_sets` property of the multiplexed sample itself because the latter is
    // not always fully populated.
    let constructLibrarySets = [];
    if (multiplexedSample.multiplexed_samples?.length > 0) {
      let constructLibrarySetPaths =
        multiplexedSample.multiplexed_samples.reduce((acc, sample) => {
          return sample.construct_library_sets?.length > 0
            ? acc.concat(sample.construct_library_sets)
            : acc;
        }, []);
      constructLibrarySetPaths = [...new Set(constructLibrarySetPaths)];
      constructLibrarySets = await requestFileSets(
        constructLibrarySetPaths,
        request
      );
    }
    let biomarkers = [];
    if (multiplexedSample.biomarkers?.length > 0) {
      const biomarkerPaths = multiplexedSample.biomarkers.map(
        (biomarker) => biomarker["@id"]
      );
      biomarkers = await requestBiomarkers(biomarkerPaths, request);
    }
    const institutionalCertificates =
      multiplexedSample.institutional_certificates.length > 0
        ? await requestInstitutionalCertificates(
            multiplexedSample.institutional_certificates,
            request
          )
        : [];
    let publications = [];
    if (multiplexedSample.publications?.length > 0) {
      const publicationPaths = multiplexedSample.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }
    const documents = multiplexedSample.documents
      ? await requestDocuments(multiplexedSample.documents, request)
      : [];
    const sortedFractions =
      multiplexedSample.sorted_fractions?.length > 0
        ? await requestBiosamples(multiplexedSample.sorted_fractions, request)
        : [];

    // Use getMultipleObjects for sources instead of getMultipleObjectBulk. Sources point at both
    // lab and source objects, however, it currently only LinkTo sources.
    let sources = [];
    if (multiplexedSample.sources?.length > 0) {
      const sourcePaths = multiplexedSample.sources.map(
        (source) => source["@id"]
      );
      sources = Ok.all(
        await request.getMultipleObjects(sourcePaths, {
          filterErrors: true,
        })
      );
    }
    let treatments = [];
    if (multiplexedSample.treatments?.length > 0) {
      const treatmentPaths = multiplexedSample.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }
    let multiplexedInSamples = [];
    if (multiplexedSample.multiplexed_in.length > 0) {
      const multiplexedInPaths = multiplexedSample.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestBiosamples(
        multiplexedInPaths,
        request
      );
    }
    const barcodeMap = multiplexedSample.barcode_map
      ? (await request.getObject(multiplexedSample.barcode_map)).unwrap_or({})
      : null;
    const attribution = await buildAttribution(
      multiplexedSample,
      req.headers.cookie
    );
    return {
      props: {
        multiplexedSample,
        constructLibrarySets,
        biomarkers,
        institutionalCertificates,
        publications,
        documents,
        sortedFractions,
        sources,
        treatments,
        multiplexedInSamples,
        barcodeMap,
        pageContext: {
          title: `${multiplexedSample.sample_terms[0].term_name} — ${multiplexedSample.accession}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(multiplexedSample);
}

// node_modules
import { Fragment } from "react";
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
import SeparatedList from "../../components/separated-list";
import { StatusPreviewDetail } from "../../components/status";
import TreatmentTable from "../../components/treatment-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestBiomarkers,
  requestDocuments,
  requestDonors,
  requestFileSets,
  requestInstitutionalCertificates,
  requestPublications,
  requestSamples,
  requestTreatments,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
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
  donors,
  attribution = null,
  sortedFractions,
  sources,
  treatments,
  multiplexedInSamples,
  barcodeMap,
  isJson,
}) {
  const sections = useSecDir({ isJson });

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
                {sources.length > 0 && (
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
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {donors.length > 0 && <DonorTable donors={donors} />}
          {multiplexedSample.file_sets?.length > 0 && (
            <FileSetTable fileSets={multiplexedSample.file_sets} />
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
          {institutionalCertificates.length > 0 && (
            <InstitutionalCertificateTable
              institutionalCertificates={institutionalCertificates}
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
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
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
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
    let constructLibrarySets = [];
    if (multiplexedSample.construct_library_sets?.length > 0) {
      const constructLibrarySetPaths =
        multiplexedSample.construct_library_sets.map(
          (constructLibrarySet) => constructLibrarySet["@id"]
        );
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
    let institutionalCertificates = [];
    if (multiplexedSample.institutional_certificates?.length > 0) {
      const institutionalCertificatePaths =
        multiplexedSample.institutional_certificates.map(
          (institutionalCertificate) => institutionalCertificate["@id"]
        );
      institutionalCertificates = await requestInstitutionalCertificates(
        institutionalCertificatePaths,
        request
      );
    }
    let donors = [];
    if (multiplexedSample.donors?.length > 0) {
      const donorPaths = multiplexedSample.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }
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
        ? await requestSamples(multiplexedSample.sorted_fractions, request)
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
    if (multiplexedSample.multiplexed_in?.length > 0) {
      const multiplexedInPaths = multiplexedSample.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestSamples(multiplexedInPaths, request);
    }
    const barcodeMap = multiplexedSample.barcode_map
      ? (await request.getObject(multiplexedSample.barcode_map)).optional()
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
        donors,
        sortedFractions,
        sources,
        treatments,
        multiplexedInSamples,
        barcodeMap,
        pageContext: {
          title: `${multiplexedSample.accession} ${UC.mdash} ${multiplexedSample.summary}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(multiplexedSample);
}

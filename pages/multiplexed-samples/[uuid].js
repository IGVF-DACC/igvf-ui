// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import BiomarkerTable from "../../components/biomarker-table";
import Breadcrumbs from "../../components/breadcrumbs";
import { SampleDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ModificationsTable from "../../components/modification-table";
import SampleTable from "../../components/sample-table";
import TreatmentTable from "../../components/treatment-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestBiomarkers,
  requestDocuments,
  requestDonors,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import { formatDate } from "../../lib/dates";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function MultiplexedSample({
  multiplexedSample,
  biomarkers,
  documents,
  attribution = null,
  sources,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={multiplexedSample}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={multiplexedSample.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={multiplexedSample} isJsonFormat={isJson} />
        <JsonDisplay item={multiplexedSample} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <SampleDataItems item={multiplexedSample} sources={sources}>
                {multiplexedSample.date_obtained && (
                  <>
                    <DataItemLabel>Date Harvested</DataItemLabel>
                    <DataItemValue>
                      {formatDate(multiplexedSample.date_obtained)}
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
              </SampleDataItems>
            </DataArea>
          </DataPanel>
          {multiplexedSample.multiplexed_samples.length > 0 && (
            <>
              <DataAreaTitle>Multiplexed Samples</DataAreaTitle>
              <SampleTable samples={multiplexedSample.multiplexed_samples} />
            </>
          )}
          {multiplexedSample.file_sets.length > 0 && (
            <>
              <DataAreaTitle>File Sets</DataAreaTitle>
              <FileSetTable fileSets={multiplexedSample.file_sets} />
            </>
          )}
          {multiplexedSample.modifications?.length > 0 && (
            <>
              <DataAreaTitle>Modifications</DataAreaTitle>
              <ModificationsTable
                modifications={multiplexedSample.modifications}
              />
            </>
          )}
          {biomarkers.length > 0 && (
            <>
              <DataAreaTitle>Biomarkers</DataAreaTitle>
              <BiomarkerTable biomarkers={biomarkers} />
            </>
          )}
          {multiplexedSample.treatments.length > 0 && (
            <>
              <DataAreaTitle>Treatments</DataAreaTitle>
              <TreatmentTable treatments={multiplexedSample.treatments} />
            </>
          )}
          {documents.length > 0 && (
            <>
              <DataAreaTitle>Documents</DataAreaTitle>
              <DocumentTable documents={documents} />
            </>
          )}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

MultiplexedSample.propTypes = {
  // MultiplexedSample-cell sample to display
  multiplexedSample: PropTypes.object.isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sources associated with the sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const multiplexedSample = await request.getObject(
    `/multiplexed-samples/${params.uuid}/`
  );
  if (FetchRequest.isResponseSuccess(multiplexedSample)) {
    const documents = multiplexedSample.documents
      ? await requestDocuments(multiplexedSample.documents, request)
      : [];
    const donors = multiplexedSample.donors
      ? await requestDonors(multiplexedSample.donors, request)
      : [];
    // For sources, use getMultipleObjects for sources instead of getMultipleObjectBulk.
    // Sources point at both lab and source objects, however, it currently only LinkTo sources.
    let sources = [];
    if (multiplexedSample.sources?.length > 0) {
      const sourcePaths = multiplexedSample.sources.map(
        (source) => source["@id"]
      );
      sources = await request.getMultipleObjects(sourcePaths, null, {
        filterErrors: true,
      });
    }
    const biomarkers =
      multiplexedSample.biomarkers?.length > 0
        ? await requestBiomarkers(multiplexedSample.biomarkers, request)
        : [];
    const breadcrumbs = await buildBreadcrumbs(
      multiplexedSample,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      multiplexedSample,
      req.headers.cookie
    );
    return {
      props: {
        multiplexedSample,
        documents,
        donors,
        sources,
        pageContext: {
          title: `${multiplexedSample.sample_terms[0].term_name} — ${multiplexedSample.accession}`,
        },
        biomarkers,
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(multiplexedSample);
}

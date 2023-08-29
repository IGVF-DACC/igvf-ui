// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import BiomarkerTable from "../../components/biomarker-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ModificationsTable from "../../components/modification-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import TreatmentTable from "../../components/treatment-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestBiomarkers,
  requestBiosamples,
  requestDocuments,
  requestDonors,
  requestOntologyTerms,
  requestTreatments,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function PrimaryCell({
  primaryCell,
  diseaseTerms,
  documents,
  donors,
  sources,
  treatments,
  pooledFrom,
  biomarkers,
  partOf,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
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
                sources={sources}
                donors={donors}
                sampleTerms={primaryCell.sample_terms}
                diseaseTerms={diseaseTerms}
                pooledFrom={pooledFrom}
                partOf={partOf}
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
          {primaryCell.file_sets.length > 0 && (
            <>
              <DataAreaTitle>File Sets</DataAreaTitle>
              <FileSetTable fileSets={primaryCell.file_sets} />
            </>
          )}
          {primaryCell.modifications?.length > 0 && (
            <>
              <DataAreaTitle>Modifications</DataAreaTitle>
              <ModificationsTable modifications={primaryCell.modifications} />
            </>
          )}
          {biomarkers.length > 0 && (
            <>
              <DataAreaTitle>Biomarkers</DataAreaTitle>
              <BiomarkerTable biomarkers={biomarkers} />
            </>
          )}
          {treatments.length > 0 && (
            <>
              <DataAreaTitle>Treatments</DataAreaTitle>
              <TreatmentTable treatments={treatments} />
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

PrimaryCell.propTypes = {
  // Primary-cell sample to display
  primaryCell: PropTypes.object.isRequired,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Source lab or source for this sample
  sources: PropTypes.arrayOf(PropTypes.object),
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample(s) Pooled From
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Part of Biosample
  partOf: PropTypes.object,
  // Attribution for this sample
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const primaryCell = await request.getObject(`/primary-cells/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(primaryCell)) {
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
    let sources = [];
    if (primaryCell.sources?.length > 0) {
      const sourcePaths = primaryCell.sources.map((source) => source["@id"]);
      sources = await request.getMultipleObjects(sourcePaths, null, {
        filterErrors: true,
      });
    }
    const treatments = primaryCell.treatments
      ? await requestTreatments(primaryCell.treatments, request)
      : [];
    const pooledFrom =
      primaryCell.pooled_from?.length > 0
        ? await requestBiosamples(primaryCell.pooled_from, request)
        : [];
    const partOf = primaryCell.part_of
      ? await request.getObject(primaryCell.part_of, null)
      : null;
    const biomarkers =
      primaryCell.biomarkers?.length > 0
        ? await requestBiomarkers(primaryCell.biomarkers, request)
        : [];
    const breadcrumbs = await buildBreadcrumbs(
      primaryCell,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(primaryCell, req.headers.cookie);
    return {
      props: {
        primaryCell,
        diseaseTerms,
        documents,
        donors,
        sources,
        treatments,
        pooledFrom,
        partOf,
        biomarkers,
        pageContext: {
          title: `${primaryCell.sample_terms[0].term_name} — ${primaryCell.accession}`,
        },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(primaryCell);
}

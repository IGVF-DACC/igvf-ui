// node_modules
import PropTypes from "prop-types";
// components
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
import DocumentTable from "../../components/document-table";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import TreatmentTable from "../../components/treatment-table";
import { EditableItem } from "../../components/edit";
import BiomarkerTable from "../../components/biomarker-table";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import buildAttribution from "../../lib/attribution";

export default function PrimaryCell({
  primaryCell,
  biosampleTerm = null,
  diseaseTerms,
  documents,
  donors,
  source = null,
  treatments,
  pooledFrom,
  biomarkers,
  partOf,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={primaryCell}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={primaryCell.status} />
            </DataItemValue>
            <BiosampleDataItems
              biosample={primaryCell}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerms={diseaseTerms}
              pooledFrom={pooledFrom}
              partOf={partOf}
              options={{
                dateObtainedTitle: "Date Harvested",
              }}
            >
              {primaryCell.passage_number && (
                <>
                  <DataItemLabel>Passage Number</DataItemLabel>
                  <DataItemValue>{primaryCell.passage_number}</DataItemValue>
                </>
              )}
            </BiosampleDataItems>
          </DataArea>
        </DataPanel>
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
      </EditableItem>
    </>
  );
}

PrimaryCell.propTypes = {
  // Primary-cell sample to display
  primaryCell: PropTypes.object.isRequired,
  // Biosample ontology for this sample
  biosampleTerm: PropTypes.object,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with the sample
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Source lab or source for this sample
  source: PropTypes.object,
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample(s) Pooled From
  pooledFrom: PropTypes.arrayOf(PropTypes.object),
  // Biomarkers of the sample
  biomarkers: PropTypes.arrayOf(PropTypes.object),
  // Part of Biosample
  partOf: PropTypes.object,
  // Attribution for this sample
  attribution: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const primaryCell = await request.getObject(`/primary-cells/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(primaryCell)) {
    const biosampleTerm = primaryCell.biosample_term
      ? await request.getObject(primaryCell.biosample_term["@id"], null)
      : null;
    let diseaseTerms = [];
    if (primaryCell.disease_terms?.length > 0) {
      const diseaseTermPaths = primaryCell.disease_terms.map(
        (diseaseTerm) => diseaseTerm["@id"]
      );
      diseaseTerms = await request.getMultipleObjects(diseaseTermPaths, null, {
        filterErrors: true,
      });
    }
    const documents = primaryCell.documents
      ? await request.getMultipleObjects(primaryCell.documents, null, {
          filterErrors: true,
        })
      : [];
    const donors = primaryCell.donors
      ? await request.getMultipleObjects(primaryCell.donors, null, {
          filterErrors: true,
        })
      : [];
    const source = await request.getObject(primaryCell.source["@id"], null);
    const treatments = primaryCell.treatments
      ? await request.getMultipleObjects(primaryCell.treatments, null, {
          filterErrors: true,
        })
      : [];
    const pooledFrom =
      primaryCell.pooled_from?.length > 0
        ? await request.getMultipleObjects(primaryCell.pooled_from, null, {
            filterErrors: true,
          })
        : [];
    const partOf = primaryCell.part_of
      ? await request.getObject(primaryCell.part_of, null)
      : null;
    const biomarkers =
      primaryCell.biomarkers?.length > 0
        ? await request.getMultipleObjects(primaryCell.biomarkers, null, {
            filterErrors: true,
          })
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
        biosampleTerm,
        diseaseTerms,
        documents,
        donors,
        source,
        treatments,
        pooledFrom,
        partOf,
        biomarkers,
        pageContext: {
          title: `${biosampleTerm ? `${biosampleTerm.term_name} — ` : ""}${
            primaryCell.accession
          }`,
        },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(primaryCell);
}

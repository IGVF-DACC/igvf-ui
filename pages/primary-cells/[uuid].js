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
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const PrimaryCell = ({
  primaryCell,
  award = null,
  biosampleTerm = null,
  diseaseTerms,
  documents,
  donors,
  lab = null,
  source = null,
  treatments,
}) => {
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
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
};

PrimaryCell.propTypes = {
  // Primary-cell sample to display
  primaryCell: PropTypes.object.isRequired,
  // Award applied to this sample
  award: PropTypes.object,
  // Biosample ontology for this sample
  biosampleTerm: PropTypes.object,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with the cell-line
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this sample
  lab: PropTypes.object,
  // Source lab or source for this sample
  source: PropTypes.object,
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default PrimaryCell;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const primaryCell = await request.getObject(`/primary-cells/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(primaryCell)) {
    const award = await request.getObject(primaryCell.award, null);
    const biosampleTerm = primaryCell.biosample_term
      ? await request.getObject(primaryCell.biosample_term, null)
      : null;
    const diseaseTerms = primaryCell.disease_terms
      ? await request.getMultipleObjects(primaryCell.disease_terms, null, {
          filterErrors: true,
        })
      : [];
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
    const lab = await request.getObject(primaryCell.lab, null);
    const source = await request.getObject(primaryCell.source, null);
    const treatments = primaryCell.treatments
      ? await request.getMultipleObjects(primaryCell.treatments, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      primaryCell,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        primaryCell,
        award,
        biosampleTerm,
        diseaseTerms,
        documents,
        donors,
        lab,
        source,
        treatments,
        pageContext: {
          title: `${biosampleTerm ? `${biosampleTerm.term_name} — ` : ""}${
            primaryCell.accession
          }`,
        },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(primaryCell);
};

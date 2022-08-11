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
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import TreatmentTable from "../../components/treatment-table";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const CellLine = ({
  cellLine,
  award = null,
  biosampleTerm = null,
  diseaseTerms,
  donors,
  lab = null,
  source = null,
  treatments,
}) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={cellLine}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={cellLine.status} />
            </DataItemValue>
            <BiosampleDataItems
              biosample={cellLine}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerms={diseaseTerms}
              options={{
                dateObtainedTitle: "Date Harvested",
              }}
            >
              {cellLine.passage_number && (
                <>
                  <DataItemLabel>Passage Number</DataItemLabel>
                  <DataItemValue>{cellLine.passage_number}</DataItemValue>
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
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
};

CellLine.propTypes = {
  // Cell-line sample to display
  cellLine: PropTypes.object.isRequired,
  // Award applied to this cell line
  award: PropTypes.object,
  // Biosample term for this cell line
  biosampleTerm: PropTypes.object,
  // Disease term for this cell line
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with the tissue
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this cell line
  lab: PropTypes.object,
  // Source lab or source for this cell line
  source: PropTypes.object,
  // List of associated treatments
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CellLine;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const cellLine = await request.getObject(`/cell-lines/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(cellLine)) {
    const award = await request.getObject(cellLine.award, null);
    const biosampleTerm = cellLine.biosample_term
      ? await request.getObject(cellLine.biosample_term, null)
      : null;
    const diseaseTerms = cellLine.disease_terms
      ? await request.getMultipleObjects(cellLine.disease_terms, null, {
          filterErrors: true,
        })
      : [];
    const donors = cellLine.donors
      ? await request.getMultipleObjects(cellLine.donors, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(cellLine.lab, null);
    const source = await request.getObject(cellLine.source, null);
    const treatments = cellLine.treatments
      ? await request.getMultipleObjects(cellLine.treatments, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      cellLine,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        cellLine,
        award,
        biosampleTerm,
        diseaseTerms,
        donors,
        lab,
        source,
        treatments,
        pageContext: { title: cellLine.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(cellLine);
};

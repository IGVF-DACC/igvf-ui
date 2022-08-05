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

const PrimaryCell = ({
  primaryCell,
  donors,
  award,
  lab,
  source,
  treatments,
  biosampleTerm = null,
  diseaseTerm = null,
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
              diseaseTerm={diseaseTerm}
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
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
};

PrimaryCell.propTypes = {
  // Primary-cell sample to display
  primaryCell: PropTypes.object.isRequired,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Award applied to this sample
  award: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  // Lab that submitted this sample
  lab: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  // Source lab or source for this sample
  source: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample ontology for this sample
  biosampleTerm: PropTypes.object,
  // Disease ontology for this sample
  diseaseTerm: PropTypes.object,
};

export default PrimaryCell;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const primaryCell = await request.getObject(`/primary-cells/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(primaryCell)) {
    const award = await request.getObject(primaryCell.award, {});
    const donors = primaryCell.donors
      ? await request.getMultipleObjects(primaryCell.donors, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(primaryCell.lab, {});
    const source = await request.getObject(primaryCell.source, {});
    const treatments = primaryCell.treatments
      ? await request.getMultipleObjects(primaryCell.treatments, null, {
          filterErrors: true,
        })
      : [];
    const biosampleTerm = primaryCell.biosample_term
      ? await request.getObject(primaryCell.biosample_term, {})
      : null;
    const diseaseTerm = primaryCell.disease_term
      ? await request.getObject(primaryCell.disease_term, {})
      : null;
    const breadcrumbs = await buildBreadcrumbs(
      primaryCell,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        primaryCell,
        award,
        donors,
        lab,
        source,
        treatments,
        biosampleTerm,
        diseaseTerm,
        pageContext: { title: primaryCell.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(primaryCell);
};

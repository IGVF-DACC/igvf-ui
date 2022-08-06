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

const DifferentiatedCell = ({
  differentiatedCell,
  donors,
  award,
  lab,
  source,
  treatments,
  differentiationTreatments,
  biosampleTerm = null,
  diseaseTerm = null,
}) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={differentiatedCell}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={differentiatedCell.status} />
            </DataItemValue>
            <BiosampleDataItems
              biosample={differentiatedCell}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerm={diseaseTerm}
              options={{
                dateObtainedTitle: "Date Collected",
              }}
            >
              {differentiatedCell.post_differentiation_time && (
                <>
                  <DataItemLabel>Post-differentiation time</DataItemLabel>
                  <DataItemValue>
                    {differentiatedCell.post_differentiation_time}
                    {differentiatedCell.post_differentiation_time_units ? (
                      <>
                        {" "}
                        {differentiatedCell.post_differentiation_time_units}
                        {differentiatedCell.post_differentiation_time === 1
                          ? ""
                          : "s"}
                      </>
                    ) : (
                      ""
                    )}
                  </DataItemValue>
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
        {differentiationTreatments.length > 0 && (
          <>
            <DataAreaTitle>Differentiation Treatments</DataAreaTitle>
            <TreatmentTable treatments={differentiationTreatments} />
          </>
        )}
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
};

DifferentiatedCell.propTypes = {
  // Differentiated-cell sample to display
  differentiatedCell: PropTypes.object.isRequired,
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
  // Differentiation treatments associated with the sample
  differentiationTreatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample ontology for this sample
  biosampleTerm: PropTypes.object,
  // Disease ontology for this sample
  diseaseTerm: PropTypes.object,
};

export default DifferentiatedCell;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const differentiatedCell = await request.getObject(
    `/differentiated-cells/${params.uuid}/`
  );
  if (FetchRequest.isResponseSuccess(differentiatedCell)) {
    const award = await request.getObject(differentiatedCell.award, {});
    const donors = differentiatedCell.donors
      ? await request.getMultipleObjects(differentiatedCell.donors, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(differentiatedCell.lab, {});
    const source = await request.getObject(differentiatedCell.source, {});
    const treatments = differentiatedCell.treatments
      ? await request.getMultipleObjects(differentiatedCell.treatments, null, {
          filterErrors: true,
        })
      : [];
    const differentiationTreatments =
      differentiatedCell.differentiation_treatments
        ? await request.getMultipleObjects(
            differentiatedCell.differentiation_treatments,
            null,
            { filterErrors: true }
          )
        : [];
    const biosampleTerm = differentiatedCell.biosample_term
      ? await request.getObject(differentiatedCell.biosample_term, {})
      : null;
    const diseaseTerm = differentiatedCell.disease_term
      ? await request.getObject(differentiatedCell.disease_term, {})
      : null;
    const breadcrumbs = await buildBreadcrumbs(
      differentiatedCell,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        differentiatedCell,
        award,
        donors,
        lab,
        source,
        treatments,
        differentiationTreatments,
        biosampleTerm,
        diseaseTerm,
        pageContext: { title: differentiatedCell.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(differentiatedCell);
};

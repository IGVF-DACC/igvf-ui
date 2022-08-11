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

const Tissue = ({
  tissue,
  donors,
  award = null,
  lab = null,
  source = null,
  treatments,
  biosampleTerm = null,
  diseaseTerms,
}) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={tissue}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={tissue.status} />
            </DataItemValue>
            <BiosampleDataItems
              biosample={tissue}
              source={source}
              donors={donors}
              biosampleTerm={biosampleTerm}
              diseaseTerms={diseaseTerms}
              options={{
                dateObtainedTitle: "Date Harvested",
              }}
            >
              {tissue.pmi && (
                <>
                  <DataItemLabel>Post-mortem Interval</DataItemLabel>
                  <DataItemValue>
                    {tissue.pmi}
                    {tissue.pmi_units ? (
                      <>
                        {" "}
                        {tissue.pmi_units}
                        {tissue.pmi_units === 1 ? "" : "s"}
                      </>
                    ) : (
                      ""
                    )}
                  </DataItemValue>
                </>
              )}
              {tissue.preservation_method && (
                <>
                  <DataItemLabel>Preservation Method</DataItemLabel>
                  <DataItemValue>{tissue.preservation_method}</DataItemValue>
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

Tissue.propTypes = {
  // Tissue sample to display
  tissue: PropTypes.object.isRequired,
  // Award applied to this sample
  award: PropTypes.null,
  // Donors associated with the sample
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this sample
  lab: PropTypes.object,
  // Source lab or source for this sample
  source: PropTypes.object,
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Biosample ontology for this sample
  biosampleTerm: PropTypes.object,
  // Disease ontology for this sample
  diseaseTerms: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Tissue;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const tissue = await request.getObject(`/tissues/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(tissue)) {
    const award = await request.getObject(tissue.award, null);
    const biosampleTerm = tissue.biosample_term
      ? await request.getObject(tissue.biosample_term, null)
      : null;
    const diseaseTerms = tissue.disease_terms
      ? await request.getMultipleObjects(tissue.disease_terms, null, {
          filterErrors: true,
        })
      : [];
    const donors = tissue.donors
      ? await request.getMultipleObjects(tissue.donors, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(tissue.lab, null);
    const source = await request.getObject(tissue.source, null);
    const treatments = tissue.treatments
      ? await request.getMultipleObjects(tissue.treatments, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      tissue,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        tissue,
        award,
        donors,
        lab,
        source,
        treatments,
        biosampleTerm,
        diseaseTerms,
        pageContext: { title: tissue.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(tissue);
};

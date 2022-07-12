// node_modules
import PropTypes from "prop-types"
// components
import Attribution from "../../components/attribution"
import Breadcrumbs from "../../components/breadcrumbs"
import { BiosampleDataItems } from "../../components/common-data-items"
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
import TreatmentTable from "../../components/treatment-table"
import { EditableItem } from "../../components/edit"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const DifferentiatedTissue = ({
  differentiatedTissue,
  donors,
  award,
  lab,
  source,
  treatments,
  differentiationTreatments,
}) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={differentiatedTissue}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={differentiatedTissue.status} />
            </DataItemValue>
            <BiosampleDataItems
              biosample={differentiatedTissue}
              source={source}
              donors={donors}
              options={{
                dateObtainedTitle: "Date Collected",
              }}
            >
              {differentiatedTissue.post_differentiation_time && (
                <>
                  <DataItemLabel>Post-differentiation time</DataItemLabel>
                  <DataItemValue>
                    {differentiatedTissue.post_differentiation_time}
                    {differentiatedTissue.post_differentiation_time_units ? (
                      <>
                        {" "}
                        {differentiatedTissue.post_differentiation_time_units}
                        {differentiatedTissue.post_differentiation_time === 1
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
  )
}

DifferentiatedTissue.propTypes = {
  // Differentiated-tissue sample to display
  differentiatedTissue: PropTypes.object.isRequired,
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
}

export default DifferentiatedTissue

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const differentiatedTissue = await request.getObject(
    `/differentiated-tissues/${params.uuid}/`
  )
  if (differentiatedTissue && differentiatedTissue.status !== "error") {
    const award = await request.getObject(differentiatedTissue.award)
    const donors = await request.getMultipleObjects(differentiatedTissue.donors)
    const lab = await request.getObject(differentiatedTissue.lab)
    const source = await request.getObject(differentiatedTissue.source)
    const treatments = await request.getMultipleObjects(
      differentiatedTissue.treatments
    )
    const differentiationTreatments = await request.getMultipleObjects(
      differentiatedTissue.differentiation_treatments
    )
    const breadcrumbs = await buildBreadcrumbs(
      differentiatedTissue,
      "accession"
    )
    return {
      props: {
        differentiatedTissue,
        award,
        donors,
        lab,
        source,
        treatments,
        differentiationTreatments,
        pageContext: { title: differentiatedTissue.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

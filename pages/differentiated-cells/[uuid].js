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

const DifferentiatedCell = ({
  differentiatedCell,
  donors,
  award,
  lab,
  source,
  treatments,
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
        <Attribution award={award} lab={lab} />
        </EditableItem>
    </>
  )
}

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
}

export default DifferentiatedCell

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const differentiatedCell = await request.getObject(
    `/differentiated-cells/${params.uuid}/`
  )
  if (differentiatedCell && differentiatedCell.status !== "error") {
    const award = await request.getObject(differentiatedCell.award)
    const donors = await request.getMultipleObjects(differentiatedCell.donors)
    const lab = await request.getObject(differentiatedCell.lab)
    const source = await request.getObject(differentiatedCell.source)
    const treatments = await request.getMultipleObjects(
      differentiatedCell.treatments
    )
    const breadcrumbs = await buildBreadcrumbs(differentiatedCell, "accession")
    return {
      props: {
        differentiatedCell,
        award,
        donors,
        lab,
        source,
        treatments,
        pageContext: { title: differentiatedCell.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

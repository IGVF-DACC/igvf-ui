// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-area"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const Treatment = ({ treatment }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
        <DataItem>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={treatment.status} />
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Treatment Term Name</DataItemLabel>
          <DataItemValue>{treatment.treatment_term_name}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Treatment Type</DataItemLabel>
          <DataItemValue>{treatment.treatment_type}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Amount</DataItemLabel>
          <DataItemValue>
            {treatment.amount} {treatment.amount_units}
          </DataItemValue>
        </DataItem>
        {treatment.duration && (
          <DataItem>
            <DataItemLabel>Duration</DataItemLabel>
            <DataItemValue>
              {treatment.duration} {treatment.duration_units}
              {treatment.duration === 1 ? "" : "s"}
            </DataItemValue>
          </DataItem>
        )}
        {treatment.pH && (
          <DataItem>
            <DataItemLabel>pH</DataItemLabel>
            <DataItemValue>{treatment.pH}</DataItemValue>
          </DataItem>
        )}
        {treatment.purpose && (
          <DataItem>
            <DataItemLabel>Purpose</DataItemLabel>
            <DataItemValue>{treatment.purpose}</DataItemValue>
          </DataItem>
        )}
        {treatment.post_treatment_time && (
          <DataItem>
            <DataItemLabel>Post-Treatment Time</DataItemLabel>
            <DataItemValue>
              {treatment.post_treatment_time}{" "}
              {treatment.post_treatment_time_units}
              {treatment.post_treatment_time === 1 ? "" : "s"}
            </DataItemValue>
          </DataItem>
        )}
        {treatment["temperature (Celsius)"] && (
          <DataItem>
            <DataItemLabel>Temperature</DataItemLabel>
            <DataItemValue>
              {treatment["temperature (Celsius)"]} &deg;C
            </DataItemValue>
          </DataItem>
        )}
      </DataArea>
    </>
  )
}

Treatment.propTypes = {
  // Technical treatment to display
  treatment: PropTypes.object.isRequired,
}

export default Treatment

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const treatment = await request.getObject(`/treatments/${params.uuid}/`)
  if (treatment && treatment.status !== "error") {
    const breadcrumbs = await buildBreadcrumbs(treatment, "treatment_term_id")
    return {
      props: {
        treatment,
        pageContext: { title: treatment.treatment_term_id },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

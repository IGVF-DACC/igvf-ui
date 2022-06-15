// node_modules
import PropTypes from "prop-types"
// components
import AliasList from "../../components/alias-list"
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
import { useEditor } from "../../components/edit"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { UC } from "../../libs/constants"
import Request from "../../libs/request"

const Treatment = ({ treatment }) => {
  return (
    <>
      <Breadcrumbs />
      {useEditor(treatment,
        <>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={treatment.status} />
            </DataItemValue>
            <DataItemLabel>Treatment Term Name</DataItemLabel>
            <DataItemValue>{treatment.treatment_term_name}</DataItemValue>
            <DataItemLabel>Treatment Type</DataItemLabel>
            <DataItemValue>{treatment.treatment_type}</DataItemValue>
            <DataItemLabel>Amount</DataItemLabel>
            <DataItemValue>
              {treatment.amount} {treatment.amount_units}
            </DataItemValue>
            {treatment.duration && (
              <>
                <DataItemLabel>Duration</DataItemLabel>
                <DataItemValue>
                  {treatment.duration} {treatment.duration_units}
                  {treatment.duration === 1 ? "" : "s"}
                </DataItemValue>
              </>
            )}
            {treatment.pH && (
              <>
                <DataItemLabel>pH</DataItemLabel>
                <DataItemValue>{treatment.pH}</DataItemValue>
              </>
            )}
            {treatment.purpose && (
              <>
                <DataItemLabel>Purpose</DataItemLabel>
                <DataItemValue>{treatment.purpose}</DataItemValue>
              </>
            )}
            {treatment.post_treatment_time && (
              <>
                <DataItemLabel>Post-Treatment Time</DataItemLabel>
                <DataItemValue>
                  {treatment.post_treatment_time}{" "}
                  {treatment.post_treatment_time_units}
                  {treatment.post_treatment_time === 1 ? "" : "s"}
                </DataItemValue>
              </>
            )}
            {treatment.temperature && (
              <>
                <DataItemLabel>Temperature</DataItemLabel>
                <DataItemValue>
                  {treatment.temperature}{" "}
                  {treatment.temperature_units === "Celsius"
                    ? `${UC.deg}C`
                    : treatment.temperature_units}
                </DataItemValue>
              </>
            )}
            {treatment.aliases.length > 0 && (
              <>
                <DataItemLabel>Aliases</DataItemLabel>
                <DataItemValue>
                  <AliasList aliases={treatment.aliases} />
                </DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
        </>
      )}
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
        uuid: params.uuid,
      },
    }
  }
  return { notFound: true }
}

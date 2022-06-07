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
import { EditLink } from '../../components/edit-func'
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
import TreatmentTable from "../../components/treatment-table"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const Tissue = ({ tissue, donors, award, lab, source, treatments, uuid }) => {
  return (
    <>
      <Breadcrumbs />
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
      <EditLink path={`/tissues/${uuid}`} item={tissue}/>
    </>
  )
}

Tissue.propTypes = {
  // Tissue sample to display
  tissue: PropTypes.object.isRequired,
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
  uuid: PropTypes.string.isRequired,
  // Treatments associated with the sample
  treatments: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Tissue

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const tissue = await request.getObject(`/tissues/${params.uuid}/`)
  if (tissue && tissue.status !== "error") {
    const award = await request.getObject(tissue.award)
    const donors = await request.getMultipleObjects(tissue.donors)
    const lab = await request.getObject(tissue.lab)
    const source = await request.getObject(tissue.source)
    const treatments = await request.getMultipleObjects(tissue.treatments)
    const breadcrumbs = await buildBreadcrumbs(tissue, "accession")
    return {
      props: {
        tissue,
        award,
        donors,
        lab,
        source,
        treatments,
        pageContext: { title: tissue.accession },
        breadcrumbs,
        uuid: params.uuid,
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

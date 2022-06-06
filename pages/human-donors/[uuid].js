// node_modules
import dayjs from "dayjs"
import PropTypes from "prop-types"
// components
import Attribution from "../../components/attribution"
import Breadcrumbs from "../../components/breadcrumbs"
import { DonorDataItems } from "../../components/common-data-items"
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import { DataGridContainer } from "../../components/data-grid"
import ExternalResources from "../../components/external-resources"
import PagePreamble from "../../components/page-preamble"
import SortableGrid from "../../components/sortable-grid"
import Status from "../../components/status"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { formatDateRange } from "../../libs/dates"
import Request from "../../libs/request"
import { EditLink } from '../../components/edit-func'

/**
 * Defines the columns for the health-status table.
 */
const healthStatusHistoryColumns = [
  {
    id: "dates",
    title: "Health Change Date",
    display: ({ source }) =>
      formatDateRange(source.date_start, source.date_end),
    sorter: (healthStatus) =>
      dayjs(healthStatus.date_start || healthStatus.date_end).unix(),
  },
  {
    id: "health_description",
    title: "Description",
    isSortable: false,
  },
]

const HumanDonor = ({ donor, award, lab, parents, uuid }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataPanel>
        <DataArea>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={donor.status} />
          </DataItemValue>
          <DonorDataItems donor={donor} parents={parents}>
            {donor.ethnicity && (
              <>
                <DataItemLabel>Ethnicity</DataItemLabel>
                <DataItemValue>{donor.ethnicity.join(", ")}</DataItemValue>
              </>
            )}
          </DonorDataItems>
        </DataArea>
      </DataPanel>
      <ExternalResources resources={donor.external_resources} />
      {donor.health_status_history?.length > 0 && (
        <>
          <DataAreaTitle>Health Status History</DataAreaTitle>
          <DataGridContainer>
            <SortableGrid
              data={donor.health_status_history}
              columns={healthStatusHistoryColumns}
            />
          </DataGridContainer>
        </>
      )}
      <Attribution award={award} lab={lab} />
      <EditLink path={`/human-donors/${uuid}`} item={donor}/>
    </>
  )
}

HumanDonor.propTypes = {
  // Technical sample to display
  donor: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.object.isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.object.isRequired,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
  uuid: PropTypes.string.isRequired,
}

export default HumanDonor

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const donor = await request.getObject(`/human-donors/${params.uuid}/`)
  if (donor && donor.status !== "error") {
    const award = await request.getObject(donor.award)
    const lab = await request.getObject(donor.lab)
    const parents = await request.getMultipleObjects(donor.parents)
    const breadcrumbs = await buildBreadcrumbs(donor, "accession")
    return {
      props: {
        donor,
        award,
        lab,
        parents,
        pageContext: { title: donor.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
        uuid: params.uuid,
      },
    }
  }
  return { notFound: true }
}

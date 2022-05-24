// node_modules
import dayjs from "dayjs"
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Attributions from "../../components/attributions"
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataAreaTitle,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-area"
import { DataGridContainer } from "../../components/data-grid"
import ExternalResources from "../../components/external-resources"
import PagePreamble from "../../components/page-preamble"
import SeparatedList from "../../components/separated-list"
import SortableGrid from "../../components/sortable-grid"
import Status from "../../components/status"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { formatDateRange } from "../../libs/dates"
import Request from "../../libs/request"

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

const HumanDonor = ({ donor, award, lab, parents }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
        <DataItem>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={donor.status} />
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Taxa Identifier</DataItemLabel>
          <DataItemValue>{donor.taxon_id}</DataItemValue>
        </DataItem>
        {donor.sex && (
          <DataItem>
            <DataItemLabel>Sex</DataItemLabel>
            <DataItemValue>{donor.sex}</DataItemValue>
          </DataItem>
        )}
        {parents.length > 0 && (
          <DataItem>
            <DataItemLabel>Parents</DataItemLabel>
            <SeparatedList>
              {parents.map((parent) => (
                <Link href={parent["@id"]} key={parent.uuid}>
                  <a aria-label={`Parent Donor ${parent.accession}`}>
                    {parent.accession}
                  </a>
                </Link>
              ))}
            </SeparatedList>
          </DataItem>
        )}
        {donor.ethnicity && (
          <DataItem>
            <DataItemLabel>Ethnicity</DataItemLabel>
            <DataItemValue>{donor.ethnicity.join(", ")}</DataItemValue>
          </DataItem>
        )}
      </DataArea>
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
      <Attributions award={award} lab={lab} />
    </>
  )
}

HumanDonor.propTypes = {
  // Technical sample to display
  donor: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  // Parents of this donor
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
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
      },
    }
  }
  return { notFound: true }
}

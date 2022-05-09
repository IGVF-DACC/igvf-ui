// node_modules
import dayjs from "dayjs"
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataAreaTitle,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-area"
import { DataGridContainer } from "../../components/data-grid"
import PagePreamble from "../../components/page-preamble"
import SeparatedList from "../../components/separated-list"
import SortableGrid from "../../components/sortable-grid"
import Status from "../../components/status"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { formatDateRange } from "../../libs/dates"
import Request from "../../libs/request"

const externalResourcesColumns = [
  {
    id: "resource_identifier",
    title: "Identifier",
    display: ({ source }) => (
      <>
        {source.resource_url ? (
          <a href={source.resource_url} target="_blank" rel="noreferrer">
            {source.resource_identifier}
          </a>
        ) : (
          <>{source.resource_identifier}</>
        )}
      </>
    ),
  },
  {
    id: "resource_name",
    title: "Name",
    isSortable: false,
  },
]

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

const TechnicalSample = ({ donor, award, lab, parents }) => {
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
      {donor.external_resources?.length > 0 && (
        <>
          <DataAreaTitle>Resources</DataAreaTitle>
          <DataGridContainer>
            <SortableGrid
              data={donor.external_resources}
              columns={externalResourcesColumns}
            />
          </DataGridContainer>
        </>
      )}
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
      <DataAreaTitle>Attribution</DataAreaTitle>
      <DataArea>
        <DataItem>
          <DataItemLabel>Award</DataItemLabel>
          <DataItemValue>
            <Link href={award["@id"]}>
              <a>{award.name}</a>
            </Link>
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Lab</DataItemLabel>
          <DataItemValue>
            <Link href={lab["@id"]}>
              <a>{lab.title}</a>
            </Link>
          </DataItemValue>
        </DataItem>
        {donor.url && (
          <DataItem>
            <DataItemValue>
              <a href={donor.url} target="_blank" rel="noreferrer">
                Additional Information
              </a>
            </DataItemValue>
          </DataItem>
        )}
      </DataArea>
    </>
  )
}

TechnicalSample.propTypes = {
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

export default TechnicalSample

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
      },
    }
  }
  return { notFound: true }
}

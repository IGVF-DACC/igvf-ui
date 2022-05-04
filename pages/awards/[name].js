// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-item"
import PagePreamble from "../../components/page-preamble"
import Status from "../../components/status"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { formatDateRange } from "../../libs/dates"
import Request from "../../libs/request"

const Award = ({ award, pis }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
        <DataItem>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={award.status} />
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Title</DataItemLabel>
          <DataItemValue>{award.title}</DataItemValue>
        </DataItem>
        {award.description && (
          <DataItem>
            <DataItemLabel>Description</DataItemLabel>
            <DataItemValue>{award.description}</DataItemValue>
          </DataItem>
        )}
        {pis.length > 0 && (
          <DataItem>
            <DataItemLabel>Principal Investigator</DataItemLabel>
            <DataItemValue>
              {pis.map((pi) => pi.title).join(", ")}
            </DataItemValue>
          </DataItem>
        )}
        {award.component && (
          <DataItem>
            <DataItemLabel>Component</DataItemLabel>
            <DataItemValue>{award.component}</DataItemValue>
          </DataItem>
        )}
        <DataItem>
          <DataItemLabel>Project</DataItemLabel>
          <DataItemValue>{award.project}</DataItemValue>
        </DataItem>
        {(award.start_date || award.end_date) && (
          <DataItem>
            <DataItemLabel>Grant Dates</DataItemLabel>
            <DataItemValue>
              {formatDateRange(award.start_date, award.end_date)}
            </DataItemValue>
          </DataItem>
        )}
        {award.url && (
          <DataItem>
            <DataItemValue>
              <a href={award.url} target="_blank" rel="noreferrer">
                Additional Information
              </a>
            </DataItemValue>
          </DataItem>
        )}
      </DataArea>
    </>
  )
}

Award.propTypes = {
  // Award data to display on the page
  award: PropTypes.object.isRequired,
  // Principal investigator data associated with `award`
  pis: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Award

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const award = await request.getObject(`/awards/${params.name}/`)
  if (award && award.status !== "error") {
    const pis = award.pi ? await request.getMultipleObjects(award.pi) : []
    const breadcrumbs = await buildBreadcrumbs(award, "name")
    return {
      props: {
        award,
        pis,
        pageContext: { title: award.name },
        breadcrumbs,
      },
    }
  }
  return { notFound: true }
}

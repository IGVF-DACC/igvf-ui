// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import { EditLink } from '../../components/edit-func'
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
      <DataPanel>
        <DataArea>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={award.status} />
          </DataItemValue>
          <DataItemLabel>Title</DataItemLabel>
          <DataItemValue>{award.title}</DataItemValue>
          {award.description && (
            <>
              <DataItemLabel>Description</DataItemLabel>
              <DataItemValue>{award.description}</DataItemValue>
            </>
          )}
          {pis.length > 0 && (
            <>
              <DataItemLabel>Principal Investigator</DataItemLabel>
              <DataItemValue>
                {pis.map((pi) => pi.title).join(", ")}
              </DataItemValue>
            </>
          )}
          {award.component && (
            <>
              <DataItemLabel>Component</DataItemLabel>
              <DataItemValue>{award.component}</DataItemValue>
            </>
          )}
          <DataItemLabel>Project</DataItemLabel>
          <DataItemValue>{award.project}</DataItemValue>
          {(award.start_date || award.end_date) && (
            <>
              <DataItemLabel>Grant Dates</DataItemLabel>
              <DataItemValue>
                {formatDateRange(award.start_date, award.end_date)}
              </DataItemValue>
            </>
          )}
          {award.url && (
            <>
              <DataItemLabel>Additional Information</DataItemLabel>
              <DataItemValue>
                <a href={award.url} target="_blank" rel="noreferrer">
                  {award.url}
                </a>
              </DataItemValue>
            </>
          )}
        </DataArea>
      </DataPanel>
      <EditLink path={`/awards/${award.name}`} item={award}/>
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
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

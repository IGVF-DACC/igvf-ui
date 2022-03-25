// node_modules
import PropTypes from "prop-types"
// components
import {
  DataArea,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-item"
import PagePreamble from "../../components/page-preamble"
// libs
import { formatDateRange } from "../../libs/dates"
import { getMultipleObjects, getObject } from "../../libs/request"

const Award = ({ award, pis }) => {
  return (
    <>
      <PagePreamble />
      <DataArea>
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

export const getServerSideProps = async ({ params }) => {
  const award = await getObject(`/awards/${params.name}/`)
  const pis = award.pi ? await getMultipleObjects(award.pi) : []
  return {
    props: {
      award,
      pis,
      pageContext: { title: award.name },
    },
  }
}

// node_modules
import Head from "next/head"
import PropTypes from "prop-types"
// components
import DataItem, {
  DataItemLabel,
  DataItemValue,
} from "../../components/data-item"
import PageTitle from "../../components/page-title"
// libs
import { UC } from "../../libs/constants"
import { getObject } from "../../libs/request"

const Award = ({ award, pi, siteContext, pageContext }) => {
  return (
    <>
      <Head>
        <title>{`${siteContext.title} ${UC.mdash} ${pageContext.title}`}</title>
      </Head>
      <div>
        <PageTitle>{award.name}</PageTitle>
        <DataItem>
          <DataItemLabel>Title</DataItemLabel>
          <DataItemValue>{award.title}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Description</DataItemLabel>
          <DataItemValue>{award.description}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Principal Investigator</DataItemLabel>
          <DataItemValue>{pi.title}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Component</DataItemLabel>
          <DataItemValue>{award.component}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Project</DataItemLabel>
          <DataItemValue>{award.project}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>RFA</DataItemLabel>
          <DataItemValue>{award.rfa}</DataItemValue>
        </DataItem>
      </div>
    </>
  )
}

Award.propTypes = {
  // Award data to display on the page
  award: PropTypes.object.isRequired,
  // Principal investigator data associated with `award`
  pi: PropTypes.object.isRequired,
  // Site context data
  siteContext: PropTypes.object.isRequired,
  // Page-specific context data
  pageContext: PropTypes.object.isRequired,
}

export default Award

export const getServerSideProps = async ({ params }) => {
  const award = await getObject(`/awards/${params.name}/`)
  const pi = await getObject(award.pi)
  return {
    props: {
      award,
      pi,
      pageContext: { title: award.name },
    },
  }
}

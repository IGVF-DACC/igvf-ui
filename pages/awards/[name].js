// nextjs
import Head from "next/head"
// components
import PageTitle from "../../components/page-title"
import DataItem, {
  DataItemLabel,
  DataItemValue,
} from "../../components/data-item"
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

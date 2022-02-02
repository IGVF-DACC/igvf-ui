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

const User = ({ user, lab, siteContext, pageContext }) => {
  return (
    <>
      <Head>
        <title>{`${siteContext.title} ${UC.mdash} ${pageContext.title}`}</title>
      </Head>
      <div>
        <PageTitle>{user.title}</PageTitle>
        <DataItem>
          <DataItemLabel>Lab</DataItemLabel>
          <DataItemValue>{lab.title}</DataItemValue>
        </DataItem>
      </div>
    </>
  )
}

export default User

export const getServerSideProps = async ({ params }) => {
  const user = await getObject(`/users/${params.uuid}/`)
  const lab = await getObject(user.lab)
  return {
    props: {
      user,
      lab,
      pageContext: { title: user.title },
    },
  }
}

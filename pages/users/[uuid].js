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

User.propTypes = {
  // User data to display on the page
  user: PropTypes.object.isRequired,
  // Lab data associated with `user`
  lab: PropTypes.object.isRequired,
  // Site context
  siteContext: PropTypes.object.isRequired,
  // Page-specific context
  pageContext: PropTypes.object.isRequired,
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

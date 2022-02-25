// node_modules
import PropTypes from "prop-types"
// components
import DataItem, {
  DataItemLabel,
  DataItemValue,
} from "../../components/data-item"
import PageTitle from "../../components/page-title"
import SiteTitle from "../../components/site-title"
// libs
import { getObject } from "../../libs/request"

const User = ({ user, lab }) => {
  return (
    <>
      <SiteTitle />
      <PageTitle>{user.title}</PageTitle>
      <DataItem>
        <DataItemLabel>Lab</DataItemLabel>
        <DataItemValue>{lab.title}</DataItemValue>
      </DataItem>
    </>
  )
}

User.propTypes = {
  // User data to display on the page
  user: PropTypes.object.isRequired,
  // Lab data associated with `user`
  lab: PropTypes.object.isRequired,
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

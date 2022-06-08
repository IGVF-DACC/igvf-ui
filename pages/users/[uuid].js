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
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const User = ({ lab, user }) => {

  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataPanel>
        <DataArea>
          <DataItemLabel>Lab</DataItemLabel>
          <DataItemValue>{lab.title}</DataItemValue>
        </DataArea>
      </DataPanel>
      <EditLink item={user}/>
    </>
  )
}

User.propTypes = {
  // Lab data associated with `user`
  lab: PropTypes.object.isRequired,
  // user object from the server
  user: PropTypes.object.isRequired,
}

export default User

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)

  const user = await request.getObject(`/users/${params.uuid}/`)
  if (user && user.status !== "error") {
    const lab = await request.getObject(user.lab)
    const breadcrumbs = await buildBreadcrumbs(user, "title")
    return {
      props: {
        lab,
        pageContext: { title: user.title },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
        user: user,
      },
    }
  }
}

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
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"
import { EditLink } from '../../components/edit-func'

const User = ({ lab, uuid, user }) => {

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
      <EditLink path={`/users/${uuid}`} item={user}/>
    </>
  )
}

User.propTypes = {
  // Lab data associated with `user`
  lab: PropTypes.object.isRequired,
  // UUID of the User
  uuid: PropTypes.string.isRequired,
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
        uuid: params.uuid,
      },
    }
  }
}

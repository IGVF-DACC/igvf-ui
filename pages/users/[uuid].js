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
// libs
import buildBreadcrumbContext from "../../libs/breadcrumbs"
import { getObject } from "../../libs/request"

const User = ({ lab }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
        <DataItem>
          <DataItemLabel>Lab</DataItemLabel>
          <DataItemValue>{lab.title}</DataItemValue>
        </DataItem>
      </DataArea>
    </>
  )
}

User.propTypes = {
  // Lab data associated with `user`
  lab: PropTypes.object.isRequired,
}

export default User

export const getServerSideProps = async ({ params }) => {
  const user = await getObject(`/users/${params.uuid}/`)
  const lab = await getObject(user.lab)
  const breadcrumbContext = await buildBreadcrumbContext(user, "title")
  return {
    props: {
      lab,
      pageContext: { title: user.title },
      breadcrumbContext,
    },
  }
}

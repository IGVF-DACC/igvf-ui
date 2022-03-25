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
import { getObject } from "../../libs/request"

const User = ({ lab }) => {
  return (
    <>
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
  return {
    props: {
      lab,
      pageContext: { title: user.title },
    },
  }
}

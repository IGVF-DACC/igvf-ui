// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import PagePreamble from "../../components/page-preamble"
// libs
import { getCollection } from "../../libs/request"

const UserList = ({ users }) => {
  return (
    <>
      <PagePreamble />
      <div>
        {users.map((user) => (
          <Link href={user["@id"]} key={user.uuid}>
            <a className="block">{user.title}</a>
          </Link>
        ))}
      </div>
    </>
  )
}

UserList.propTypes = {
  // Users to display in the list
  users: PropTypes.array.isRequired,
}

export default UserList

export const getServerSideProps = async () => {
  const users = await getCollection("users")
  return {
    props: {
      users: users["@graph"],
      pageContext: { title: users.title },
    },
  }
}

// nextjs
import Head from "next/head"
import Link from "next/link"
// components
import PageTitle from "../../components/page-title"
// libs
import { UC } from "../../libs/constants"
import { getCollection } from "../../libs/request"

const UserList = ({ users, siteContext, pageContext }) => {
  return (
    <>
      <Head>
        <title>{`${siteContext.title} ${UC.mdash} ${pageContext.title}`}</title>
      </Head>
      <div>
        <PageTitle>Users</PageTitle>
        <div>
          {users.map((user) => (
            <Link href={user["@id"]} key={user.uuid}>
              <a className="block">{user.title}</a>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
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

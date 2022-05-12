// node_modules
import { useAuth0 } from "@auth0/auth0-react"
import Image from "next/image"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import { useContext } from "react"
// components
import AccessKeyList from "../components/access-keys"
import { DataArea, DataItem } from "../components/data-area"
import PagePreamble from "../components/page-preamble"
import SessionContext from "../components/session-context"
import Spinner from "../components/spinner"
// libs
import { createAccessKey } from "../libs/access-keys"
import Request from "../libs/request"

const UserProfile = ({ sessionUser = null }) => {
  const { isLoading, user } = useAuth0()
  const router = useRouter()

  const { session } = useContext(SessionContext)

  const handleCreateKey = () => {
    createAccessKey(session).then(() => {
      router.replace(router.asPath)
    })
  }

  return (
    <>
      <PagePreamble />
      <DataArea>
        {isLoading ? (
          <Spinner className="stroke-gray-400" />
        ) : (
          <>
            {user ? (
              <>
                <DataItem className="flex items-center">
                  <Image
                    src={user.picture}
                    width={64}
                    height={64}
                    alt={`${user.name}'s profile picture`}
                  />
                  <div className="ml-2">{user.name}</div>
                </DataItem>
                <button onClick={handleCreateKey}>Create Access Key</button>
                <AccessKeyList accessKeys={sessionUser.access_keys} />
              </>
            ) : (
              <div className="text-center text-xl italic">Not signed in</div>
            )}
          </>
        )}
      </DataArea>
    </>
  )
}

UserProfile.propTypes = {
  sessionUser: PropTypes.object,
}

export default UserProfile

export const getServerSideProps = async ({ req }) => {
  // Get the currently logged-in user from the server, then get their user object that includes
  // their access keys.
  const request = new Request(req?.headers?.cookie)
  const sessionProperties = await request.getObject("/session-properties")
  const sessionUser = sessionProperties.user
    ? await request.getObject(sessionProperties.user["@id"])
    : null
  return {
    props: {
      sessionUser,
      pageContext: { title: "User Profile" },
      sessionCookie: req?.headers?.cookie,
    },
  }
}

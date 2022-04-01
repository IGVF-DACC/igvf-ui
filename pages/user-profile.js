// node_modules
import { useAuth0 } from "@auth0/auth0-react"
import Image from "next/image"
// components
import Spinner from "../components/spinner"
// components
import { DataArea, DataItem } from "../components/data-item"
import PagePreamble from "../components/page-preamble"

const UserProfile = () => {
  const { isLoading, user } = useAuth0()

  return (
    <>
      <PagePreamble pageTitle="User Profile" />
      <DataArea>
        {isLoading ? (
          <Spinner className="stroke-gray-400" />
        ) : (
          <>
            {user ? (
              <DataItem className="flex items-center">
                <Image
                  src={user.picture}
                  width={64}
                  height={64}
                  alt={`${user.name}'s profile picture`}
                />
                <div className="ml-2">{user.name}</div>
              </DataItem>
            ) : (
              <div className="text-center text-xl italic">Not signed in</div>
            )}
          </>
        )}
      </DataArea>
    </>
  )
}

export default UserProfile

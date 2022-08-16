// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import Image from "next/image";
import PropTypes from "prop-types";
// components
import {
  AccessKeyList,
  CreateAccessKeyTrigger,
} from "../components/access-keys";
import { DataPanel } from "../components/data-area";
import PagePreamble from "../components/page-preamble";
import Spinner from "../components/spinner";
// lib
import FetchRequest from "../lib/fetch-request";

const UserProfile = ({ sessionUser = null }) => {
  const { isLoading, user } = useAuth0();

  return (
    <>
      <PagePreamble />
      <DataPanel>
        {isLoading ? (
          <Spinner className="stroke-gray-400" />
        ) : (
          <>
            {user ? (
              <>
                <div className="flex items-center">
                  <Image
                    src={user.picture}
                    width={64}
                    height={64}
                    alt={`${user.name}'s profile picture`}
                  />
                  <div className="ml-2">{user.name}</div>
                </div>
                <CreateAccessKeyTrigger />
                {sessionUser && (
                  <AccessKeyList accessKeys={sessionUser.access_keys} />
                )}
              </>
            ) : (
              <div className="text-center text-xl italic">Not signed in</div>
            )}
          </>
        )}
      </DataPanel>
    </>
  );
};

UserProfile.propTypes = {
  sessionUser: PropTypes.object,
};

export default UserProfile;

export const getServerSideProps = async ({ req }) => {
  // Get the currently logged-in user from the server, then get their user object that includes
  // their access keys. Can't handle errors in the usual way because the returned object has no
  // @type.
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sessionProperties = await request.getObject("/session-properties");
  const sessionUser = sessionProperties.user
    ? await request.getObject(sessionProperties.user["@id"])
    : null;
  return {
    props: {
      sessionUser,
      pageContext: { title: "User Profile" },
    },
  };
};

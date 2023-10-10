// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import Image from "next/image";
import PropTypes from "prop-types";
import { useContext, useState } from "react";
// components
import {
  AccessKeyItem,
  AccessKeyList,
  CreateAccessKeyTrigger,
} from "../components/access-keys";
import { DataPanel } from "../components/data-area";
import PagePreamble from "../components/page-preamble";
import SessionContext from "../components/session-context";
import Spinner from "../components/spinner";
// lib
import FetchRequest from "../lib/fetch-request";
import errorObjectToProps from "../lib/errors";

export default function UserProfile({ sessionUser = null }) {
  // Keeps a current copy of the access keys for handling adds/deletes w/o relying on indexing.
  const [accessKeys, setAccessKeys] = useState(
    sessionUser ? sessionUser.access_keys : []
  );
  const { session, sessionProperties } = useContext(SessionContext);
  const { isLoading, user } = useAuth0();

  const username = sessionProperties?.user?.title || "User";

  /**
   * Called when the user adds a new access key.
   */
  function onAccessKeyChange() {
    if (sessionUser) {
      const request = new FetchRequest({ session });
      request
        .getObject(sessionUser["@id"], { isDbRequest: true })
        .then((user) => {
          user.map((u) => setAccessKeys(u.access_keys));
        });
    }
  }

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
                    alt={`${username}'s profile picture`}
                  />
                  <div className="ml-2">{username}</div>
                </div>
                <CreateAccessKeyTrigger onAccessKeyChange={onAccessKeyChange} />
                {accessKeys.length > 0 && (
                  <AccessKeyList>
                    {accessKeys.map((accessKey) => {
                      return (
                        <AccessKeyItem
                          key={accessKey.uuid}
                          accessKey={accessKey}
                          onAccessKeyChange={onAccessKeyChange}
                        />
                      );
                    })}
                  </AccessKeyList>
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
}

UserProfile.propTypes = {
  sessionUser: PropTypes.object,
};

export async function getServerSideProps({ req }) {
  // Get the currently logged-in user from the server, then get their user object that includes
  // their access keys. Can't handle errors in the usual way because the returned object has no
  // @type.
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sessionProperties = await request.getObject("/session-properties");
  if (sessionProperties.isOk()) {
    const sessionUserId = sessionProperties.unwrap().user["@id"];
    const sessionUser = (await request.getObject(sessionUserId)).union();
    return {
      props: {
        sessionUser,
        pageContext: { title: "User Profile" },
      },
    };
  }
  // We did not take the `if` branch, so `sessionProperties` is an Err
  return errorObjectToProps(sessionProperties.unwrap_err());
}

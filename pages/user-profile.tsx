// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import Image from "next/image";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useContext, useState } from "react";
// components
import {
  AccessKeyItem,
  AccessKeyList,
  CreateAccessKeyTrigger,
} from "../components/access-keys";
import { DataPanel } from "../components/data-area";
import FlashMessage from "../components/flash-message";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
import SessionContext from "../components/session-context";
import Spinner from "../components/spinner";
// lib
import { type PageProps } from "../lib/next-js";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
// root
import type { SessionPropertiesObject, UserObject } from "../globals";

interface UserProfileProps extends PageProps {
  sessionUser: UserObject | null;
}

export default function UserProfile({ sessionUser }: UserProfileProps) {
  // Keeps a current copy of the access keys for handling adds/deletes w/o relying on indexing.
  const [accessKeys, setAccessKeys] = useState(
    sessionUser ? sessionUser?.access_keys : []
  );
  const [accessKeyError, setAccessKeyError] = useState("");
  const { session, sessionProperties } = useContext(SessionContext);
  const { isLoading, user } = useAuth0();

  const username = sessionProperties?.user?.title || "User";

  /**
   * Called when the user adds a new access key.
   */
  function onAccessKeyChange() {
    if (sessionUser) {
      const request = new FetchRequest({ session });
      void request
        .getObject<UserObject>(sessionUser["@id"], { isDbRequest: true })
        .then((user) => {
          user.map((u) => setAccessKeys(u.access_keys));
        });
    }
  }

  return (
    <>
      <PagePreamble />
      {isLoading ? (
        <DataPanel>
          <Spinner
            className="w-full stroke-gray-400 pt-2"
            svgClassName="h-8 w-8"
          />
        </DataPanel>
      ) : user ? (
        <DataPanel>
          <div className="flex items-center">
            <Image
              src={user.picture}
              width={64}
              height={64}
              alt={`${username}'s profile picture`}
            />
            <div className="ml-2">{username}</div>
          </div>
          <CreateAccessKeyTrigger
            onAccessKeyChange={onAccessKeyChange}
            onError={setAccessKeyError}
          />
          {accessKeys.length > 0 && (
            <AccessKeyList>
              {accessKeys.map((accessKey) => {
                return (
                  <AccessKeyItem
                    key={accessKey.uuid}
                    accessKey={accessKey}
                    onAccessKeyChange={onAccessKeyChange}
                    onError={setAccessKeyError}
                  />
                );
              })}
            </AccessKeyList>
          )}
        </DataPanel>
      ) : (
        <NoCollectionData pageTitle="access keys" />
      )}
      {accessKeyError && (
        <FlashMessage
          message={accessKeyError}
          onClose={() => setAccessKeyError("")}
        />
      )}
    </>
  );
}

export async function getServerSideProps({
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<UserProfileProps>
> {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sessionResponse = await request.getObject<SessionPropertiesObject>(
    "/session-properties"
  );

  // Handle bad responses from the backend for the session properties request.
  if (sessionResponse.isErr()) {
    return errorObjectToProps(sessionResponse.unwrap_err());
  }

  // Get the user's object path if the user has logged in. The embedded user object doesn't contain
  // enough properties to use on the page, so we have to retrieve the full user object from the
  // backend.
  const sessionUserId = sessionResponse.unwrap().user?.["@id"];

  // If the current user hasn't logged in, return props with sessionUser as null.
  if (!sessionUserId) {
    return {
      props: {
        sessionUser: null,
        pageContext: { title: "User Profile" },
        isJson: false,
      },
    };
  }

  // Fetch the user's object from the backend using their object path.
  const userResponse = await request.getObject<UserObject>(sessionUserId, {
    isDbRequest: true,
  });
  if (userResponse.isErr()) {
    return errorObjectToProps(userResponse.unwrap_err());
  }

  // Return the full user object as part of the page props.
  return {
    props: {
      sessionUser: userResponse.unwrap(),
      pageContext: { title: "User Profile" },
      isJson: false,
    },
  };
}

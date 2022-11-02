import { createContext, useContext, useEffect, useState } from "react";
import FetchRequest from "../lib/fetch-request";
import SessionContext from "./session-context";

const ProfileMapContext = createContext({
  profileMap: {},
});

/**
 * This component is used in _App to generate the mappings between schemas
 * and their corresponding collection in the backend.
 *
 * Schemas define what types of objects can go inside a collection, so
 * there's a natural correspondence between schemas and collections.
 * For example the schema for /profiles/human_donor/ has a corresponding
 * collection /human-donors/. If a component needs to know what
 * collection corresponds to a given schema, it can use the ProfileMapContext
 * with:
 *
 * const { profileMap } = useContext(ProfileMapContext);
 *
 * Then the mapping can be accessed with `profileMap[schemaId]` where
 * schemaId is something like "human_donor", like above.
 *
 * This works by going through the nextjs api in the pages/api/mapprofile.js
 * which provides the actual mapping.
 *
 * @returns A ProfileMapContext provided with all the mappings between
 * schemas and collections
 */
export const ProfileMap = ({ children }) => {
  const [mapping, setMapping] = useState({});

  const { session } = useContext(SessionContext);

  useEffect(() => {
    new FetchRequest({ session }).getObject("/profiles").then((profiles) => {
      const api = new FetchRequest({ backend: true });
      // For each Profile get the name id
      Object.values(profiles)
        .filter((p) => {
          return Object.keys(p).includes("$id");
        })
        .forEach((p) => {
          const profileName = p["$id"].match(/^\/profiles\/(.+).json$/)[1];
          // Get the mapped collection for the profile schema
          api
            .getObject(`/api/mapprofile?profile=${profileName}`)
            .then((collect) => {
              setMapping((current) => {
                return { ...current, [profileName]: collect };
              });
            });
        });
    });
  }, [session]);

  return (
    <ProfileMapContext.Provider value={{ profileMap: mapping }}>
      {children}
    </ProfileMapContext.Provider>
  );
};

export default ProfileMapContext;

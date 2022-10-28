import { createContext, useContext, useEffect, useState } from "react";
import FetchRequest from "../lib/fetch-request";
import SessionContext from "./session-context";

const ProfileMapContext = createContext({
  profileMap: {},
});

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

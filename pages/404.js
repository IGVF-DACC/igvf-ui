// node_modules
import { useEffect, useContext } from "react";
// components
import Error from "../components/error";
import GlobalContext from "../components/global-context";

/**
 * Override for the default NextJS 404 error page.
 */
export default function Error404() {
  const { linkReload } = useContext(GlobalContext);

  useEffect(() => {
    // Any links available directly from the 404 page should reload the browser.
    linkReload.setIsEnabled(true);
  }, [linkReload]);

  return <Error statusCode={404} title="This page could not be found" />;
}

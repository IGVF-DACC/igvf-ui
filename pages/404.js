// components
import Error from "../components/error";

/**
 * Override for the default NextJS 404 error page.
 */
export default function Error404() {
  return <Error statusCode={404} title="This page could not be found" />;
}

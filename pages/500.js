// components
import Error from "../components/error";

/**
 * Override for the default NextJS 500 error page.
 */
export default function Error500() {
  return <Error statusCode={500} title="Error page" />;
}

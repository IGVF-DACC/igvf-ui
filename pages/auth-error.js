// components
import Error from "../components/error";

/**
 * Display an authentication error page.
 */
export default function AuthError() {
  return (
    <Error
      statusCode="AUTHENTICATION"
      title="Unable to sign in. You can still explore the site without viewing unreleased data."
    />
  );
}

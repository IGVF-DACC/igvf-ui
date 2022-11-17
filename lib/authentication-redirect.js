// node_modules
import Router from "next/router";

/* istanbul ignore file */
// This callback gets called by auth0 after it completes signing in. Getting full Jest coverage for
// this function makes little sense.

/**
 * Called by Auth0 when the user is redirected back from the home page after signing into Auth0.
 * This just redirects to the home page *again* to trigger the authentication state change in
 * useAuth0. Without this redirect, useAuth0 never notifies us that the user has signed in.
 */
const onRedirectCallback = () => {
  Router.replace("/");
};

export default onRedirectCallback;

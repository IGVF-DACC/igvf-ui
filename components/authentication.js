// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

/**
 * Determine whether the user has authenticated with Auth0 or not, in a stable way. The `useAuth0`
 * hook returns `isAuthenticated` as a boolean, but you can't rely on its value until `useAuth0`
 * returns false in `isLoading`, causing modules to have to pay attention to both booleans. This
 * hook returns a more stable form of `isAuthenticated` that returns true only when the user has
 * authenticated with Auth0 and `isLoading` is false, without having to pay attention to the
 * `isLoading` boolean.
 */
export const useAuthenticated = () => {
  const { isLoading, isAuthenticated } = useAuth0();
  // Caches the value of `isAuthenticated` the last time `isLoading` was false.
  const [stableAuthenticated, setStableAuthenticated] = useState(() =>
    isLoading ? false : isAuthenticated
  );

  useEffect(() => {
    if (!isLoading) {
      // Only update the cached value of `isAuthenticated` if the auth0-react package isn't in the
      // loading state.
      setStableAuthenticated(isAuthenticated);
    }
  }, [isLoading, isAuthenticated]);

  return stableAuthenticated;
};

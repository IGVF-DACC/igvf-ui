/**
 * This file is a catch-all for all routes that don't match any other route in the resources
 * folder. It will return a 404 page. This file is needed to prevent /pages/[...path].js from
 * intercepting routes within the /resources folder. `<ResourceCatchAll />` doesn't ever actually
 * render because the `getServerSideProps` function will always return a 404, causing the error
 * renderer to execute instead.
 */
export default function ResourceCatchAll() {
  return <h1>Resource Not Found</h1>;
}

export async function getServerSideProps() {
  return { notFound: true };
}

// node_modules
import PropTypes from "prop-types";
// components
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
// lib
import { UC } from "../lib/constants";
import FetchRequest from "../lib/fetch-request";

/**
 * This is an unusual page in that, in normal cases, it doesn't appear because `getServerSideProps`
 * redirects to the object page if it finds an object with that ID. However, if it can't find an
 * object with that ID, then this page renders with an error message.
 */
export default function IdSearch({ id }) {
  const errorText = id
    ? `item with the identifier ${UC.ldquo}${id}${UC.rdquo}`
    : "item";
  return (
    <>
      <PagePreamble />
      <NoCollectionData pageTitle={errorText} />
    </>
  );
}

IdSearch.propTypes = {
  // Queried ID that returned no results, or empty string if the user didn't give an id
  id: PropTypes.string.isRequired,
};

export async function getServerSideProps({ req, query }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  if (query.id) {
    // The user specified an `id={identifier}` query parameter. Send that to the data provider with
    // the form {data provider url}/{identifier} and `frame=object` to reduce the amount of data it
    // returns. If an object with that identifier exists, the data provider redirects to that
    // object. Use that object's path to redirect the browser to that object's page.
    const serverObject = await request.getObject(`/${query.id}/?frame=object`);
    if (FetchRequest.isResponseSuccess(serverObject)) {
      return {
        redirect: {
          destination: serverObject["@id"],
          permanent: false,
        },
      };
    }
  }

  // Either the user didn't specify an `id={identifier}` query parameter or the data provider
  // returned an error. Either way, render this page with an error message.
  return {
    props: {
      id: query.id || "",
    },
  };
}

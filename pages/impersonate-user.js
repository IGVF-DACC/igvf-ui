// node_modules
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useContext, useState } from "react";
// components
import useDebounceTimer from "../components/debounce-timer";
import { Button } from "../components/form-elements";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
import SessionContext from "../components/session-context";
import { TextField } from "../components/form-elements";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest, { HTTP_STATUS_CODE } from "../lib/fetch-request";
import { encodeUriElement } from "../lib/query-encoding";

/**
 * Send a request to the data provider to impersonate the user with the given @id.
 * @param {string} userId @id of the user to impersonate
 * @param {object} session Session object from SessionContext
 * @returns
 */
async function requestImpersonateUser(userId, session) {
  const request = new FetchRequest({ session });
  return request.postObject("/impersonate-user", { user: userId });
}

/**
 * Extract the ID from a path, where the ID falls between the second and trailing slashes. This
 * presumes a path in the form /path/id/. Paths with more or fewer slashes return an empty string.
 * @param {string} path Path to extract the ID from
 * @returns {string} ID extracted from the path
 */
function idFromPath(path) {
  const match = path.match(/\/\S+\/(\S+)\//);
  return match ? match[1] : "";
}

/**
 * Displays the /impersonate-user page, showing a list of all users in the system and a text field
 * to filter the list. Clicking on a user in the list sends a request to the data provider to
 * impersonate the user, then redirects to the home page. This doesn't have anything to do with
 * Auth0 which still only knows that *you* have logged in. This only involves the data provider
 * giving you the same permissions as the person you impersonate.
 */
export default function ImpersonateUser({ searchResults }) {
  const { session } = useContext(SessionContext);
  const router = useRouter();

  // If the search results have "searchTerm" in its query string, use that to initialize the user
  // filter.
  const searchTermFilter = searchResults.filters.find(
    (filter) => filter.field === "query"
  );
  const searchTerm = searchTermFilter?.term || "";

  // Text to filter the search results by
  const [textFilter, setTextFilter] = useState(searchTerm);
  // Debounce the text filter to avoid sending too many requests to the data provider.
  const restartDebounceTimer = useDebounceTimer(500);

  // Called when the user clicks on a user in the list. Sends a request to the data provider to
  // impersonate the user, then redirect to the home page.
  function handleUserClick(userId) {
    requestImpersonateUser(userId, session).then(() => {
      window.location.href = "/";
    });
  }

  // Called when the user types in the text filter. Updates the text filter state and sends a
  // request to the data provider to update the search results. The request is debounced to avoid
  // overwhelming the data provider with requests.
  function textFilterHandler(e) {
    setTextFilter(e.target.value);
    restartDebounceTimer(() => {
      const filter = e.target.value
        ? `?filter=${encodeUriElement(e.target.value)}`
        : "";
      router.replace(`${router.pathname}${filter}`);
    });
  }

  return (
    <>
      <PagePreamble />
      <>
        <div className="@container">
          <div className="@lg:w-72">
            <TextField
              label="Filter Users"
              name="filter-users"
              value={textFilter}
              isSpellCheckDisabled
              onChange={textFilterHandler}
            />
          </div>
          <ul
            data-testid="search-list"
            className="grid gap-1 @lg:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-4 @7xl:grid-cols-5"
          >
            {searchResults["@graph"].map((item) => {
              const labAddendum = item.lab
                ? `, ${idFromPath(item.lab)} lab`
                : "";
              return (
                <li key={item["@id"]} className="w-full">
                  <Button
                    key={item["@id"]}
                    label={`Impersonate ${item.title}${labAddendum}`}
                    size="sm"
                    onClick={() => handleUserClick(item["@id"])}
                    className="block h-full w-full flex-wrap pb-1 text-left"
                  >
                    <div className="w-full text-base">{item.title}</div>
                    {item.lab && (
                      <div className="w-full text-xs text-gray-300">
                        {idFromPath(item.lab)}
                      </div>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </>
      {searchResults.total === 0 && <NoCollectionData pageTitle="users" />}
    </>
  );
}

ImpersonateUser.propTypes = {
  // /search results from igvfd
  searchResults: PropTypes.object.isRequired,
};

export async function getServerSideProps({ req, res, query }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });

  // Get session-properties to see if the user is an admin.
  const sessionProperties = (
    await request.getObject("/session-properties")
  ).union();
  if (!FetchRequest.isResponseSuccess(sessionProperties)) {
    return errorObjectToProps(sessionProperties);
  }

  // Only admins can see this page. Others get a 403.
  if (sessionProperties.admin !== true) {
    res.statusCode = HTTP_STATUS_CODE.FORBIDDEN;
    res.end();
    return { props: {} };
  }

  // Request a specific number of users beyond all reason to ensure we get all of them. Do this
  // instead of `limit=all` because sorting only works with a specific limit.
  const filter = query.filter ? `&query=${query.filter}` : "";
  const searchResults = (
    await request.getObject(
      `/search?type=User&field=lab&field=title&field=@id&sort=title&limit=10000${filter}`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(searchResults)) {
    return {
      props: {
        searchResults,
        pageContext: { title: "Impersonate User" },
      },
    };
  }
  return errorObjectToProps(searchResults);
}

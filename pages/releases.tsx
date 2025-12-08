// node_modules
import { useRouter } from "next/router";
// components
import { DataPanel } from "../components/data-area";
import PagePreamble from "../components/page-preamble";
import Pager from "../components/pager";
// lib
import { getCachedDataFetch } from "../lib/cache";
import { formatLongDate, stringToDate } from "../lib/dates";
import FetchRequest from "../lib/fetch-request";
import {
  extractReleasePrTitles,
  getReleasePageCount,
  getReleaseDateRange,
  type GitHubRelease,
} from "../lib/github";

/**
 * Number of items to display per page in the release history.
 */
const ITEMS_PER_PAGE = 10;

/**
 * Time-to-live (TTL) for cached release data, in seconds.
 */
const RELEASE_DATA_CACHE_TTL = 3600; // 1 hour

/**
 * Data structure for the cached release data including the list of releases and total page count
 * with `ITEMS_PER_PAGE` items per page.
 *
 * @property releases - List of GitHub releases
 * @property totalPageCount - Total number of pages available with `ITEMS_PER_PAGE` items per page
 */
type ReleaseData = {
  releases: GitHubRelease[];
  totalPageCount: number;
};

/**
 * Displays the formatted earliest and latest release dates from the given list of releases in a
 * rectangle.
 *
 * @param releases - List of GitHub releases to determine date range from
 */
function DateRange({ releases }: { releases: GitHubRelease[] }) {
  const dateRange = getReleaseDateRange(releases);

  if (!dateRange) {
    return null;
  }

  const { earliestDate, latestDate } = dateRange;

  return (
    <div
      data-testid="release-date-range"
      className="border-panel border-t border-r border-l bg-gray-300 py-1 text-center text-xs dark:bg-gray-700"
    >
      {formatLongDate(earliestDate)} to {formatLongDate(latestDate)}
    </div>
  );
}

/**
 * Displays the pager for the release history pages. When the user selects a page, the page=
 * parameter in the URL query string gets updated to reflect the new page.
 *
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages available
 */
function ReleasePager({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();

  // Called when the user clicks a page number in the pager. Updates the URL query string to reflect
  // the selected page.
  function onPagerClick(newPageNumber: number) {
    if (newPageNumber === 1) {
      router.push({ query: {} });
    } else {
      const updatedQuery = { ...router.query, page: newPageNumber.toString() };
      router.push({ query: updatedQuery });
    }
  }

  return (
    <>
      {totalPages > 1 && (
        <div className="border-panel flex justify-center border-t border-r border-l bg-gray-100 py-0.5 dark:bg-gray-900">
          <Pager
            currentPage={currentPage}
            totalPages={totalPages}
            onClick={onPagerClick}
          />
        </div>
      )}
    </>
  );
}

/**
 * Display a single release entry in the release history.
 *
 * @param release - GitHub release to display
 */
function SingleRelease({ release }: { release: GitHubRelease }) {
  const createdAsDate = stringToDate(release.published_at);
  const prTitles = extractReleasePrTitles(release.body);

  return (
    <div className="my-6 flex flex-col gap-2 first:mt-0 last:mb-0">
      <div>
        <h2 className="text-xl font-bold">
          <a href={release.html_url} target="_blank" rel="noopener noreferrer">
            {release.tag_name}
          </a>
        </h2>
        <div className="text-xs text-gray-600">
          {formatLongDate(createdAsDate)}
        </div>
      </div>
      {prTitles.length > 0 ? (
        <ul className="list-outside list-disc pl-5">
          {prTitles.map((title, index) => {
            const match = title.match(/^(IGVF-\d+)\s*(.*)$/);
            if (match) {
              return (
                <li key={index}>
                  <span className="font-mono">{match[1]}</span> {match[2]}
                </li>
              );
            }
            return <li key={index}>{title}</li>;
          })}
        </ul>
      ) : (
        <div>
          <i>See linked release for complete list of changes</i>
        </div>
      )}
    </div>
  );
}

/**
 * Main page component for displaying the UI release history.
 *
 * @param releases - List of GitHub releases to display
 * @param currentPage - Current page number (1-based)
 * @param totalPageCount - Total number of pages available
 */
export default function Releases({
  releases,
  currentPage,
  totalPageCount,
}: {
  releases: GitHubRelease[];
  currentPage: number;
  totalPageCount: number;
}) {
  return (
    <>
      <PagePreamble />
      <DateRange releases={releases} />
      <ReleasePager currentPage={currentPage} totalPages={totalPageCount} />
      <DataPanel>
        {releases.map((release) => (
          <SingleRelease key={release.id} release={release} />
        ))}
      </DataPanel>
    </>
  );
}

async function fetchReleases(
  page: number,
  request: FetchRequest
): Promise<ReleaseData> {
  let responseHeaders: Headers | undefined;

  // Fetch one ten-item list of releases for the given page. Also receive the response headers to
  // determine pagination.
  const response = (
    await request.getObjectByUrl(
      `https://api.github.com/repos/IGVF-DACC/igvf-ui/releases?per_page=${ITEMS_PER_PAGE}&page=${page}`,
      "application/vnd.github.v3+json",
      "igvf-ui (https://github.com/IGVF-DACC/igvf-ui)",
      (onHeaders) => {
        responseHeaders = onHeaders;
      }
    )
  ).optional();
  const releases = response as unknown as GitHubRelease[] | [];

  // Determine the total number of pages of releases from the `Link` header if it exists.
  let totalPageCount = 1;
  if (responseHeaders) {
    const linkHeader = responseHeaders.get("Link");
    if (linkHeader) {
      totalPageCount = getReleasePageCount(linkHeader, page);
    }
  }

  return { releases, totalPageCount } satisfies ReleaseData;
}

/**
 * Fetches the release history from the GitHub API and provides it as props to the Releases page.
 *
 * @param query - Query-string parameters from the request
 * @returns Props for the Releases page
 */
export async function getServerSideProps({
  query,
}: {
  query: { page?: string | string[] };
}) {
  // Get the page number from the query string, defaulting to 1. If the query string has multiple
  // page parameters use only the first one. If the page parameter is not a natural number, default
  // to page 1.
  const pageParam = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsedPageNumber = pageParam ? parseInt(pageParam, 10) : 1;
  const currentPage =
    Number.isNaN(parsedPageNumber) || parsedPageNumber < 1
      ? 1
      : parsedPageNumber;

  // Get one ten-item list of releases for the given page. Also receive the response headers to
  // determine pagination.
  const request = new FetchRequest();
  const releaseData = await getCachedDataFetch<ReleaseData>(
    "release-data",
    async () => fetchReleases(currentPage, request),
    RELEASE_DATA_CACHE_TTL,
    `page-${currentPage}`
  );

  // Issue a 404 for any error in retrieving the release history from GitHub.
  if (
    releaseData === null ||
    !Array.isArray(releaseData.releases) ||
    releaseData.releases.length === 0
  ) {
    return { notFound: true };
  }

  return {
    props: {
      releases: releaseData.releases,
      currentPage,
      totalPageCount: releaseData.totalPageCount,
      pageContext: {
        title: "User Interface Software Releases",
      },
    },
  };
}

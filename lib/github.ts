// lib
import { stringToDate } from "../lib/dates";

/**
 * GitHub Release Author object from the GitHub API.
 */
export type GitHubReleaseAuthor = {
  login: string;
  avatar_url: string;
  html_url: string;
};

/**
 * GitHub Release Asset object from the GitHub API.
 */
export type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
};

/**
 * GitHub Release object from the GitHub API. I'll leave documentation to GitHub.
 * https://docs.github.com/en/rest/releases/releases
 */
export type GitHubRelease = {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  html_url: string;
  author: GitHubReleaseAuthor;
  assets: GitHubReleaseAsset[];
};

/**
 * Extracts PR titles from the body of a GitHub release object. Only PR titles that start with
 * "IGVF-" are included.
 *
 * @param body Text body of a GitHub release object
 * @returns PR titles extracted from the release body
 */
export function extractReleasePrTitles(body: string): string[] {
  // Extract each PR title from the release body.
  const prTitlePattern = /^(?:\* )?(.+)/gm;
  const matches = Array.from(body.matchAll(prTitlePattern));

  // Filter for IGVF- titles first, then remove the PR credit and remove hyphens immediately after
  // the ticket number if it exists.
  return matches
    .map((match) => match[1].trim())
    .filter((title) => title.startsWith("IGVF-"))
    .map((title) => title.replace(/\s+by @\S+ in https?:\/\/\S+$/, ""))
    .map((title) => title.replace(/^IGVF-(\d+)-/, "IGVF-$1 "));
}

/**
 * All possible link elements in a GitHub Link header.
 */
type LinkElement = "first" | "last" | "prev" | "next";

/**
 * Map of link elements to their corresponding page numbers. Any of the elements might or might not
 * exist, so you could have between one and four entries in the map.
 */
type LinkElementMap = Record<LinkElement, number>;

/**
 * Parse the contents of the GitHub Link header to extract the page numbers for each link element
 * e.g. on page 3 you might see:
 * ```
 * {
 *   first: 1,
 *   prev: 2,
 *   next: 4,
 *   last: 5
 * }
 * ```
 *
 * @param linkHeader - Link header that typically includes, first, last, prev, and next elements
 * @returns Map of element types to page numbers
 */
function parseLinkHeader(linkHeader: string): LinkElementMap {
  const elementMap: LinkElementMap = {} as LinkElementMap;

  // Split the header into individual link parts.
  const links = linkHeader.split(",").map((part) => part.trim());

  // Process each link part to extract the URL and rel type.
  links.forEach((link) => {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const url = match[1];
      const rel = match[2] as LinkElement;

      // Extract the page number from the URL's query parameters.
      try {
        const urlObj = new URL(url);
        const pageParam = urlObj.searchParams.get("page");
        if (pageParam) {
          elementMap[rel] = parseInt(pageParam, 10);
        }
      } catch {
        // Ignore malformed URLs.
      }
    }
  });

  return elementMap;
}

/**
 * Determine the number of pages of releases for pagination. The request this header comes from
 * should specify a `per_page` parameter to indicate how many releases are included per page.
 *
 * Example `Link` header:
 * `<https://api.github.com/repositories/123456/releases?per_page=10&page=2>; rel="next",
 *  <https://api.github.com/repositories/123456/releases?per_page=10&page=5>; rel="last"`
 *
 * @param linkHeader - `Link` property from GitHub response header
 * @param currentPage - Page number of the currently viewed page
 * @returns Number of pages indicated by the `Link` header
 */
export function getReleasePageCount(
  linkHeader: string | null,
  currentPage: number
): number {
  let pageCount = currentPage;

  // Handle null or empty link header.
  if (linkHeader) {
    // Parse the link header to get the map of elements, e.g. first, last, prev, next.
    const elementMap = parseLinkHeader(linkHeader);

    // If there's a "last" element, use its page number as the total page count.
    if (elementMap.last) {
      pageCount = elementMap.last;
    } else {
      // If there's no "last" element, we might be on the last page already. Determine the page count
      // based on the presence of a "prev" element. If we don't have that either, we're on the only
      // page.
      if (elementMap.prev) {
        pageCount = elementMap.prev + 1;
      } else {
        // No last or prev means we're on the only page.
        pageCount = currentPage;
      }
    }
  }

  return pageCount;
}

/**
 * Determine the earliest and latest release dates from the given list of releases.
 *
 * @param releases - List of GitHub releases to determine date range from
 * @returns Object containing the earliest and latest release dates, or null if the releases array is empty
 */
export function getReleaseDateRange(releases: GitHubRelease[]): {
  earliestDate: Date;
  latestDate: Date;
} | null {
  // Handle empty array case.
  if (releases.length > 0) {
    // Extract all the release dates as Date objects.
    const releaseDates = releases.map((release) =>
      stringToDate(release.published_at)
    );

    // Go through the dates to find the earliest and latest dates.
    const { earliestDate, latestDate } = releaseDates.reduce(
      (acc, currentDate) => {
        if (currentDate < acc.earliestDate) {
          acc.earliestDate = currentDate;
        }
        if (currentDate > acc.latestDate) {
          acc.latestDate = currentDate;
        }
        return acc;
      },
      {
        earliestDate: releaseDates[0],
        latestDate: releaseDates[0],
      }
    );

    return { earliestDate, latestDate };
  }
  return null;
}

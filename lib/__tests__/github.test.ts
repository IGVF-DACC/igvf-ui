import {
  extractReleasePrTitles,
  getReleasePageCount,
  getReleaseDateRange,
  GitHubRelease,
} from "../github";

describe("extractReleasePrTitles", () => {
  it("extracts IGVF PR titles from release body", () => {
    const body = `## What's Changed
* IGVF-1234 Add new feature by @username in https://github.com/org/repo/pull/1
* IGVF-5678 Fix bug by @user2 in https://github.com/org/repo/pull/2
* Some other change by @user3 in https://github.com/org/repo/pull/3

**Full Changelog**: https://github.com/org/repo/compare/v1.0.0...v2.0.0`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual(["IGVF-1234 Add new feature", "IGVF-5678 Fix bug"]);
  });

  it("removes hyphen after ticket number", () => {
    const body = `* IGVF-1234-Add new feature by @user in https://github.com/org/repo/pull/1
* IGVF-5678-Fix-another-thing by @user in https://github.com/org/repo/pull/2`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual([
      "IGVF-1234 Add new feature",
      "IGVF-5678 Fix-another-thing",
    ]);
  });

  it("filters out non-IGVF titles", () => {
    const body = `* IGVF-1234 Important change by @user in https://github.com/org/repo/pull/1
* Update dependencies by @user in https://github.com/org/repo/pull/2
* Fix typo by @user in https://github.com/org/repo/pull/3
* IGVF-5678 Another change by @user in https://github.com/org/repo/pull/4`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual([
      "IGVF-1234 Important change",
      "IGVF-5678 Another change",
    ]);
  });

  it("handles titles without PR credits", () => {
    const body = `* IGVF-1234 Add feature
* IGVF-5678 Fix bug`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual(["IGVF-1234 Add feature", "IGVF-5678 Fix bug"]);
  });

  it("handles titles with extra whitespace", () => {
    const body = `*   IGVF-1234   Some feature   by @user in https://github.com/org/repo/pull/1
*  IGVF-5678 Another feature  by @user in https://github.com/org/repo/pull/2`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual([
      "IGVF-1234   Some feature",
      "IGVF-5678 Another feature",
    ]);
  });

  it("returns empty array when no IGVF titles found", () => {
    const body = `* Update README by @user in https://github.com/org/repo/pull/1
* Bump version by @user in https://github.com/org/repo/pull/2`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual([]);
  });

  it("returns empty array for empty body", () => {
    const result = extractReleasePrTitles("");

    expect(result).toEqual([]);
  });

  it("ignores asterisks not at line start", () => {
    const body = `* IGVF-1234 Feature with * asterisk in title by @user in https://github.com/org/repo/pull/1
Some text * IGVF-5678 Not a list item`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual(["IGVF-1234 Feature with * asterisk in title"]);
  });

  it("handles multiline release body with mixed content", () => {
    const body = `## What's Changed

* IGVF-1234-Add authentication by @dev1 in https://github.com/org/repo/pull/10
* Update docs by @dev2 in https://github.com/org/repo/pull/11
* IGVF-5678 Improve performance by @dev3 in https://github.com/org/repo/pull/12

## New Contributors
* @dev1 made their first contribution

**Full Changelog**: https://github.com/org/repo/compare/v1...v2`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual([
      "IGVF-1234 Add authentication",
      "IGVF-5678 Improve performance",
    ]);
  });

  it("preserves hyphens that are not immediately after ticket number", () => {
    const body = `* IGVF-1234 Add long-term feature by @user in https://github.com/org/repo/pull/1
* IGVF-5678-Fix low-level bug by @user in https://github.com/org/repo/pull/2`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual([
      "IGVF-1234 Add long-term feature",
      "IGVF-5678 Fix low-level bug",
    ]);
  });

  it("handles HTTP and HTTPS URLs in credits", () => {
    const body = `* IGVF-1234 Feature by @user in http://github.com/org/repo/pull/1
* IGVF-5678 Another by @user in https://github.com/org/repo/pull/2`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual(["IGVF-1234 Feature", "IGVF-5678 Another"]);
  });

  it("handles lines without asterisks", () => {
    const body = `IGVF-1234 Feature without asterisk
* IGVF-5678 Feature with asterisk by @user in https://github.com/org/repo/pull/1
IGVF-9999 Another without asterisk`;

    const result = extractReleasePrTitles(body);

    expect(result).toEqual([
      "IGVF-1234 Feature without asterisk",
      "IGVF-5678 Feature with asterisk",
      "IGVF-9999 Another without asterisk",
    ]);
  });
});

describe("getReleasePageCount", () => {
  it("extracts page count from Link header with last rel", () => {
    const linkHeader =
      '<https://api.github.com/repositories/123456/releases?per_page=10&page=2>; rel="next", <https://api.github.com/repositories/123456/releases?per_page=10&page=5>; rel="last"';

    const result = getReleasePageCount(linkHeader, 1);

    expect(result).toBe(5);
  });

  it("returns 1 when Link header is null", () => {
    const result = getReleasePageCount(null, 1);

    expect(result).toBe(1);
  });

  it("returns 1 when Link header has no last rel", () => {
    const linkHeader =
      '<https://api.github.com/repositories/123456/releases?per_page=10&page=2>; rel="next"';

    const result = getReleasePageCount(linkHeader, 1);

    expect(result).toBe(1);
  });

  it("returns 1 when Link header is empty string", () => {
    const result = getReleasePageCount("", 1);

    expect(result).toBe(1);
  });

  it("handles Link header with only last rel", () => {
    const linkHeader =
      '<https://api.github.com/repositories/123456/releases?per_page=10&page=3>; rel="last"';

    const result = getReleasePageCount(linkHeader, 1);

    expect(result).toBe(3);
  });

  it("handles Link header with multiple rels", () => {
    const linkHeader =
      '<https://api.github.com/repositories/123456/releases?per_page=10&page=1>; rel="first", <https://api.github.com/repositories/123456/releases?per_page=10&page=2>; rel="prev", <https://api.github.com/repositories/123456/releases?per_page=10&page=4>; rel="next", <https://api.github.com/repositories/123456/releases?per_page=10&page=10>; rel="last"';

    const result = getReleasePageCount(linkHeader, 1);

    expect(result).toBe(10);
  });

  it("returns 1 when last rel URL has no page parameter", () => {
    const linkHeader =
      '<https://api.github.com/repositories/123456/releases>; rel="last"';

    const result = getReleasePageCount(linkHeader, 1);

    expect(result).toBe(1);
  });

  it("returns 1 when last rel has malformed URL", () => {
    const linkHeader = 'not a valid url; rel="last"';

    const result = getReleasePageCount(linkHeader, 1);

    expect(result).toBe(1);
  });

  it("returns currentPage when Link header has no last or prev rel", () => {
    const linkHeader =
      '<https://api.github.com/repositories/123456/releases?per_page=10&page=2>; rel="next"';

    const result = getReleasePageCount(linkHeader, 5);

    expect(result).toBe(5);
  });

  it("calculates page count from prev rel when no last rel present", () => {
    const linkHeader =
      '<https://api.github.com/repositories/123456/releases?per_page=10&page=1>; rel="first", <https://api.github.com/repositories/123456/releases?per_page=10&page=2>; rel="prev", <https://api.github.com/repositories/123456/releases?per_page=10&page=4>; rel="next"';

    const result = getReleasePageCount(linkHeader, 3);

    expect(result).toBe(3); // prev is 2, so 2 + 1 = 3
  });
});

describe("getReleaseDateRange", () => {
  function createMockRelease(id: number, publishedAt: string): GitHubRelease {
    return {
      id,
      tag_name: `v${id}.0.0`,
      name: `Release ${id}`,
      body: "Release notes",
      draft: false,
      prerelease: false,
      created_at: publishedAt,
      published_at: publishedAt,
      html_url: `https://github.com/org/repo/releases/tag/v${id}.0.0`,
      author: {
        login: "testuser",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        html_url: "https://github.com/testuser",
      },
      assets: [],
    };
  }

  it("finds earliest and latest dates from multiple releases", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2024-03-15T10:00:00Z"),
      createMockRelease(2, "2024-06-20T14:30:00Z"),
      createMockRelease(3, "2024-01-10T08:15:00Z"),
      createMockRelease(4, "2024-09-05T16:45:00Z"),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2024-01-10");
    expect(result.latestDate.toISOString()).toContain("2024-09-05");
  });

  it("handles single release", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2024-05-15T12:00:00Z"),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2024-05-15");
    expect(result.latestDate.toISOString()).toContain("2024-05-15");
  });

  it("handles releases in chronological order", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2024-01-01T00:00:00Z"),
      createMockRelease(2, "2024-02-01T00:00:00Z"),
      createMockRelease(3, "2024-03-01T00:00:00Z"),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2024-01-01");
    expect(result.latestDate.toISOString()).toContain("2024-03-01");
  });

  it("handles releases in reverse chronological order", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2024-12-31T23:59:59Z"),
      createMockRelease(2, "2024-06-15T12:00:00Z"),
      createMockRelease(3, "2024-01-01T00:00:00Z"),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2024-01-01");
    expect(result.latestDate.toISOString()).toContain("2024-12-31");
  });

  it("handles releases with same date", () => {
    const sameDate = "2024-07-20T10:00:00Z";
    const releases: GitHubRelease[] = [
      createMockRelease(1, sameDate),
      createMockRelease(2, sameDate),
      createMockRelease(3, sameDate),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2024-07-20");
    expect(result.latestDate.toISOString()).toContain("2024-07-20");
  });

  it("handles two releases", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2024-12-01T00:00:00Z"),
      createMockRelease(2, "2024-01-01T00:00:00Z"),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2024-01-01");
    expect(result.latestDate.toISOString()).toContain("2024-12-01");
  });

  it("handles releases spanning multiple years", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2023-12-31T23:59:59Z"),
      createMockRelease(2, "2024-06-15T12:00:00Z"),
      createMockRelease(3, "2025-01-01T00:00:00Z"),
      createMockRelease(4, "2022-01-01T00:00:00Z"),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2022-01-01");
    expect(result.latestDate.toISOString()).toContain("2025-01-01");
  });

  it("handles releases with different times on same date", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2024-05-15T12:30:45.123Z"),
      createMockRelease(2, "2024-05-15T14:30:45.456Z"),
      createMockRelease(3, "2024-05-15T16:30:45.789Z"),
    ];

    const result = getReleaseDateRange(releases);

    // All have the same date (time is stripped by stringToDate)
    expect(result.earliestDate.toISOString()).toContain("2024-05-15");
    expect(result.latestDate.toISOString()).toContain("2024-05-15");
  });

  it("handles releases on different dates close in time", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2024-08-20T23:59:59Z"),
      createMockRelease(2, "2024-08-21T00:00:00Z"),
      createMockRelease(3, "2024-08-22T00:00:01Z"),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2024-08-20");
    expect(result.latestDate.toISOString()).toContain("2024-08-22");
  });

  it("correctly compares dates when time portion is stripped", () => {
    const releases: GitHubRelease[] = [
      createMockRelease(1, "2024-03-15T23:59:59Z"),
      createMockRelease(2, "2024-03-16T00:00:00Z"),
      createMockRelease(3, "2024-03-14T12:00:00Z"),
    ];

    const result = getReleaseDateRange(releases);

    expect(result.earliestDate.toISOString()).toContain("2024-03-14");
    expect(result.latestDate.toISOString()).toContain("2024-03-16");
  });

  it("returns null for empty releases array", () => {
    const releases: GitHubRelease[] = [];

    const result = getReleaseDateRange(releases);

    expect(result).toBeNull();
  });
});

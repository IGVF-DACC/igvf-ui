// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import NoContent from "../components/no-content";
// lib
import { UI_VERSION } from "../lib/constants";
import errorObjectToProps from "../lib/errors";
import FetchRequest from "../lib/fetch-request";

/**
 * Display the help-page title within the help banner.
 */
function HelpBannerTitle({ title = "" }) {
  if (title) {
    return (
      <h1 className="text-xl font-light text-black dark:text-white sm:text-3xl md:text-4xl xl:text-5xl">
        {title}
      </h1>
    );
  }
  return null;
}

HelpBannerTitle.propTypes = {
  // Title of the help page
  title: PropTypes.string,
};

/**
 * Display the igvf-ui and igvfd version numbers.
 */
function Versions({ serverVersion = "" }) {
  if (UI_VERSION || serverVersion) {
    return (
      <div className="text-xs leading-tight text-gray-600 dark:text-gray-400">
        {UI_VERSION && <div data-testid="version-ui">UI: {UI_VERSION}</div>}
        {serverVersion && (
          <div data-testid="version-server">Server: {serverVersion}</div>
        )}
      </div>
    );
  }
  return null;
}

Versions.propTypes = {
  // Server version number
  serverVersion: PropTypes.string,
};

/**
 * Display the help-page banner and its contents.
 */
function HelpBanner({ children }) {
  return (
    <div className="flex aspect-ultra w-full flex-col justify-between border border-panel bg-help-banner bg-cover pb-1 pl-2 pt-2 dark:bg-help-banner-dark">
      {children}
    </div>
  );
}

/**
 * Displays links to the given help subpages. This is mutually recursive with the
 * <HelpPageIndividual> component.
 */
function HelpSubpages({ subpages }) {
  return (
    <ul className="pl-4">
      {subpages.map((subpage) => (
        <HelpPageIndividual key={subpage["@id"]} page={subpage} />
      ))}
    </ul>
  );
}

HelpSubpages.propTypes = {
  // Subpages to display in the list
  subpages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Displays one link to a help page, as well as all of its sub-pages. This is mutually recursive
 * with the <HelpSubpages> component to allow multiple levels of nesting.
 */
function HelpPageIndividual({ page }) {
  // Determine the level of the help subpage by trimming the leading and trailing slashes
  // from the subpage's path and gettings the individual path elements.
  const trimmedPath = page["@id"].replace(/^\//, "").replace(/\/$/, "");
  const pathElements = trimmedPath.split("/");

  // Category pages have two elements in their paths: "help" and the category name.
  const isCategoryPage = pathElements.length === 2;

  return (
    <li className="my-2">
      <Link
        href={page["@id"]}
        className={`block${
          isCategoryPage ? " mb-2 text-2xl font-medium text-blue-600" : ""
        }`}
      >
        {page.title}
      </Link>
      {page.subpages?.length > 0 && <HelpSubpages subpages={page.subpages} />}
    </li>
  );
}

HelpPageIndividual.propTypes = {
  // Help page to display as a link
  page: PropTypes.object.isRequired,
};

/**
 * Displays the help category link and all of the category's sub-pages.
 */
function HelpPageCategory({ categoryPage }) {
  return (
    <div className="mb-8 shrink-0 grow md:basis-1/2 xl:basis-1/3">
      <h2 className="mb-4 text-xl font-medium text-brand">
        <Link href={categoryPage["@id"]}>{categoryPage.title}</Link>
      </h2>
      {categoryPage.subpages?.length > 0 && (
        <HelpSubpages subpages={categoryPage.subpages} />
      )}
    </div>
  );
}

HelpPageCategory.propTypes = {
  // Help page category to display
  categoryPage: PropTypes.object.isRequired,
};

/**
 * Displays the entire help page, including links to all of the help content pages.
 */
export default function HelpPage({ helpPageRoot, serverVersion = "" }) {
  if (helpPageRoot?.subpages?.length > 0) {
    return (
      <>
        <HelpBanner>
          <HelpBannerTitle title={helpPageRoot.title} />
          <Versions serverVersion={serverVersion} />
        </HelpBanner>
        <div className="mt-8 md:flex md:flex-wrap">
          {helpPageRoot.subpages.map((categoryPage) => (
            <HelpPageCategory
              key={categoryPage["@id"]}
              categoryPage={categoryPage}
            />
          ))}
        </div>
      </>
    );
  }
  return <NoContent message="No help pages" />;
}

HelpPage.propTypes = {
  // Root-level help page
  helpPageRoot: PropTypes.object.isRequired,
  // Server version number
  serverVersion: PropTypes.string,
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const pages = await request.getCollection("pages");
  if (FetchRequest.isResponseSuccess(pages)) {
    // Get the server version number.
    const root = await request.getObject("/", null);
    const serverVersion = root?.app_version || "";

    // Get all help pages and their subpages.
    let helpPageRoot = null;
    const allHelpPages = pages["@graph"].filter((page) =>
      page["@id"].startsWith("/help/")
    );

    // Build the help-page hierarchy.
    allHelpPages.forEach((helpPage) => {
      // Look for all help pages that are subpages of the current page.
      const subpages = allHelpPages.filter((maybeChildPage) => {
        return maybeChildPage.parent === helpPage["@id"];
      });

      // Mutate current page object to include subpages.
      if (subpages.length > 0) {
        helpPage.subpages = subpages;
      }

      // Note if the current page is the root of all help pages.
      if (helpPage["@id"] === "/help/") {
        helpPageRoot = helpPage;
      }
    });

    // Only return the root help page because it has category pages in its `subpages`, and the
    // category page objects have all their subpages linked as well.
    return {
      props: {
        helpPageRoot,
        serverVersion,
        pageContext: { title: helpPageRoot?.title },
      },
    };
  }
  return errorObjectToProps(pages);
}

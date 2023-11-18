// node_modules
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Icon from "../components/icon";
import NoContent from "../components/no-content";
// lib
import { UI_VERSION } from "../lib/constants";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { toShishkebabCase } from "../lib/general";
import { getPageTitleAndOrdering } from "../lib/page";

/**
 * Display the igvf-ui and igvfd version numbers.
 */
function Versions({ serverVersion = "" }) {
  const versions = [];
  if (UI_VERSION) {
    versions.push(
      <div key="ui" data-testid="version-ui">{`UI:${UI_VERSION}`}</div>
    );
  }
  if (serverVersion) {
    versions.push(
      <div
        key="server"
        data-testid="version-server"
      >{`Server:${serverVersion}`}</div>
    );
  }

  if (versions.length > 0) {
    return (
      <div className="flex gap-2 text-xs font-semibold text-brand">
        {versions}
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
 * Display email and Twitter links.
 */
function Social() {
  return (
    <div className="flex items-center gap-2">
      <a
        className="block"
        href="mailto:igvf-portal-help@lists.stanford.edu"
        target="_blank"
        rel="noreferrer"
        aria-label="Email the IGVF help desk"
      >
        <EnvelopeIcon className="h-6 w-6 fill-brand" />
      </a>
      <a
        className="block"
        href="https://twitter.com/IGVFConsortium"
        target="_blank"
        rel="noreferrer"
        aria-label="IGVF on Twitter"
      >
        <Icon.Twitter className="h-6 w-6" />
      </a>
    </div>
  );
}

/**
 * Wrap the version and social links line at the top of the help page.
 */
function Information({ children }) {
  return (
    <section className="flex items-center justify-end gap-2">
      {children}
    </section>
  );
}

/**
 * Display the help-page title within the help banner.
 */
function Title({ helpPageRoot }) {
  if (helpPageRoot.title) {
    return (
      <h1 className="tight my-4 text-center text-xl font-bold text-black dark:text-gray-300 sm:text-2xl md:my-10 md:text-3xl lg:text-4xl">
        {helpPageRoot.title}
      </h1>
    );
  }
  return null;
}

Title.propTypes = {
  // Data for the help page from the data provider
  helpPageRoot: PropTypes.shape({
    // Title of the help page from the /help page object
    title: PropTypes.string,
  }),
};

/**
 * Displays links to the given help subpages. This is mutually recursive with the
 * <PageLink> component.
 */
function Subpages({ subpages }) {
  const sortedSubpages = _.sortBy(subpages, (subpage) => {
    const { ordering } = getPageTitleAndOrdering(subpage);
    return ordering;
  });
  return (
    <ul className="pl-4">
      {sortedSubpages.map((subpage) => (
        <PageLink key={subpage["@id"]} page={subpage} />
      ))}
    </ul>
  );
}

Subpages.propTypes = {
  // Subpages to display in the list
  subpages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Displays one link to a help page, as well as all of its sub-pages. This is mutually recursive
 * with the <Subpages> component to allow multiple levels of nesting.
 */
function PageLink({ page }) {
  const { title } = getPageTitleAndOrdering(page);
  return (
    <li
      className="my-2 text-sm font-bold text-black dark:text-gray-300"
      data-testid={`subcategory-title-${toShishkebabCase(title)}`}
    >
      <Link href={page["@id"]} className="block">
        {title}
      </Link>
      {page.subpages?.length > 0 && <Subpages subpages={page.subpages} />}
    </li>
  );
}

PageLink.propTypes = {
  // Help page to display as a link
  page: PropTypes.object.isRequired,
};

/**
 * Displays the help category and links to all of the category's sub-pages.
 */
function Category({ categoryPage, children }) {
  const { title } = getPageTitleAndOrdering(categoryPage);
  return (
    <div data-testid={`category-title-${toShishkebabCase(title)}`}>
      <h2 className="mb-4 border border-panel bg-panel px-2 py-4 text-lg font-semibold text-brand">
        {title}
      </h2>
      {children}
    </div>
  );
}

Category.propTypes = {
  // Help page category to display
  categoryPage: PropTypes.object.isRequired,
};

/**
 * Show the main content of the help page: the help categories and links to the help pages beneath
 * each.
 */
function HelpLinks({ children }) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {children}
    </section>
  );
}

/**
 * Displays the entire help page, including links to all of the help content pages.
 */
export default function HelpPage({ helpPageRoot, serverVersion = "" }) {
  if (helpPageRoot?.subpages?.length > 0) {
    // Sort the subpages by their ordering number encoded in their titles. Pages without ordering
    // numbers get sorted at the end.
    const subpages = _.sortBy(helpPageRoot.subpages, (subpage) => {
      const { ordering } = getPageTitleAndOrdering(subpage);
      return ordering;
    });

    return (
      <>
        <Information>
          <Versions serverVersion={serverVersion} />
          <Social />
        </Information>
        <Title helpPageRoot={helpPageRoot} />
        <HelpLinks>
          {subpages.map((categoryPage) => (
            <Category key={categoryPage["@id"]} categoryPage={categoryPage}>
              {categoryPage.subpages?.length > 0 && (
                <Subpages subpages={categoryPage.subpages} />
              )}
            </Category>
          ))}
        </HelpLinks>
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
  const pages = (await request.getCollection("pages")).union();
  if (FetchRequest.isResponseSuccess(pages)) {
    // Get the server version number.
    const root = (await request.getObject("/")).optional();
    const serverVersion = root?.app_version || "";

    // Get all non-deleted help pages and their subpages.
    let helpPageRoot = null;
    const allHelpPages = pages["@graph"].filter(
      (page) => page["@id"].startsWith("/help/") && page.status !== "deleted"
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

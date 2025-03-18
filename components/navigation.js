// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars2Icon,
  MinusIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
import React, {
  Children,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "./animation";
import { useSessionStorage } from "./browser-storage";
import { Button } from "./form-elements";
import GlobalContext from "./global-context";
import Icon from "./icon";
import IdSearchTrigger from "./id-search-trigger";
import IndexerState from "./indexer-state";
import { CreativeCommons, Email, Twitter } from "./site-info";
import SiteLogo from "./logo";
import Modal from "./modal";
import { useBrowserStateQuery } from "./presentation-status";
import SessionContext from "./session-context";
import SiteSearchTrigger from "./site-search-trigger";
// lib
import { loginAuthProvider, logoutAuthProvider } from "../lib/authentication";
import { UC } from "../lib/constants";

/**
 * Icon for opening the sidebar navigation.
 */
function NavExpandIcon({ className = null, testid = "icon-nav-expand" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      stroke="currentColor"
      data-testid={testid}
    >
      <g className="fill-none stroke-nav-collapse stroke-1">
        <path
          d="M13.1,15.5H6.9c-1.3,0-2.4-1.1-2.4-2.4V6.9c0-1.3,1.1-2.4,2.4-2.4h6.2c1.3,0,2.4,1.1,2.4,2.4v6.2
	C15.5,14.4,14.4,15.5,13.1,15.5z"
        />
        <line x1="7.8" y1="4.5" x2="7.8" y2="15.5" />
        <polyline points="10.6,12.1 12.7,10 10.6,7.9" />
      </g>
    </svg>
  );
}

NavExpandIcon.propTypes = {
  // Optional Tailwind CSS class name to add to the svg element
  className: PropTypes.string,
  // Optional data-testid for the svg element
  testid: PropTypes.string,
};

/**
 * Icon for closing the sidebar navigation.
 */
function NavCollapseIcon({ className = null, testid = "icon-nav-collapse" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      stroke="currentColor"
      data-testid={testid}
    >
      <g className="fill-none stroke-nav-collapse stroke-1">
        <path
          d="M13.1,15.5H6.9c-1.3,0-2.4-1.1-2.4-2.4V6.9c0-1.3,1.1-2.4,2.4-2.4h6.2c1.3,0,2.4,1.1,2.4,2.4v6.2
	C15.5,14.4,14.4,15.5,13.1,15.5z"
        />
        <line x1="7.8" y1="4.5" x2="7.8" y2="15.5" />
        <polyline points="12.7,12.1 10.6,10 12.7,7.9" />
      </g>
    </svg>
  );
}

NavCollapseIcon.propTypes = {
  // Optional Tailwind CSS class name to add to the svg element
  className: PropTypes.string,
  // Optional data-testid for the svg element
  testid: PropTypes.string,
};

/**
 * Renders collapsable navigation items, both for the mobile menu and for collapsable children of
 * grouped navigation items.
 */
function MobileCollapsableArea({ isOpen, testid = "", children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-testid={testid}
          className="overflow-hidden md:hidden"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          transition={standardAnimationTransition}
          variants={standardAnimationVariants}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

MobileCollapsableArea.propTypes = {
  // True if the collapsable navigation area is visible.
  isOpen: PropTypes.bool.isRequired,
  // Optional data-testid for the motion div.
  testid: PropTypes.string,
};

/**
 * Wrapper for the navigation icons to add Tailwind CSS classes to the icon svg.
 */
function NavigationIcon({ isNarrowNav, children }) {
  const iconElement = Children.only(children);
  if (isValidElement(iconElement)) {
    return React.cloneElement(iconElement, {
      className: `${isNarrowNav ? "h-8 w-8" : "mr-1 h-4 w-4}"} ${
        iconElement.props.className || ""
      }`,
    });
  }
  return children;
}

NavigationIcon.propTypes = {
  // True if the navigation is in narrow mode
  isNarrowNav: PropTypes.bool,
};

/**
 * Generate the Tailwind CSS classes for a navigation item.
 * @param {boolean} isNarrowNav True if navigation is collapsed
 * @param {boolean} isChildItem True if this item is a child of another navigation item
 * @returns {string} Tailwind CSS classes for the navigation item
 */
function navigationClasses(isNarrowNav, isChildItem) {
  if (isNarrowNav) {
    // For the collapsed-navigation case.
    return "block h-8 w-8 text-black dark:text-gray-300";
  }

  // The expanded-navigation case.
  const childClasses = isChildItem
    ? "text-sm font-normal"
    : "text-base font-medium";
  return `flex w-full items-center rounded-full border border-transparent px-2 py-1 text-left text-white no-underline hover:bg-nav-highlight disabled:text-gray-500 md:text-black md:hover:border md:hover:border-nav-border md:hover:bg-nav-highlight md:dark:text-gray-200 ${childClasses}`;
}

/**
 * Renders navigation items containing links to pages.
 */
function NavigationLink({
  id,
  href,
  onClick,
  isNarrowNav = false,
  isChildItem = false,
  isExternal = false,
  children,
}) {
  // Helps determine if the link should reload the page or use NextJS navigation
  const { linkReload } = useContext(GlobalContext);
  const cssClasses = navigationClasses(isNarrowNav, isChildItem);

  if (linkReload.isEnabled || isExternal) {
    return (
      <a
        href={href}
        onClick={onClick}
        data-testid={`navigation-${id}`}
        className={cssClasses}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      data-testid={`navigation-${id}`}
      className={cssClasses}
    >
      {children}
    </Link>
  );
}

NavigationLink.propTypes = {
  // The id of the navigation item
  id: PropTypes.string.isRequired,
  // The URI for the navigation item
  href: PropTypes.string.isRequired,
  // The click handler for the navigation item; in addition to navigation
  onClick: PropTypes.func.isRequired,
  // True if the user has collapsed navigation
  isNarrowNav: PropTypes.bool,
  // True if this item is a child of another navigation item
  isChildItem: PropTypes.bool,
  // True if the link should open in a new tab
  isExternal: PropTypes.bool,
};

/**
 * Renders navigation buttons that perform actions.
 */
function NavigationButton({
  id,
  onClick,
  isNarrowNav = false,
  isChildItem = false,
  isDisabled = false,
  children,
}) {
  const cssClasses = navigationClasses(isNarrowNav, isChildItem);
  return (
    <button
      onClick={onClick}
      data-testid={`navigation-${id}`}
      disabled={isDisabled}
      className={cssClasses}
    >
      {children}
    </button>
  );
}

NavigationButton.propTypes = {
  // The id of the navigation item
  id: PropTypes.string.isRequired,
  // The click handler for the navigation item
  onClick: PropTypes.func.isRequired,
  // True if the user has collapsed navigation
  isNarrowNav: PropTypes.bool,
  // True if this item is a child of another navigation item
  isChildItem: PropTypes.bool,
  // True if button should appear disabled
  isDisabled: PropTypes.bool,
};

/**
 * NavigationExpanded item to handle the Sign In button.
 */
function NavigationSignInItem({ id, isNarrowNav = false, children }) {
  const { isLoading, loginWithRedirect } = useAuth0();

  return (
    <li>
      <NavigationButton
        id={id}
        onClick={() => {
          loginAuthProvider(loginWithRedirect);
        }}
        isNarrowNav={isNarrowNav}
        isDisabled={isLoading}
      >
        {children}
      </NavigationButton>
    </li>
  );
}

NavigationSignInItem.propTypes = {
  // ID of the authentication navigation item
  id: PropTypes.string.isRequired,
  // True if the navigation is in narrow mode
  isNarrowNav: PropTypes.bool,
};

/**
 * Navigation item to handle the Sign Out button. Display a model to allow the user to confirm or
 * cancel the sign out.
 */
function NavigationSignOutItem({
  id,
  isChildItem = false,
  isNarrowNav = false,
  className = null,
  children,
}) {
  // True if sign-out warning modal open
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const { sessionProperties } = useContext(SessionContext);
  const { logout } = useAuth0();

  /**
   * Called when the user clicks the Sign Out button. Log out of both the authentication provider
   * and the data provider.
   */
  function handleAuthClick() {
    logoutAuthProvider(logout);
  }

  return (
    <>
      <li className={className}>
        <NavigationButton
          id={id}
          onClick={() => setIsWarningOpen(true)}
          isNarrowNav={isNarrowNav}
          isChildItem={isChildItem}
        >
          {children}
        </NavigationButton>
      </li>

      <Modal isOpen={isWarningOpen} onClose={() => setIsWarningOpen(false)}>
        <Modal.Header
          onClose={() => setIsWarningOpen(false)}
          closeLabel="Cancel signing out"
        >
          <h2 className="text-lg font-semibold">
            Sign Out {sessionProperties?.user?.title || "User"}
          </h2>
        </Modal.Header>
        <Modal.Body>
          Once you sign out, you only see publicly released data.
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="secondary"
            onClick={() => setIsWarningOpen(false)}
            label="Cancel signing out"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAuthClick}
            label={`Sign out ${sessionProperties?.user?.title || "User"}`}
            id="sign-out-confirm"
          >
            Sign Out
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

NavigationSignOutItem.propTypes = {
  // ID of the authentication navigation item
  id: PropTypes.string.isRequired,
  // True if this item is a child of another navigation item
  isChildItem: PropTypes.bool,
  // True if the navigation is in wide mode
  isNarrowNav: PropTypes.bool,
  // Optional Tailwind CSS class name to add to the li element
  className: PropTypes.string,
};

/**
 * Renders a single navigation item that links to a URI.
 */
function NavigationHrefItem({
  id,
  href,
  navigationClick,
  isChildItem = false,
  isNarrowNav = false,
  isExternal = false,
  children,
}) {
  return (
    <li>
      <NavigationLink
        id={id}
        href={href}
        onClick={navigationClick}
        isNarrowNav={isNarrowNav}
        isChildItem={isChildItem}
        isExternal={isExternal}
      >
        {children}
      </NavigationLink>
    </li>
  );
}

NavigationHrefItem.propTypes = {
  // ID of the navigation item
  id: PropTypes.string.isRequired,
  // URI for this navigation item to link to
  href: PropTypes.string.isRequired,
  // Function to call when user clicks a navigation item
  navigationClick: PropTypes.func.isRequired,
  // True if this item is a child of another navigation item
  isChildItem: PropTypes.bool,
  // True if the navigation is in narrow mode
  isNarrowNav: PropTypes.bool,
  // True if the link should open in a new tab
  isExternal: PropTypes.bool,
};

/**
 * Wrapper for the site search icon while navigation is collapsed.
 */
function NavigationSearchItem({ children }) {
  return <li>{children}</li>;
}

/**
 * Icon for expanding or collapsing a navigation group item.
 */
function NavigationGroupExpandIcon({ isGroupOpened }) {
  return (
    <div className="ml-auto h-4 w-4">
      {isGroupOpened ? <MinusIcon /> : <PlusIcon />}
    </div>
  );
}

NavigationGroupExpandIcon.propTypes = {
  // True if the navigation group is open
  isGroupOpened: PropTypes.bool.isRequired,
};

/**
 * Handles a navigation group item, reacting to clicks to expand or collapse the group, and
 * rendering the child items.
 */
function NavigationGroupItem({
  id,
  title,
  icon,
  isGroupOpened,
  handleGroupClick,
  children,
}) {
  return (
    <li>
      <NavigationButton
        id={id}
        onClick={() => handleGroupClick(id)}
        isNarrowNav={false}
      >
        <NavigationIcon>{icon}</NavigationIcon>
        {title}
        <NavigationGroupExpandIcon isGroupOpened={isGroupOpened} />
      </NavigationButton>
      <MobileCollapsableArea isOpen={isGroupOpened}>
        <ul className="ml-5">{children}</ul>
      </MobileCollapsableArea>
    </li>
  );
}

NavigationGroupItem.propTypes = {
  // ID of the navigation group item
  id: PropTypes.string.isRequired,
  // Displayed title of the navigation group item
  title: PropTypes.string.isRequired,
  // Component that renders the icon for this item
  icon: PropTypes.node.isRequired,
  // True if the parent navigation item is open
  isGroupOpened: PropTypes.bool.isRequired,
  // Function to call when the user clicks the parent navigation item
  handleGroupClick: PropTypes.func.isRequired,
};

/**
 * Wraps a generic navigation item in an <li> tag.
 */
function NavigationItem({ children }) {
  return <li>{children}</li>;
}

/**
 * Handles the button to expand or collapse the sidebar navigation.
 */
function NavigationCollapseButton({ toggleNavCollapsed, isNavCollapsed }) {
  return (
    <button
      title={`${isNavCollapsed ? "Expand" : "Collapse"} navigation ${UC.cmd}${
        UC.shift
      }D or ${UC.ctrl}${UC.shift}D`}
      onClick={toggleNavCollapsed}
      data-testid={
        isNavCollapsed ? "nav-expand-trigger" : "nav-collapse-trigger"
      }
    >
      {isNavCollapsed ? (
        <NavExpandIcon className="h-8 w-8" />
      ) : (
        <NavCollapseIcon className="h-8 w-8" />
      )}
    </button>
  );
}

NavigationCollapseButton.propTypes = {
  // Function to call when the user clicks the collapse button
  toggleNavCollapsed: PropTypes.func.isRequired,
  // True if the main sidebar navigation is collapsed
  isNavCollapsed: PropTypes.bool.isRequired,
};

/**
 * Navigation-area item to handle the collapse/expand button.
 */
function NavigationCollapseItem({ toggleNavCollapsed, isNavCollapsed }) {
  return (
    <li>
      <NavigationCollapseButton
        toggleNavCollapsed={toggleNavCollapsed}
        isNavCollapsed={isNavCollapsed}
      />
    </li>
  );
}

NavigationCollapseItem.propTypes = {
  // True if the main sidebar navigation is collapsed
  isNavCollapsed: PropTypes.bool.isRequired,
  // Function to call when the user clicks the collapse button
  toggleNavCollapsed: PropTypes.func.isRequired,
};

/**
 * Wraps the navigation items in <nav> and <ul> tags.
 */
function NavigationList({ className = null, children }) {
  return (
    <nav className={className}>
      <ul className="[&>li]:block">{children}</ul>
    </nav>
  );
}

NavigationList.propTypes = {
  // Optional Tailwind CSS class name to add to the nav element
  className: PropTypes.string,
};

/**
 * Renders the search trigger buttons in the navigation.
 */
function NavigationSearchTriggers() {
  return (
    <div className="flex gap-1">
      <SiteSearchTrigger isExpanded />
      <IdSearchTrigger />
    </div>
  );
}

/**
 * Renders the navigation area for mobile and desktop.
 */
function NavigationExpanded({ navigationClick, toggleNavCollapsed }) {
  // Holds the ids of the currently open parent navigation items
  const [openedParents, setOpenedParents] = React.useState([]);
  // Current Auth0 information
  const { isAuthenticated } = useAuth0();
  // Logged-in session-properties object
  const { sessionProperties } = useContext(SessionContext);
  // Extra query-string parameters for list/report pages
  const extraQueries = useBrowserStateQuery();

  /**
   * Called when the user clicks a group navigation item to open or close it.
   * @param {string} parentId ID of the clicked parent navigation item
   */
  function handleParentClick(parentId) {
    if (openedParents.includes(parentId)) {
      // Close the parent navigation item.
      setOpenedParents(openedParents.filter((id) => id !== parentId));
    } else {
      // Open the parent navigation item.
      setOpenedParents([...openedParents, parentId]);
    }
  }

  return (
    <>
      {toggleNavCollapsed && (
        <NavigationLogo
          toggleNavCollapsed={toggleNavCollapsed}
          isNavCollapsed={false}
        />
      )}
      <NavigationSearchTriggers />
      <NavigationList className="p-4">
        <NavigationGroupItem
          id="data"
          title="Data"
          icon={<Icon.Data />}
          isGroupOpened={openedParents.includes("data")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="raw-datasets"
            href={`/search/?type=MeasurementSet${extraQueries}`}
            navigationClick={navigationClick}
            isChildItem
          >
            Raw Data Sets
          </NavigationHrefItem>
          <NavigationHrefItem
            id="processed-datasets"
            href={`/search/?type=AnalysisSet${extraQueries}`}
            navigationClick={navigationClick}
            isChildItem
          >
            Processed Data Sets
          </NavigationHrefItem>
          <NavigationHrefItem
            id="files"
            href={`/search/?type=File${extraQueries}`}
            navigationClick={navigationClick}
            isChildItem
          >
            Files
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="methodology"
          title="Methodology"
          icon={<Icon.Methodology />}
          isGroupOpened={openedParents.includes("methodology")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="experimental-standards"
            href="/methodology/experimental_standards"
            navigationClick={navigationClick}
            isChildItem
          >
            Experimental Standards
          </NavigationHrefItem>
          <NavigationHrefItem
            id="computational-standards"
            href="/methodology/computational_standards"
            navigationClick={navigationClick}
            isChildItem
          >
            Computational Standards
          </NavigationHrefItem>
          <NavigationHrefItem
            id="genome-references"
            href={`/search?type=CuratedSet&file_set_type=genome${extraQueries}`}
            navigationClick={navigationClick}
            isChildItem
          >
            Genome References
          </NavigationHrefItem>
          <NavigationHrefItem
            id="audits"
            href="/audits"
            navigationClick={navigationClick}
            isChildItem
          >
            Audit Documentation
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="resources"
          title="Resources"
          icon={<Icon.Resources />}
          isGroupOpened={openedParents.includes("resources")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="overview"
            href="/resources"
            navigationClick={navigationClick}
            isChildItem
          >
            Overview
          </NavigationHrefItem>
          <NavigationHrefItem
            id="tissues"
            href="/tissue-summary/mus-musculus"
            navigationClick={navigationClick}
            isChildItem
          >
            Tissues
          </NavigationHrefItem>
          <NavigationHrefItem
            id="cell-models"
            href="/cell-models/cell-lines"
            navigationClick={navigationClick}
            isChildItem
          >
            Cell Models
          </NavigationHrefItem>
          <NavigationHrefItem
            id="computational-tools"
            href="/computational-tools"
            navigationClick={navigationClick}
            isChildItem
          >
            Computational Tools
          </NavigationHrefItem>
          <NavigationHrefItem
            id="predictive-models"
            href="/predictive-models"
            navigationClick={navigationClick}
            isChildItem
          >
            Predictive Models
          </NavigationHrefItem>
          <NavigationHrefItem
            id="assays"
            href="/assays"
            navigationClick={navigationClick}
            isChildItem
          >
            Assays
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="data-model"
          title="Data Model"
          icon={<Icon.DataModel />}
          isGroupOpened={openedParents.includes("data-model")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="schemas"
            href="/profiles"
            navigationClick={navigationClick}
            isChildItem
          >
            Schemas
          </NavigationHrefItem>
          <NavigationHrefItem
            id="data-model-examples"
            href="/help/data-submission/data-model-examples"
            navigationClick={navigationClick}
            isChildItem
          >
            Data Model Examples
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="about"
          title="About"
          icon={
            <Icon.Brand className="[&>g]:fill-black dark:[&>g]:fill-white dark:[&>path]:fill-gray-300" />
          }
          isGroupOpened={openedParents.includes("about")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="policies"
            href="/policies"
            navigationClick={navigationClick}
            isChildItem
          >
            Policies
          </NavigationHrefItem>
          <NavigationHrefItem
            id="igvf-help"
            href="/help/about-igvf"
            navigationClick={navigationClick}
            isChildItem
          >
            IGVF
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="help"
          title="Help"
          icon={<QuestionMarkCircleIcon />}
          isGroupOpened={openedParents.includes("help")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="submission"
            href="/help/data-submission"
            navigationClick={navigationClick}
            isChildItem
          >
            Data Submission
          </NavigationHrefItem>
          <NavigationHrefItem
            id="general-help"
            href="/help/general-help"
            navigationClick={navigationClick}
            isChildItem
          >
            General Help
          </NavigationHrefItem>
          <NavigationHrefItem
            id="github-issues"
            href="https://github.com/orgs/IGVF/projects/1/views/2?filterQuery=front-end%3A%22Data+Portal%22&visibleFields=%5B%22Title%22%2C%22Assignees%22%2C%22Status%22%2C114383190%5D"
            navigationClick={navigationClick}
            isChildItem
            isExternal
          >
            Data Portal Issues?
          </NavigationHrefItem>
        </NavigationGroupItem>

        {isAuthenticated ? (
          <NavigationGroupItem
            id="authenticate"
            title={sessionProperties?.user?.title || "User"}
            icon={<Icon.UserSignedIn />}
            isGroupOpened={openedParents.includes("authenticate")}
            handleGroupClick={handleParentClick}
          >
            <NavigationHrefItem
              id="profile"
              href="/user-profile"
              navigationClick={navigationClick}
              isChildItem
            >
              Profile
            </NavigationHrefItem>
            {sessionProperties?.admin && (
              <NavigationHrefItem
                id="impersonate"
                href="/impersonate-user"
                navigationClick={navigationClick}
                isChildItem
              >
                Impersonate User
              </NavigationHrefItem>
            )}
            <NavigationSignOutItem id="signout" isChildItem>
              Sign Out
            </NavigationSignOutItem>
          </NavigationGroupItem>
        ) : (
          <NavigationSignInItem id="authenticate">
            <NavigationIcon>
              <Icon.UserSignedOut />
            </NavigationIcon>
            Sign In
          </NavigationSignInItem>
        )}
        <NavigationItem>
          <IndexerState />
        </NavigationItem>
        <NavigationItem>
          <div className="flex justify-center gap-2">
            <Email />
            <Twitter />
            <CreativeCommons />
          </div>
        </NavigationItem>
      </NavigationList>
    </>
  );
}

NavigationExpanded.propTypes = {
  // Function to call when user clicks a navigation item
  navigationClick: PropTypes.func.isRequired,
  // Function to call when user clicks the collapse button
  toggleNavCollapsed: PropTypes.func,
};

function NavigationCollapsed({ navigationClick, toggleNavCollapsed }) {
  const { isAuthenticated } = useAuth0();

  return (
    <NavigationList className="w-full [&>ul>li]:my-2 [&>ul]:flex [&>ul]:flex-col [&>ul]:items-center">
      <NavigationCollapseItem
        toggleNavCollapsed={toggleNavCollapsed}
        isNavCollapsed
      >
        <NavExpandIcon />
      </NavigationCollapseItem>
      <NavigationHrefItem
        id="home"
        href="/"
        navigationClick={navigationClick}
        isNarrowNav
      >
        <NavigationIcon isNarrowNav>
          <Icon.Brand />
        </NavigationIcon>
      </NavigationHrefItem>
      <NavigationSearchItem>
        <SiteSearchTrigger />
      </NavigationSearchItem>
      {isAuthenticated ? (
        <NavigationSignOutItem id="sign-out" isNarrowNav>
          <Icon.UserSignedIn className="h-8 w-8" />
        </NavigationSignOutItem>
      ) : (
        <NavigationSignInItem id="authenticate" isNarrowNav>
          <Icon.UserSignedOut className="h-8 w-8" />
        </NavigationSignInItem>
      )}
      <NavigationHrefItem
        id="help"
        href="/help/general-help/"
        navigationClick={navigationClick}
        isNarrowNav
      >
        <NavigationIcon isNarrowNav>
          <QuestionMarkCircleIcon />
        </NavigationIcon>
      </NavigationHrefItem>
      <NavigationItem>
        <IndexerState isCollapsed />
      </NavigationItem>
      <NavigationItem>
        <Email />
      </NavigationItem>
    </NavigationList>
  );
}

NavigationCollapsed.propTypes = {
  // Function to call when user clicks a navigation item
  navigationClick: PropTypes.func.isRequired,
  // Function to call when user clicks the collapse button
  toggleNavCollapsed: PropTypes.func.isRequired,
};

/**
 * Displays the full IGVF logo and the sidebar navigation collapse button.
 */
function NavigationLogo({ toggleNavCollapsed, isNavCollapsed }) {
  return (
    <div className="flex">
      <SiteLogo />
      <NavigationCollapseButton
        toggleNavCollapsed={toggleNavCollapsed}
        isNavCollapsed={isNavCollapsed}
      />
    </div>
  );
}

NavigationLogo.propTypes = {
  // Function to call when user clicks the collapse button
  toggleNavCollapsed: PropTypes.func.isRequired,
  // True if the navigation is collapsed
  isNavCollapsed: PropTypes.bool.isRequired,
};

/**
 * Displays the navigation bar (for mobile) or the sidebar navigation (for desktop).
 */
export default function NavigationSection() {
  // True if user has opened the mobile menu
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  // True if user has collapsed the sidebar menu
  const [isNavCollapsed, setIsNavCollapsed] = useSessionStorage(
    "nav-collapsed",
    false
  );

  /**
   * Called when the user clicks a navigation menu item.
   */
  function navigationClick() {
    setIsMobileNavOpen(false);
  }

  /**
   * Called when the user collapses or expands the main sidebar navigation. We have to cache this
   * function because the key listener has this as a dependency.
   */
  const toggleNavCollapsed = useCallback(() => {
    setIsNavCollapsed(!isNavCollapsed);
  }, [isNavCollapsed, setIsNavCollapsed]);

  useEffect(() => {
    /**
     * Called when the user types a key. Use this to toggle the collapsed state of navigation.
     * @param {object} event React synthetic keyboard event
     */
    function handleCollapseKeypress(event) {
      if (
        (event.key === "d" || event.key === "D") &&
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey
      ) {
        event.preventDefault();
        event.stopPropagation();
        toggleNavCollapsed();
        return false;
      }
      return true;
    }

    document.addEventListener("keydown", handleCollapseKeypress);
    return () => {
      document.removeEventListener("keydown", handleCollapseKeypress);
    };
  }, [toggleNavCollapsed]);

  return (
    <section
      className={`bg-brand md:sticky md:top-0 md:h-screen md:shrink-0 md:grow-0 md:overflow-y-auto md:bg-transparent ${
        isNavCollapsed ? "md:w-12" : "md:w-72"
      }`}
    >
      <div className="flex h-14 items-center justify-between p-2 md:hidden">
        <SiteLogo />
        <button
          data-testid="mobile-navigation-trigger"
          className="stroke-white md:hidden"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          <Bars2Icon className="h-5 w-5 fill-white" />
        </button>
      </div>

      <div className={isNavCollapsed ? "md:p-0" : "md:px-4"}>
        <div className="hidden md:block">
          {isNavCollapsed ? (
            <NavigationCollapsed
              navigationClick={navigationClick}
              toggleNavCollapsed={toggleNavCollapsed}
            />
          ) : (
            <NavigationExpanded
              navigationClick={navigationClick}
              toggleNavCollapsed={toggleNavCollapsed}
            />
          )}
        </div>
      </div>

      <MobileCollapsableArea
        isOpen={isMobileNavOpen}
        testid="mobile-navigation"
      >
        <NavigationExpanded navigationClick={navigationClick} />
      </MobileCollapsableArea>
    </section>
  );
}

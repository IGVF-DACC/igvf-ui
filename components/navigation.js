// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CodeBracketIcon,
  Bars2Icon,
  BeakerIcon,
  BookmarkIcon,
  CircleStackIcon,
  DocumentIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  MinusIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  UserGroupIcon,
  PaperClipIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
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
import { useAuthenticated } from "./authentication";
import { useSessionStorage } from "./browser-storage";
import { Button } from "./form-elements";
import Icon from "./icon";
import SiteLogo from "./logo";
import Modal from "./modal";
import SessionContext from "./session-context";
// lib
import { AUTH_ERROR_URI, UC } from "../lib/constants";

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
      className: isNarrowNav ? "h-8 w-8" : "mr-1 h-4 w-4",
    });
  }
  return children;
}

/**
 * Render the button for a navigation item with the navigation in wide mode, whether it actually
 * navigates or just opens the child items. Must use forwardRef to work with <Link>, if the
 * navigation item uses one.
 */
function NavigationButtonWide({
  id,
  onClick,
  isChildItem = false,
  isDisabled = false,
  children,
}) {
  return (
    <button
      onClick={onClick}
      data-testid={id}
      disabled={isDisabled}
      className={`flex w-full items-center rounded-full border border-transparent px-2 py-1 text-left text-white no-underline hover:bg-nav-highlight disabled:text-gray-500 md:text-black md:hover:border md:hover:border-nav-border md:hover:bg-nav-highlight md:dark:text-gray-200 ${
        isChildItem ? "text-sm font-normal" : "text-base font-medium"
      }`}
    >
      {children}
    </button>
  );
}

NavigationButtonWide.propTypes = {
  // The id of the navigation item
  id: PropTypes.string.isRequired,
  // The click handler for the navigation item
  onClick: PropTypes.func.isRequired,
  // True if this item is a child of another navigation item
  isChildItem: PropTypes.bool,
  // True if button should appear disabled
  isDisabled: PropTypes.bool,
};

function NavigationButtonNarrow({ id, onClick, isDisabled = false, children }) {
  return (
    <button
      onClick={onClick}
      data-testid={id}
      className="block h-8 w-8 text-black dark:text-gray-300"
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}

NavigationButtonNarrow.propTypes = {
  // The id of the navigation item
  id: PropTypes.string.isRequired,
  // The click handler for the navigation item
  onClick: PropTypes.func.isRequired,
  // True if button should appear disabled
  isDisabled: PropTypes.bool,
};

/**
 * NavigationExpanded item to handle the Sign In button.
 */
function NavigationSignInItem({ id, isNarrowNav = false, children }) {
  const { isLoading, loginWithRedirect } = useAuth0();
  const { setRedirectTo } = useContext(SessionContext);

  // Use different button-rendering components depending on whether the navigation is in wide mode
  // or narrow mode.
  const NavigationButton = isNarrowNav
    ? NavigationButtonNarrow
    : NavigationButtonWide;

  /**
   * Called when the user clicks the Sign In button to begin the Auth0 authorization process.
   * Redirect the post-login to the page the user currently views unless the current page is the
   * authentication error one. We leave the rest of the provider authentication process to Auth0.
   * We only know it was successful once `useAuth0` returns true in `isAuthenticated`.
   */
  function handleAuthClick() {
    // Save the current path and query string in session storage so we can redirect to it after
    // signin, unless the user is on the authentication-error page, in which case we redirect to
    // the home page after sign-in so the user doesn't see an authentication error after a good
    // sign-in.
    setRedirectTo(
      window.location.pathname === AUTH_ERROR_URI
        ? "/"
        : `${window.location.pathname}${window.location.search}`
    );
    loginWithRedirect();
  }

  return (
    <li>
      <NavigationButton
        id={id}
        isDisabled={isLoading}
        onClick={handleAuthClick}
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
  // True if signout warning modal open
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const { logout, user } = useAuth0();

  // Use different button-rendering components depending on whether the navigation is in wide mode
  // or narrow mode.
  const NavigationButton = isNarrowNav
    ? NavigationButtonNarrow
    : NavigationButtonWide;

  /**
   * Called when the user clicks the Sign Out button.
   */
  function handleAuthClick() {
    logout({ returnTo: window.location.origin });
  }

  return (
    <>
      <li className={className}>
        <NavigationButton
          id={id}
          onClick={() => setIsWarningOpen(true)}
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
          <h2 className="text-lg font-semibold">Sign Out {user.name}</h2>
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
          <Button onClick={handleAuthClick} label={`Sign out ${user.name}`}>
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
 * Renders a single navigation item.
 */
function NavigationHrefItem({
  id,
  href,
  navigationClick,
  isChildItem = false,
  isNarrowNav = false,
  children,
}) {
  const router = useRouter();

  // Use different button-rendering components depending on whether the navigation is in wide mode
  // or narrow mode.
  const NavigationButton = isNarrowNav
    ? NavigationButtonNarrow
    : NavigationButtonWide;

  function onClick() {
    // Notify the main navigation component that the user has clicked a navigation item, then
    // navigate to the href for the navigation item.
    navigationClick();
    router.push(href);
  }

  return (
    <li>
      <NavigationButton id={id} onClick={onClick} isChildItem={isChildItem}>
        {children}
      </NavigationButton>
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
};

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
      <NavigationButtonWide id={id} onClick={() => handleGroupClick(id)}>
        <NavigationIcon>{icon}</NavigationIcon>
        {title}
        <NavigationGroupExpandIcon isGroupOpened={isGroupOpened} />
      </NavigationButtonWide>
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
 * Renders the navigation area for mobile and desktop.
 */
function NavigationExpanded({ navigationClick, toggleNavCollapsed }) {
  // Holds the ids of the currently open parent navigation items
  const [openedParents, setOpenedParents] = React.useState([]);
  // Current Auth0 information
  const { user } = useAuth0();
  const isAuthenticated = useAuthenticated();

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
      <NavigationList className="p-4">
        <NavigationHrefItem
          id="awards"
          href="/search?type=Award"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <Icon.Award />
          </NavigationIcon>
          Awards
        </NavigationHrefItem>
        <NavigationHrefItem
          id="biomarkers"
          href="/search?type=Biomarker"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <BookmarkIcon />
          </NavigationIcon>
          Biomarkers
        </NavigationHrefItem>
        <NavigationHrefItem
          id="documents"
          href="/search?type=Document"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <PaperClipIcon />
          </NavigationIcon>
          Documents
        </NavigationHrefItem>
        <NavigationGroupItem
          id="donors"
          title="Donors"
          icon={<Icon.Donor />}
          isGroupOpened={openedParents.includes("donors")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="human-donors"
            href="/search?type=HumanDonor"
            navigationClick={navigationClick}
            isChildItem
          >
            Human Donors
          </NavigationHrefItem>
          <NavigationHrefItem
            id="rodent-donors"
            href="/search?type=RodentDonor"
            navigationClick={navigationClick}
            isChildItem
          >
            Rodent Donors
          </NavigationHrefItem>
        </NavigationGroupItem>
        <NavigationGroupItem
          id="files"
          title="Files"
          icon={<DocumentTextIcon />}
          isGroupOpened={openedParents.includes("files")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="reference-file"
            href="/search?type=ReferenceFile"
            navigationClick={navigationClick}
            isChildItem
          >
            Reference Files
          </NavigationHrefItem>
          <NavigationHrefItem
            id="sequence-file"
            href="/search?type=SequenceFile"
            navigationClick={navigationClick}
            isChildItem
          >
            Sequence Files
          </NavigationHrefItem>
        </NavigationGroupItem>
        <NavigationGroupItem
          id="file-sets"
          title="File sets"
          icon={<Icon.FileSet />}
          isGroupOpened={openedParents.includes("file-sets")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="analysis-sets"
            href="/search?type=AnalysisSet"
            navigationClick={navigationClick}
            isChildItem
          >
            Analysis Sets
          </NavigationHrefItem>
          <NavigationHrefItem
            id="curated-sets"
            href="/search?type=CuratedSet"
            navigationClick={navigationClick}
            isChildItem
          >
            Curated Sets
          </NavigationHrefItem>
          <NavigationHrefItem
            id="measurement-sets"
            href="/search?type=MeasurementSet"
            navigationClick={navigationClick}
            isChildItem
          >
            Measurement Sets
          </NavigationHrefItem>
        </NavigationGroupItem>
        <NavigationHrefItem
          id="genes"
          href="/search?type=Gene"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <Icon.Gene />
          </NavigationIcon>
          Genes
        </NavigationHrefItem>
        <NavigationHrefItem
          id="labs"
          href="/search?type=Lab"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <BeakerIcon />
          </NavigationIcon>
          Labs
        </NavigationHrefItem>
        <NavigationHrefItem
          id="pages"
          href="/search?type=Page"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <DocumentIcon />
          </NavigationIcon>
          Pages
        </NavigationHrefItem>
        <NavigationHrefItem
          id="publications"
          href="/search?type=Publication"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <PencilSquareIcon />
          </NavigationIcon>
          Publications
        </NavigationHrefItem>
        <NavigationGroupItem
          id="ontologies"
          title="Ontologies"
          icon={<TagIcon />}
          isGroupOpened={openedParents.includes("ontologies")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="assay-terms"
            href="/search?type=AssayTerm"
            navigationClick={navigationClick}
            isChildItem
          >
            Assays
          </NavigationHrefItem>
          <NavigationHrefItem
            id="phenotype-terms"
            href="/search?type=PhenotypeTerm"
            navigationClick={navigationClick}
            isChildItem
          >
            Phenotypes
          </NavigationHrefItem>
          <NavigationHrefItem
            id="platform-terms"
            href="/search?type=PlatformTerm"
            navigationClick={navigationClick}
            isChildItem
          >
            Platforms
          </NavigationHrefItem>
          <NavigationHrefItem
            id="samples-terms"
            href="/search?type=SampleTerm"
            navigationClick={navigationClick}
            isChildItem
          >
            Samples
          </NavigationHrefItem>
        </NavigationGroupItem>
        <NavigationGroupItem
          id="samples"
          title="Samples"
          icon={<Icon.Sample />}
          isGroupOpened={openedParents.includes("samples")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="in-vitro-systems"
            href="/search?type=InVitroSystem"
            navigationClick={navigationClick}
            isChildItem
          >
            In Vitro Systems
          </NavigationHrefItem>
          <NavigationHrefItem
            id="tissues"
            href="/search?type=Tissue"
            navigationClick={navigationClick}
            isChildItem
          >
            Tissues
          </NavigationHrefItem>
          <NavigationHrefItem
            id="primary-cells"
            href="/search?type=PrimaryCell"
            navigationClick={navigationClick}
            isChildItem
          >
            Primary Cells
          </NavigationHrefItem>
          <NavigationHrefItem
            id="whole-organisms"
            href="/search?type=WholeOrganism"
            navigationClick={navigationClick}
            isChildItem
          >
            Whole Organisms
          </NavigationHrefItem>
          <NavigationHrefItem
            id="technical-samples"
            href="/search?type=TechnicalSample"
            navigationClick={navigationClick}
            isChildItem
          >
            Technical Samples
          </NavigationHrefItem>
        </NavigationGroupItem>
        <NavigationHrefItem
          id="profiles"
          href="/profiles"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <CodeBracketIcon />
          </NavigationIcon>
          Schemas
        </NavigationHrefItem>
        <NavigationGroupItem
          id="software-parent"
          title="Software"
          icon={<CircleStackIcon />}
          isGroupOpened={openedParents.includes("software-parent")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="software"
            href="/search?type=Software"
            navigationClick={navigationClick}
            isChildItem
          >
            Software
          </NavigationHrefItem>
          <NavigationHrefItem
            id="software-versions"
            href="/search?type=SoftwareVersion"
            navigationClick={navigationClick}
            isChildItem
          >
            Software Versions
          </NavigationHrefItem>
        </NavigationGroupItem>
        <NavigationHrefItem
          id="sources"
          href="/search?type=Source"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <InformationCircleIcon />
          </NavigationIcon>
          Sources
        </NavigationHrefItem>
        <NavigationHrefItem
          id="treatments"
          href="/search?type=Treatment"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <Icon.Treatment />
          </NavigationIcon>
          Treatments
        </NavigationHrefItem>
        <NavigationHrefItem
          id="users"
          href="/search?type=User"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <UserGroupIcon />
          </NavigationIcon>
          Users
        </NavigationHrefItem>
        {isAuthenticated ? (
          <NavigationGroupItem
            id="authenticate"
            title={user.name}
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
        <NavigationHrefItem
          id="help"
          href="/help"
          navigationClick={navigationClick}
        >
          <NavigationIcon>
            <QuestionMarkCircleIcon />
          </NavigationIcon>
          Help
        </NavigationHrefItem>
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
  const isAuthenticated = useAuthenticated();

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
      {isAuthenticated ? (
        <NavigationSignOutItem id="signout" isNarrowNav>
          <Icon.UserSignedIn className="h-8 w-8" />
        </NavigationSignOutItem>
      ) : (
        <NavigationSignInItem id="authenticate" isNarrowNav>
          <Icon.UserSignedOut className="h-8 w-8" />
        </NavigationSignInItem>
      )}
      <NavigationHrefItem
        id="help"
        href="/help"
        navigationClick={navigationClick}
        isNarrowNav
      >
        <NavigationIcon isNarrowNav>
          <QuestionMarkCircleIcon />
        </NavigationIcon>
      </NavigationHrefItem>
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
d */
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
      className={`bg-brand md:sticky md:top-0 md:h-screen md:shrink-0 md:grow-0 md:overflow-y-auto md:border-r-2 md:border-r-gray-200 md:bg-transparent dark:md:border-r-gray-800 ${
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

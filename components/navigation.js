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
  UserIcon,
  PaperClipIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import React, { Children, isValidElement, useContext, useState } from "react";
// components
import Icon from "./icon";
import SiteLogo from "./logo";
import SessionContext from "./session-context";
// lib
import { AUTH_ERROR_URI } from "../lib/constants";

/**
 * Animation configurations for mobile and hierarchical navigation.
 */
const navigationTransition = { duration: 0.2, ease: "easeInOut" };
const navigationVariants = {
  open: { height: "auto" },
  collapsed: { height: 0 },
};

/**
 * Renders collapsable navigation items, both for the mobile menu and for collapsable children of
 * grouped navigation items.
 */
function NavigationCollapsableArea({ isOpen, testid = "", children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-testid={testid}
          className="overflow-hidden md:hidden"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          transition={navigationTransition}
          variants={navigationVariants}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

NavigationCollapsableArea.propTypes = {
  // True if the collapsable navigation area is visible.
  isOpen: PropTypes.bool.isRequired,
  // Optional data-testid for the motion div.
  testid: PropTypes.string,
};

/**
 * Wrapper for the navigation icons to add Tailwind CSS classes to the icon svg.
 */
function NavigationIcon({ children }) {
  const iconElement = Children.only(children);
  if (isValidElement(iconElement)) {
    return React.cloneElement(iconElement, { className: "mr-1 h-4 w-4" });
  }
  return children;
}

/**
 * Render the button for a navigation item, whether it actually navigates or just opens the child
 * items. Must use forwardRef to work with <Link>, if the navigation item uses one.
 */
const NavigationButton = React.forwardRef(
  ({ id, onClick, isChildItem = false, isDisabled = false, children }, ref) => {
    return (
      <button
        onClick={onClick}
        data-testid={id}
        disabled={isDisabled}
        className={`flex w-full items-center rounded-full border border-transparent px-2 py-1 text-left text-white no-underline hover:bg-nav-highlight disabled:text-gray-500 md:text-black md:hover:border md:hover:border-nav-border md:hover:bg-nav-highlight md:dark:text-gray-200 ${
          isChildItem ? "text-sm font-normal" : "text-base font-medium"
        }`}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);

NavigationButton.propTypes = {
  // The id of the navigation item
  id: PropTypes.string.isRequired,
  // The click handler for the navigation item
  onClick: PropTypes.func.isRequired,
  // True if this item is a child of another navigation item
  isChildItem: PropTypes.bool,
  // True if button should appear disabled
  isDisabled: PropTypes.bool,
};

// Forwarded components don't automatically get the required display name.
NavigationButton.displayName = "NavigationButton";

/**
 * Navigation item to handle the Sign In button.
 */
function NavigationSignInItem({ id, children }) {
  const { isLoading, loginWithRedirect } = useAuth0();
  const { setRedirectTo } = useContext(SessionContext);

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
};

/**
 * Navigation item to handle the Sign Out button.
 */
function NavigationSignOutItem({ id, children }) {
  const { logout } = useAuth0();

  /**
   * Called when the user clicks the Sign Out button.
   */
  function handleAuthClick() {
    logout({ returnTo: window.location.origin });
  }

  return (
    <li>
      <NavigationButton id={id} onClick={handleAuthClick} isChildItem>
        {children}
      </NavigationButton>
    </li>
  );
}

NavigationSignOutItem.propTypes = {
  // ID of the authentication navigation item
  id: PropTypes.string.isRequired,
};

/**
 * Renders a single navigation item.
 */
function NavigationHrefItem({
  id,
  href,
  navigationClick,
  isChildItem = false,
  children,
}) {
  const router = useRouter();

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
      <NavigationButton id={id} onClick={() => handleGroupClick(id)}>
        <NavigationIcon>{icon}</NavigationIcon>
        {title}
        <NavigationGroupExpandIcon isGroupOpened={isGroupOpened} />
      </NavigationButton>
      <NavigationCollapsableArea isOpen={isGroupOpened}>
        <ul className="ml-5">{children}</ul>
      </NavigationCollapsableArea>
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
 * Wraps the navigation items in <nav> and <ul> tags.
 */
function NavigationList({ children }) {
  return (
    <nav className="p-4">
      <ul>{children}</ul>
    </nav>
  );
}

/**
 * Renders the navigation area for mobile and desktop.
 */
function Navigation({ navigationClick }) {
  // Holds the ids of the currently open parent navigation items
  const [openedParents, setOpenedParents] = React.useState([]);
  // Current Auth0 information
  const { isAuthenticated, isLoading, user } = useAuth0();

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
    <NavigationList>
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
          id="reference-data"
          href="/search?type=ReferenceData"
          navigationClick={navigationClick}
          isChildItem
        >
          Reference Data
        </NavigationHrefItem>
        <NavigationHrefItem
          id="sequence-data"
          href="/search?type=SequenceData"
          navigationClick={navigationClick}
          isChildItem
        >
          Sequence Data
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
      {isAuthenticated && !isLoading ? (
        <NavigationGroupItem
          id="authenticate"
          title={user.name}
          icon={<UserIcon />}
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
          <NavigationSignOutItem id="signout">Sign Out</NavigationSignOutItem>
        </NavigationGroupItem>
      ) : (
        <NavigationSignInItem id="authenticate">
          <NavigationIcon>
            <UserIcon />
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
  );
}

Navigation.propTypes = {
  // Function to call when user clicks a navigation item
  navigationClick: PropTypes.func.isRequired,
};

/**
 * Displays the navigation bar (for mobile) or the sidebar navigation (for desktop).
 */
export default function NavigationSection() {
  // True if user has opened the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Called when the user clicks a navigation menu item.
   */
  function navigationClick() {
    setIsMobileMenuOpen(false);
  }

  return (
    <section className="bg-brand md:sticky md:top-0 md:h-screen md:w-72 md:shrink-0 md:grow-0 md:overflow-y-auto md:border-r-2 md:border-r-gray-300 md:bg-transparent">
      <div className="flex h-14 justify-between px-2 md:block md:px-4">
        <SiteLogo />
        <button
          data-testid="mobile-navigation-trigger"
          className="stroke-white md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Bars2Icon className="h-5 w-5 fill-white" />
        </button>
        <div className="hidden md:block">
          <Navigation navigationClick={navigationClick} />
        </div>
      </div>

      <NavigationCollapsableArea
        isOpen={isMobileMenuOpen}
        testid="mobile-navigation"
      >
        <Navigation navigationClick={navigationClick} />
      </NavigationCollapsableArea>
    </section>
  );
}

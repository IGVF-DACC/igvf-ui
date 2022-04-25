// node_modules
import { useAuth0 } from "@auth0/auth0-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BeakerIcon,
  MenuAlt4Icon,
  MinusIcon,
  PlusIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/solid"
import Link from "next/link"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import React, { Children, isValidElement, useEffect, useState } from "react"
// libs
import {
  getSession,
  loginToServer,
  logoutFromServer,
} from "../libs/authentication"
// components
import Icon from "./icon"
import SiteLogo from "./logo"

/**
 * Wrapper for the navigation icons to add Tailwind CSS classes to the icon svg.
 */
const NavigationIcon = ({ children }) => {
  const iconElement = Children.only(children)
  if (isValidElement(iconElement)) {
    return React.cloneElement(iconElement, { className: "mr-1 h-4 w-4" })
  }
  return children
}

/**
 * Render the button for a navigation item, whether it actually navigates or just opens the child
 * items. Must use forwardRef to work with <Link>, if the navigation item uses one.
 */
const NavigationButton = React.forwardRef(
  ({ id, onClick, isChildItem = false, children }, ref) => {
    return (
      <button
        onClick={onClick}
        data-testid={id}
        className={`flex w-full items-center rounded-sm border border-transparent px-2 py-1 text-left text-white no-underline hover:bg-nav-highlight md:text-black md:hover:border md:hover:border-highlight-border md:hover:bg-highlight md:dark:text-gray-200 ${
          isChildItem ? "text-sm font-normal" : "text-base font-medium"
        }`}
        ref={ref}
      >
        {children}
      </button>
    )
  }
)

NavigationButton.propTypes = {
  // The id of the navigation item
  id: PropTypes.string.isRequired,
  // The click handler for the navigation item
  onClick: PropTypes.func.isRequired,
  // True if this item is a child of another navigation item
  isChildItem: PropTypes.bool,
}

// Forwarded components don't automatically get the required display name.
NavigationButton.displayName = "NavigationButton"

/**
 * Navigation item to handle the Sign In button.
 */
const NavigationSignInItem = ({ id, children }) => {
  const { loginWithRedirect } = useAuth0()

  /**
   * Called when the user clicks the Sign In button to begin the Auth0 authorization process.
   * Redirect the post-login to the page the user currently views. See the Auth0Provider usage in
   * _app.js to see how this gets used.
   */
  const handleAuthClick = () => {
    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
    })
  }

  return (
    <li>
      <NavigationButton id={id} onClick={handleAuthClick}>
        {children}
      </NavigationButton>
    </li>
  )
}

NavigationSignInItem.propTypes = {
  // ID of the authentication navigation item
  id: PropTypes.string.isRequired,
}

/**
 * Navigation item to handle the Sign Out button.
 */
const NavigationSignOutItem = ({ id, children }) => {
  const { logout } = useAuth0()

  /**
   * Called when the user clicks the Sign In button to begin the Auth0 authorization process.
   * Redirect the post-login to the page the user currently views. See the Auth0Provider usage in
   * _app.js to see how this gets used.
   */
  const handleAuthClick = () => {
    logout({ returnTo: process.env.NEXT_PUBLIC_AUTH0_BASE_URL })
  }

  return (
    <li>
      <NavigationButton id={id} onClick={handleAuthClick} isChildItem>
        {children}
      </NavigationButton>
    </li>
  )
}

NavigationSignOutItem.propTypes = {
  // ID of the authentication navigation item
  id: PropTypes.string.isRequired,
}

/**
 * Renders a single navigation item.
 */
const NavigationHrefItem = ({
  id,
  href,
  navigationClick,
  isChildItem = false,
  children,
}) => {
  const router = useRouter()

  const onClick = () => {
    // Notify the main navigation component that the user has clicked a navigation item, then
    // navigate to the href for the navigation item.
    navigationClick()
    router.push(href)
  }

  return (
    <li>
      <Link href={href} passHref>
        <NavigationButton id={id} onClick={onClick} isChildItem={isChildItem}>
          {children}
        </NavigationButton>
      </Link>
    </li>
  )
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
}

/**
 * Icon for expanding or collapsing a navigation group item.
 */
const NavigationGroupExpandIcon = ({ isGroupOpened }) => {
  return (
    <div className="ml-auto h-4 w-4">
      {isGroupOpened ? <MinusIcon /> : <PlusIcon />}
    </div>
  )
}

NavigationGroupExpandIcon.propTypes = {
  // True if the navigation group is open
  isGroupOpened: PropTypes.bool.isRequired,
}

/**
 * Handles a navigation group item, reacting to clicks to expand or collapse the group, and
 * rendering the child items.
 */
const NavigationGroupItem = ({
  id,
  title,
  icon,
  isGroupOpened,
  handleGroupClick,
  children,
}) => {
  return (
    <li>
      <NavigationButton id={id} onClick={() => handleGroupClick(id)}>
        <NavigationIcon>{icon}</NavigationIcon>
        {title}
        <NavigationGroupExpandIcon isGroupOpened={isGroupOpened} />
      </NavigationButton>
      {isGroupOpened && <ul className="ml-5">{children}</ul>}
    </li>
  )
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
}

/**
 * Wraps the navigation items in <nav> and <ul> tags.
 */
const NavigationList = ({ children }) => {
  return (
    <nav className="p-4">
      <ul>{children}</ul>
    </nav>
  )
}

/**
 * Renders the navigation area for mobile and desktop.
 */
const Navigation = ({ navigationClick }) => {
  // Holds the ids of the currently open parent navigation items
  const [openedParents, setOpenedParents] = React.useState([])
  // Current Auth0 information
  const { isAuthenticated, user } = useAuth0()

  /**
   * Called when the user clicks a group navigation item to open or close it.
   * @param {string} parentId ID of the clicked parent navigation item
   */
  const handleParentClick = (parentId) => {
    if (openedParents.includes(parentId)) {
      // Close the parent navigation item.
      setOpenedParents(openedParents.filter((id) => id !== parentId))
    } else {
      // Open the parent navigation item.
      setOpenedParents([...openedParents, parentId])
    }
  }

  return (
    <NavigationList>
      <NavigationHrefItem
        id="awards"
        href="/awards"
        navigationClick={navigationClick}
      >
        <NavigationIcon>
          <Icon.Award />
        </NavigationIcon>
        Awards
      </NavigationHrefItem>
      <NavigationHrefItem
        id="labs"
        href="/labs"
        navigationClick={navigationClick}
      >
        <NavigationIcon>
          <BeakerIcon />
        </NavigationIcon>
        Labs
      </NavigationHrefItem>
      <NavigationHrefItem
        id="users"
        href="/users"
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
    </NavigationList>
  )
}

Navigation.propTypes = {
  // Function to call when user clicks a navigation item
  navigationClick: PropTypes.func.isRequired,
}

/**
 * Displays the navigation bar (for mobile) or the sidebar navigation (for desktop).
 */
const NavigationSection = () => {
  // True if user has opened the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Auth0 information
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()

  /**
   * Called when the user clicks a navigation menu item.
   */
  const navigationClick = () => {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    getSession().then((session) => {
      if (isAuthenticated && !session["auth.userid"]) {
        // Auth0 has authenticated, but we haven't authenticated with the server yet.
        loginToServer(getAccessTokenSilently)
      } else if (!isAuthenticated && session["auth.userid"]) {
        // Auth0 has de-authenticated, but we have still authenticated with the server.
        logoutFromServer()
      }
    })
    // Once the user has logged into auth0, turn around and log into the server.
  }, [getAccessTokenSilently, isAuthenticated])

  return (
    <section className="bg-brand md:block md:h-auto md:w-60 md:shrink-0 md:grow-0 md:basis-60 md:bg-transparent">
      <div className="flex h-14 justify-between px-4 md:block">
        <SiteLogo />
        <button
          data-testid="mobile-navigation-trigger"
          className="stroke-white md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <MenuAlt4Icon className="h-5 w-5 fill-white" />
        </button>
        <div className="hidden md:block">
          <Navigation navigationClick={navigationClick} />
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            data-testid="mobile-navigation"
            className="overflow-hidden md:hidden"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            variants={{
              open: { height: "auto" },
              collapsed: { height: 0 },
            }}
          >
            <Navigation navigationClick={navigationClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default NavigationSection

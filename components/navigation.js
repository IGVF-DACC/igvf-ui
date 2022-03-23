// node_modules
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import React from "react"
// components
import SiteLogo from "../components/logo"

/**
 * Contains each navigation item. It might get extensions to allow hierarchical navigation.
 * `testid` must have a unique value for each item.
 */
const navigationItems = [
  {
    title: "Awards",
    href: "/awards",
    testid: "awards",
  },
  {
    title: "Labs",
    href: "/labs",
    testid: "labs",
  },
  {
    title: "Users",
    href: "/users",
    testid: "users",
  },
]

/**
 * Renders the hamburger icon SVG. Click handling gets handled by the parent component.
 */
const HamburgerIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 8h16M4 16h16"
      />
    </svg>
  )
}

/**
 * Renders a single navigation item.
 */
const NavigationItem = ({ href, testid, navigationClick, children }) => {
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
        <button
          onClick={onClick}
          data-testid={testid}
          className="block w-full px-2 py-2 text-left text-base no-underline hover:bg-highlight"
        >
          {children}
        </button>
      </Link>
    </li>
  )
}

NavigationItem.propTypes = {
  // The href for the navigation link
  href: PropTypes.string.isRequired,
  // Searchable test ID for <a>
  testid: PropTypes.string,
  // Function to call when user clicks a navigation item
  navigationClick: PropTypes.func.isRequired,
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
  return (
    <NavigationList>
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.testid}
          href={item.href}
          testid={item.testid}
          navigationClick={navigationClick}
        >
          {item.title}
        </NavigationItem>
      ))}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  /**
   * Called when the user clicks a navigation menu item.
   */
  const navigationClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <section className="bg-brand md:block md:h-auto md:w-60 md:shrink-0 md:grow-0 md:basis-60 md:bg-transparent">
      <div className="flex h-14 justify-between px-4 md:block">
        <SiteLogo />
        <button
          data-testid="mobile-navigation-trigger"
          className="stroke-white md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <HamburgerIcon />
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

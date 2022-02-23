// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
import React from "react"
// components
import SiteLogo from "../components/logo"

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
      stroke="currentColor"
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
 * @param {href} href The href for the navigation link
 */
const NavigationItem = ({ href, testid, children }) => {
  return (
    <li>
      <Link href={href}>
        <a
          data-testid={testid}
          className="block px-2 py-2 no-underline hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
        >
          {children}
        </a>
      </Link>
    </li>
  )
}

NavigationItem.propTypes = {
  // The href for the navigation link
  href: PropTypes.string.isRequired,
  // Searchable test ID for <a>
  testid: PropTypes.string,
}

/**
 * Wraps the navigation items in <nav> and <ul> tags.
 */
const NavigationList = ({ children }) => {
  return (
    <nav className="px-8">
      <ul>{children}</ul>
    </nav>
  )
}

/**
 * Renders the navigation area for mobile and desktop.
 */
const Navigation = () => {
  return (
    <NavigationList>
      <NavigationItem href="/awards" testid="awards">
        Awards
      </NavigationItem>
      <NavigationItem href="/labs" testid="labs">
        Labs
      </NavigationItem>
      <NavigationItem href="/users" testid="users">
        Users
      </NavigationItem>
    </NavigationList>
  )
}

/**
 * Displays the navigation bar (for mobile) or the sidebar navigation (for desktop).
 */
const NavigationSection = () => {
  // True if user has opened the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <section className="md:block md:h-auto md:w-60 md:shrink-0 md:grow-0 md:basis-60">
      <div className="flex h-14 justify-between md:block">
        <SiteLogo />
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <HamburgerIcon />
        </button>
        <div className="hidden md:block">
          <Navigation />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <Navigation />
        </div>
      )}
    </section>
  )
}

export default NavigationSection

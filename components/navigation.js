// react
import React from "react"
// nextjs
import Link from "next/link"
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
const NavigationItem = ({ href, children }) => {
  return (
    <li>
      <Link href={href}>
        <a className="block px-2 py-2 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">
          {children}
        </a>
      </Link>
    </li>
  )
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
      <NavigationItem href="/users">Users</NavigationItem>
      <NavigationItem href="/awards">Awards</NavigationItem>
    </NavigationList>
  )
}

/**
 * Displays the navigation bar (for mobile) or the sidebar navigation (for desktop).
 */
const NavigationSection = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <section>
      <div className="flex h-14 justify-between md:block md:h-auto md:w-60 md:shrink-0 md:grow-0 md:basis-60">
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

// node_modules
import { ChevronDoubleRightIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import Link from "./link-no-prefetch";

/**
 * Displays the link to an object page, with a double-right chevron icon.
 */
export default function ItemLink({ href, label = "" }) {
  return (
    <div className="mx-auto flex items-center justify-center">
      <Link
        href={href}
        className="hover:border-highlight-border hover:bg-highlight rounded-full border border-transparent px-0 py-2 sm:px-2"
        aria-label={label}
      >
        <ChevronDoubleRightIcon className="h-5 w-5 fill-gray-700 dark:fill-gray-300" />
      </Link>
    </div>
  );
}

ItemLink.propTypes = {
  // Path to item this links to
  href: PropTypes.string.isRequired,
  // Voice label for item; treat as required unless you have absolutely nothing
  label: PropTypes.string,
};

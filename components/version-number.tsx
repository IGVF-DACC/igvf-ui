// components
import Link from "./link-no-prefetch";

/**
 * Base version number Tailwind CSS classes.
 */
const baseClassName =
  "border-schema-version inline-block border bg-schema-version px-1 text-xs font-semibold text-schema-version no-underline";

/**
 * Displays a version number in a standardized form, within a gray box and starting with the letter
 * "v". If the version number does not start with "v", it will be prepended with "v" for display.
 * @param version - Version number to display, which might or might not start with "v"
 * @param path - Optional path to link to; if provided, the version number will be a link
 * @param className - Additional CSS classes to apply to the component
 */
export function VersionNumber({
  version = "",
  path = "",
  className = "",
}: {
  version?: string;
  path?: string;
  className?: string;
}) {
  // If `version` doesn't start with "v", prepend it
  let displayedVersion = "No version available";
  if (version) {
    displayedVersion = version.startsWith("v") ? version : `v${version}`;
  }

  if (path) {
    return (
      <Link href={path} className={`${baseClassName} ${className} rounded-xs`}>
        {displayedVersion}
      </Link>
    );
  }

  return (
    <div className={`${baseClassName} ${className}`}>{displayedVersion}</div>
  );
}

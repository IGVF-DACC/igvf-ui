/**
 * Maps the icon position to the corresponding Tailwind CSS classes to apply the proper padding.
 */
const iconPositionClasses = {
  left: "pl-0.5 pr-1.5",
  right: "pl-1.5 pr-0.5",
  "": "px-1.5",
};

/**
 * Wrapper component to standardize the look of all pill-style badges, that usually contain a small
 * icon and all-uppercase text. A common example is the badge to show object status.
 * @param className Additional classes to apply to the badge
 * @param testid data-testid attribute to apply to the badge
 * @param iconPosition Position of the icon in the badge -- "left", "right", or the empty string
 */
export function PillBadge({
  iconPosition = "",
  className = "",
  testid = "",
  children,
}: {
  iconPosition?: "left" | "right" | "";
  className?: string;
  testid?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-5 w-fit items-center whitespace-nowrap rounded-full border border-white text-xs font-semibold uppercase shadow-status ${className} ${iconPositionClasses[iconPosition]}`}
      data-testid={testid}
      role="status"
    >
      {children}
    </div>
  );
}

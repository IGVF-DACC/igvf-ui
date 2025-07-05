/**
 * Components to display pill badges that appear across the UI. This does not include status badges
 * which have their own module.
 */

// components
import { PillBadge } from "./pill-badge";

/**
 * Icon for the "uniformly processed" badge.
 * @param className Additional Tailwind CSS to apply to the icon
 */
function UniformlyProcessedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <path d="M9.2,9.2V3c-3.3.3-5.9,2.9-6.2,6.2h6.2Z" />
      <path d="M10.8,9.2h6.2c-.3-3.3-2.9-5.9-6.2-6.2v6.2Z" />
      <path d="M9.2,10.8H3c.3,3.3,2.9,5.9,6.2,6.2v-6.2Z" />
      <path d="M10.8,10.8v6.2c3.3-.3,5.9-2.9,6.2-6.2h-6.2Z" />
    </svg>
  );
}

/**
 * Displays a badge if at least one of the given workflows is a uniform pipeline.
 * @param className Additional Tailwind CSS to apply to the badge
 */
export function UniformlyProcessedBadge({
  className,
  label = "uniformly processed",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <PillBadge
      testid="uniform-pipeline-badge"
      className={`bg-amber-300 text-black ring-amber-500 dark:bg-amber-800 dark:text-white [&>svg]:fill-black dark:[&>svg]:fill-white ${className}`}
      iconPosition="left"
    >
      <UniformlyProcessedIcon className="h-4 w-4" />
      <div className="py-px">{label}</div>
    </PillBadge>
  );
}

/**
 * Icon for the "externally hosted" badge.
 * @param className Additional Tailwind CSS to apply to the icon
 */
function ExternallyHostedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <path d="M14.9,5.1c-2.7-2.7-7.2-2.7-9.9,0-2.7,2.7-2.7,7.2,0,9.9,2.7,2.7,7.2,2.7,9.9,0,2.7-2.7,2.7-7.2,0-9.9ZM14,11.8c0,.3,0,.5-.2.6s-.4.3-.6.3c-.2,0-.4,0-.6-.3,0,0-.2-.2-.2-.3,0-.1,0-.2,0-.3v-1.6s0-1.4,0-1.4l-.8.8-4.1,4.1c-.2.2-.4.3-.7.3-.2,0-.5,0-.6-.3s-.3-.4-.3-.6c0-.2.1-.5.3-.7l4.1-4.1.8-.8h-1.4c0,0-1.6,0-1.6,0-.1,0-.2,0-.3,0-.1,0-.2,0-.3-.2-.2-.2-.3-.4-.3-.6s0-.4.3-.6.4-.2.6-.2h4.9c.3,0,.5,0,.7.3s.3.4.3.7v4.9Z" />
    </svg>
  );
}

/**
 * Display a badge if files are hosted externally.
 * @param className Additional Tailwind CSS to apply to the badge
 */
export function ExternallyHostedBadge({ className }: { className?: string }) {
  return (
    <PillBadge
      testid="externally-hosted-badge"
      className={`bg-blue-200 text-black ring-blue-500 dark:bg-blue-800 dark:text-white [&>svg]:fill-black dark:[&>svg]:fill-white ${className}`}
      iconPosition="left"
    >
      <ExternallyHostedIcon className="h-4 w-4" />
      <div className="py-px">externally hosted</div>
    </PillBadge>
  );
}

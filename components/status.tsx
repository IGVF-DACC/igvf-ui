// node_modules
import { SVGProps } from "react";
import { twMerge } from "tailwind-merge";
// components
import { PillBadge } from "./pill-badge";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { toShishkebabCase } from "../lib/general";
// root
import { DatabaseObject } from "../globals";

/**
 * ADDING NEW STATUS VALUES
 *
 * To add a new status value:
 * 1. Add the new status value to the `StatusStyleKey` type.
 * 2. Design the icon for the new status by adding a new React component that returns the SVG
 *    path(s) for the icon. Add this component in the STATUS ICON GLYPHS section below.
 * 3. Design an SVG glyph for the new status following the guidelines
 * 4. Select the colors for the new status badge and define them in styles/theme/status.css and
 *    styles/utilities/status.css.
 */

/**
 * Props you can pass to the status icon component.
 *
 * @property className - CSS class names to apply to the icon component
 * @property style - CSS properties to apply to the icon component as a `style` attribute
 */
interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Styles and icons for every possible status value.
 *
 * @property styles - Tailwind CSS classes defining the colors for the status badge
 * @property Icon - Icon component to display within the status badge
 * @property colorValues - CSS variable names for status colors; use for non-standard status badges
 * @property style - CSS properties to apply to the Icon component as a `style` attribute
 */
interface StatusStyle {
  styles: string;
  Glyph: () => JSX.Element;
  colorValues: {
    bg: string;
    text: string;
    ring: string;
  };
  Icon: (props: IconProps) => JSX.Element;
}

/**
 * All possible status values, usually for database object `status` properties or file upload
 * statuses, but some other properties appear as status-like badges
 * property. Add to this list as well as `statusStyles` below when new status values
 * are added to the schemas.
 */
type StatusStyleKey =
  | "fallback"
  | "current"
  | "deleted"
  | "archived"
  | "disabled"
  | "filtered"
  | "standardized"
  | "in progress"
  | "released"
  | "replaced"
  | "revoked"
  | "validated"
  | "invalidated"
  | "file not found"
  | "pending"
  | "preview"
  | "validation exempted";

/**
 * STATUS ICON GLYPHS
 *
 * The following functions define the SVG glyphs to use for each status value. These need to be
 * rendered inside an <svg> element's coordinate system. Design these glyphs in a 20x20 viewBox.
 * Constrain the maximum width and height of the glyph itself within the viewBox to 14 pixels width
 * and height, and center it within the viewBox.
 */

function ArchivedGlyph() {
  return (
    <path d="M14.5,12.5c.1-.4.2-.8.2-1.3,0-2.6-2.1-4.7-4.7-4.7s-4.7,2.1-4.7,4.7,0,.9.2,1.3h-2.5v1h14v-1h-2.5Z" />
  );
}

function CurrentGlyph() {
  return <circle cx="10" cy="10" r="7" />;
}

function DeletedGlyph() {
  return (
    <polygon points="17,6.3 13.7,3 10,6.7 6.3,3 3,6.3 6.7,10 3,13.7 6.3,17 10,13.3 13.7,17 17,13.7 13.3,10 " />
  );
}

function DisabledGlyph() {
  return (
    <>
      <path d="M10,7.8l3.7-3.7C12.6,3.4,11.4,3,10,3S7.4,3.4,6.3,4.1L10,7.8z" />
      <path d="M15.9,13.7c0.7-1.1,1.1-2.4,1.1-3.7c0-1.4-0.4-2.6-1.1-3.7L12.2,10L15.9,13.7z" />
      <path d="M10,12.2l-3.7,3.7C7.4,16.6,8.6,17,10,17s2.6-0.4,3.7-1.1L10,12.2z" />
      <path d="M4.1,6.3C3.4,7.4,3,8.6,3,10c0,1.4,0.4,2.6,1.1,3.7L7.8,10L4.1,6.3z" />
    </>
  );
}

function FallbackGlyph() {
  return (
    <path
      d="M9.2,16.7l-5.9-5.9c-0.4-0.4-0.4-1.2,0-1.6l5.9-5.9c0.4-0.4,1.2-0.4,1.6,0l5.9,5.9c0.4,0.4,0.4,1.2,0,1.6l-5.9,5.9
	C10.4,17.1,9.6,17.1,9.2,16.7z"
    />
  );
}

function FileNotFoundGlyph() {
  return (
    <path
      d="M15.8,7.3l-3.1-3.1C12.6,4.1,12.4,4,12.2,4H4.7C4.3,4,4,4.3,4,4.7v10.6C4,15.7,4.3,16,4.7,16h10.6c0.3,0,0.7-0.3,0.7-0.7
	V7.8C16,7.6,15.9,7.4,15.8,7.3z M13.7,12.3l-1.4,1.4L10,11.4l-2.3,2.3l-1.4-1.4L8.6,10L6.3,7.7l1.4-1.4L10,8.6l2.3-2.3l1.4,1.4
	L11.4,10L13.7,12.3z"
    />
  );
}

function FilteredGlyph() {
  return (
    <>
      <path d="M10,3c-3.9,0-7,3.1-7,7s3.1,7,7,7,7-3.1,7-7-3.1-7-7-7ZM10,15.4c-3,0-5.4-2.4-5.4-5.4s2.4-5.4,5.4-5.4,5.4,2.4,5.4,5.4-2.4,5.4-5.4,5.4Z" />
      <g>
        <path d="M13,8.6h-6c-.3,0-.6-.3-.6-.6s.3-.6.6-.6h6c.3,0,.6.3.6.6s-.3.6-.6.6Z" />
        <path d="M12,11h-4c-.3,0-.6-.3-.6-.6s.3-.6.6-.6h4c.3,0,.6.3.6.6s-.3.6-.6.6Z" />
        <path d="M11.3,13.4h-2.5c-.3,0-.6-.3-.6-.6s.3-.6.6-.6h2.5c.3,0,.6.3.6.6s-.3.6-.6.6Z" />
      </g>
    </>
  );
}

function InProgressGlyph() {
  return (
    <path
      d="M10,17c3.9,0,7-3.1,7-7s-3.1-7-7-7s-7,3.1-7,7
	S6.1,17,10,17z M10,4.6c3,0,5.4,2.4,5.4,5.4S13,15.4,10,15.4V4.6z"
    />
  );
}

function InvalidatedGlyph() {
  return (
    <path
      d="M10,3c-3.9,0-7,3.1-7,7c0,3.9,3.1,7,7,7s7-3.1,7-7C17,6.1,13.9,3,10,3z M14.5,10c0,0.8-0.2,1.5-0.6,2.2l-2.3-2.3l2.2-2.2
	C14.2,8.4,14.5,9.2,14.5,10z M12.2,6.1L10,8.3L7.8,6.1C8.5,5.7,9.2,5.5,10,5.5S11.5,5.7,12.2,6.1z M6.1,12.2
	c-0.4-0.6-0.6-1.4-0.6-2.2c0-0.8,0.2-1.6,0.6-2.3l2.2,2.2L6.1,12.2z M7.7,13.8l2.3-2.3l2.3,2.3c-0.7,0.4-1.4,0.6-2.3,0.6
	S8.4,14.2,7.7,13.8z"
    />
  );
}

function PendingGlyph() {
  return (
    <path
      d="M17,10c0-3.9-3.1-7-7-7c-3.9,0-7,3.1-7,7s3.1,7,7,7
	C13.9,17,17,13.9,17,10z M4.6,10C4.6,7,7,4.6,10,4.6c3,0,5.4,2.4,5.4,5.4L4.6,10z"
    />
  );
}

function PreviewGlyph() {
  return (
    <>
      <path
        d="M3.1,10.4c0-.3,0-.6,0-.9,1.1-2.9,3.9-4.7,6.9-4.7s5.8,2,6.9,4.8c.1.3.1.6,0,.9-1.1,2.9-3.9,4.7-6.9,4.7s-5.8-2-6.9-4.8ZM13,10c0,1.6-1.3,3-3,3s-3-1.3-3-3,1.3-3,3-3,3,1.3,3,3Z"
        style={{ fillRule: "evenodd" }}
      />
      <circle cx="10" cy="10" r="2" />
    </>
  );
}

function ReleasedGlyph() {
  return <circle cx="10" cy="10" r="7" />;
}

function ReplacedGlyph() {
  return (
    <>
      <path
        d="M10,3c-3.9,0-7,3.1-7,7c0,3.9,3.1,7,7,7s7-3.1,7-7C17,6.1,13.9,3,10,3z M10,14.5c-2.5,0-4.5-2-4.5-4.5s2-4.5,4.5-4.5
		s4.5,2,4.5,4.5S12.5,14.5,10,14.5z"
      />
      <circle cx="10" cy="10" r="2.5" />
    </>
  );
}

function RevokedGlyph() {
  return (
    <polygon points="17,7.7 12.3,3 10,5.3 7.7,3 3,7.7 5.3,10 3,12.3 7.7,17 10,14.7 12.3,17 17,12.3 14.7,10 " />
  );
}

function StandardizedGlyph() {
  return (
    <>
      <path d="M10,3c-3.9,0-7,3.1-7,7s3.1,7,7,7,7-3.1,7-7-3.1-7-7-7ZM10,15.4c-3,0-5.4-2.4-5.4-5.4s2.4-5.4,5.4-5.4,5.4,2.4,5.4,5.4-2.4,5.4-5.4,5.4Z" />
      <g>
        <path d="M13,8.6h-6c-.3,0-.6-.3-.6-.6s.3-.6.6-.6h6c.3,0,.6.3.6.6s-.3.6-.6.6Z" />
        <path d="M12,11h-4c-.3,0-.6-.3-.6-.6s.3-.6.6-.6h4c.3,0,.6.3.6.6s-.3.6-.6.6Z" />
        <path d="M11.3,13.4h-2.5c-.3,0-.6-.3-.6-.6s.3-.6.6-.6h2.5c.3,0,.6.3.6.6s-.3.6-.6.6Z" />
      </g>
    </>
  );
}

function ValidatedGlyph() {
  return (
    <path
      d="M10,3c-3.9,0-7,3.1-7,7c0,3.9,3.1,7,7,7s7-3.1,7-7C17,6.1,13.9,3,10,3z M10,14.5c-2.5,0-4.5-2-4.5-4.5s2-4.5,4.5-4.5
	s4.5,2,4.5,4.5S12.5,14.5,10,14.5z"
    />
  );
}

function ValidationExemptedGlyph() {
  return (
    <>
      <path d="M5.8,8.5c.6-1.7,2.3-3,4.2-3s3.6,1.2,4.2,3h2.6c-.7-3.1-3.5-5.5-6.8-5.5s-6.1,2.3-6.8,5.5h2.6Z" />
      <path d="M14.2,11.5c-.6,1.7-2.3,3-4.2,3s-3.6-1.2-4.2-3h-2.6c.7,3.1,3.5,5.5,6.8,5.5s6.1-2.3,6.8-5.5h-2.6Z" />
    </>
  );
}

/**
 * Styles for each possible status value. As new status values get added to the schemas, add a
 * corresponding entry with its colors here. bg-[#xxxxxx] define the color of the badge background
 * while shadow-[#xxxxxx] define the color of the badge outline.
 */
const statusStyles: Record<StatusStyleKey, StatusStyle> = {
  archived: {
    styles: "status status-archived",
    Glyph: ArchivedGlyph,
    colorValues: {
      bg: "--color-status-archived-bg",
      text: "--color-status-archived-text",
      ring: "--color-status-archived-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <ArchivedGlyph />
      </svg>
    ),
  },

  current: {
    styles: "status status-current",
    Glyph: CurrentGlyph,
    colorValues: {
      bg: "--color-status-current-bg",
      text: "--color-status-current-text",
      ring: "--color-status-current-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <CurrentGlyph />
      </svg>
    ),
  },

  deleted: {
    styles: "status status-deleted",
    Glyph: DeletedGlyph,
    colorValues: {
      bg: "--color-status-deleted-bg",
      text: "--color-status-deleted-text",
      ring: "--color-status-deleted-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <DeletedGlyph />
      </svg>
    ),
  },

  disabled: {
    styles: "status status-disabled",
    Glyph: DisabledGlyph,
    colorValues: {
      bg: "--color-status-disabled-bg",
      text: "--color-status-disabled-text",
      ring: "--color-status-disabled-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <DisabledGlyph />
      </svg>
    ),
  },

  fallback: {
    styles: "status status-fallback",
    Glyph: FallbackGlyph,
    colorValues: {
      bg: "--color-status-fallback-bg",
      text: "--color-status-fallback-text",
      ring: "--color-status-fallback-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <FallbackGlyph />
      </svg>
    ),
  },

  "file not found": {
    styles: "status status-file-not-found",
    Glyph: FileNotFoundGlyph,
    colorValues: {
      bg: "--color-status-file-not-found-bg",
      text: "--color-status-file-not-found-text",
      ring: "--color-status-file-not-found-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className={twMerge("h-full", className)}
        style={style}
      >
        <FileNotFoundGlyph />
      </svg>
    ),
  },

  filtered: {
    styles: "status status-filtered",
    Glyph: FilteredGlyph,
    colorValues: {
      bg: "--color-status-filtered-bg",
      text: "--color-status-filtered-text",
      ring: "--color-status-filtered-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <FilteredGlyph />
      </svg>
    ),
  },

  "in progress": {
    styles: "status status-in-progress",
    Glyph: InProgressGlyph,
    colorValues: {
      bg: "--color-status-in-progress-bg",
      text: "--color-status-in-progress-text",
      ring: "--color-status-in-progress-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <InProgressGlyph />
      </svg>
    ),
  },

  invalidated: {
    styles: "status status-invalidated",
    Glyph: InvalidatedGlyph,
    colorValues: {
      bg: "--color-status-invalidated-bg",
      text: "--color-status-invalidated-text",
      ring: "--color-status-invalidated-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <InvalidatedGlyph />
      </svg>
    ),
  },

  pending: {
    styles: "status status-pending",
    Glyph: PendingGlyph,
    colorValues: {
      bg: "--color-status-pending-bg",
      text: "--color-status-pending-text",
      ring: "--color-status-pending-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <PendingGlyph />
      </svg>
    ),
  },

  preview: {
    styles: "status status-preview",
    Glyph: PreviewGlyph,
    colorValues: {
      bg: "--color-status-preview-bg",
      text: "--color-status-preview-text",
      ring: "--color-status-preview-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <PreviewGlyph />
      </svg>
    ),
  },

  released: {
    styles: "status status-released",
    Glyph: ReleasedGlyph,
    colorValues: {
      bg: "--color-status-released-bg",
      text: "--color-status-released-text",
      ring: "--color-status-released-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <ReleasedGlyph />
      </svg>
    ),
  },

  replaced: {
    styles: "status status-replaced",
    Glyph: ReplacedGlyph,
    colorValues: {
      bg: "--color-status-replaced-bg",
      text: "--color-status-replaced-text",
      ring: "--color-status-replaced-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <ReplacedGlyph />
      </svg>
    ),
  },

  revoked: {
    styles: "status status-revoked",
    Glyph: RevokedGlyph,
    colorValues: {
      bg: "--color-status-revoked-bg",
      text: "--color-status-revoked-text",
      ring: "--color-status-revoked-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <RevokedGlyph />
      </svg>
    ),
  },

  standardized: {
    styles: "status status-standardized",
    Glyph: StandardizedGlyph,
    colorValues: {
      bg: "--color-status-standardized-bg",
      text: "--color-status-standardized-text",
      ring: "--color-status-standardized-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <StandardizedGlyph />
      </svg>
    ),
  },

  validated: {
    styles: "status status-validated",
    Glyph: ValidatedGlyph,
    colorValues: {
      bg: "--color-status-validated-bg",
      text: "--color-status-validated-text",
      ring: "--color-status-validated-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <ValidatedGlyph />
      </svg>
    ),
  },

  "validation exempted": {
    styles: "status status-validation-exempted",
    Glyph: ValidationExemptedGlyph,
    colorValues: {
      bg: "--color-status-validation-exempted-bg",
      text: "--color-status-validation-exempted-text",
      ring: "--color-status-validation-exempted-ring",
    },
    Icon: ({ className = "", style = {} }: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={twMerge("h-full", className)}
        style={style}
      >
        <ValidationExemptedGlyph />
      </svg>
    ),
  },
};

/**
 * Type guard to check if `status` is a valid key in `statusStyles`.
 *
 * @param status - Status string coming from outside this module
 * @returns True if `status` has a corresponding style in this module
 */
function isValidStatusStyleKey(status: string): status is StatusStyleKey {
  return status in statusStyles;
}

/**
 * Get the Tailwind CSS classes and icon component corresponding to a given status. If the status
 * is not recognized, return the styles and icon for the fallback status.
 *
 * @param status - Object status value
 * @returns Tailwind CSS string and icon component corresponding to the status
 */
export function getStatusStyleAndIcon(status: string): StatusStyle {
  return isValidStatusStyleKey(status)
    ? statusStyles[status]
    : statusStyles.fallback;
}

/**
 * Displays all possible status values with their corresponding styles and icons, for testing
 * purposes. It displays a row of status badges, and then a row of abbreviated status badges.
 */
export function StatusTester() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(statusStyles).map((status) => (
          <Status key={status} status={status} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(statusStyles).map((status) => (
          <Status key={status} status={status} isAbbreviated />
        ))}
      </div>
    </div>
  );
}

/**
 * Displays the status of any object. If new statuses get added, define their colors in the
 * `statusStyles` object above.
 *
 * @param status - Object status value
 * @param isAbbreviated - True to display just the status icon in a badge without the text
 */
export default function Status({
  status,
  isAbbreviated = false,
}: {
  status: string;
  isAbbreviated?: boolean;
}) {
  const tooltipAttr = useTooltip(`status-${toShishkebabCase(status)}`);

  // Get the styles corresponding to the given status; use fallback if an unknown status is given.
  const { styles, Icon } = getStatusStyleAndIcon(status);

  if (isAbbreviated) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <div
            className={`h-5 w-5 rounded-full border border-white ring ${styles}`}
            data-testid={`status-abbr-${status.replace(/\s/g, "-")}`}
          >
            <Icon />
          </div>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipAttr}>{status}</Tooltip>
      </>
    );
  }

  return (
    <PillBadge
      className={styles}
      testid={`status-pill-${status.replace(/\s/g, "-")}`}
      iconPosition="left"
    >
      <Icon />
      <div className="pt-px">{status}</div>
    </PillBadge>
  );
}

/**
 * Display a banner at the top of the summary panel to give details about the meaning of the object
 * preview status.
 *
 * @param item - Database object with status
 * @param className - Additional class names to apply to the wrapper div
 */
export function StatusPreviewDetail({
  item,
  className,
}: {
  item: DatabaseObject;
  className?: string;
}) {
  if (item.status === "preview") {
    return (
      <div
        className={twMerge(
          "border-panel border-t border-r border-l",
          className
        )}
      >
        <div className="bg-amber-300 px-2 py-0.5 text-center text-sm text-black dark:bg-amber-700 dark:text-white">
          This object is in preview status. Metadata is subject to change until
          this object is released.
        </div>
      </div>
    );
  }
  return null;
}

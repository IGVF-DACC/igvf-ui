// node_modules
import { EyeIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import { PillBadge } from "./pill-badge";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { toShishkebabCase } from "../lib/general";

/**
 * Styles for each possible status value. As new status values get added to the schemas, add a
 * corresponding entry with its colors here. bg-[#xxxxxx] define the color of the badge background
 * while shadow-[#xxxxxx] define the color of the badge outline.
 */
const statusStyles = {
  fallback: {
    styles: "bg-[#d0d0d0] text-black shadow-[#a0a0a0] [&>svg]:fill-black",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path
          d="M9.2,16.7l-5.9-5.9c-0.4-0.4-0.4-1.2,0-1.6l5.9-5.9c0.4-0.4,1.2-0.4,1.6,0l5.9,5.9c0.4,0.4,0.4,1.2,0,1.6l-5.9,5.9
	C10.4,17.1,9.6,17.1,9.2,16.7z"
        />
      </svg>
    ),
  },

  current: {
    styles: "bg-[#00a99d] text-white shadow-[#007f76] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <circle cx="10" cy="10" r="7" />
      </svg>
    ),
  },

  deleted: {
    styles: "bg-[#ed1c24] text-white shadow-[#c6171d] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <polygon points="17,6.3 13.7,3 10,6.7 6.3,3 3,6.3 6.7,10 3,13.7 6.3,17 10,13.3 13.7,17 17,13.7 13.3,10 " />
      </svg>
    ),
  },

  archived: {
    styles: "bg-[#c09e62] text-black shadow-[#997e4e] [&>svg]:fill-black",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path d="M3,14.5c0-3.9,3.1-7,7-7s7,3.1,7,7H3z" />
      </svg>
    ),
  },

  disabled: {
    styles: "bg-[#ed145b] text-white shadow-[#c4114b] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path d="M10,7.8l3.7-3.7C12.6,3.4,11.4,3,10,3S7.4,3.4,6.3,4.1L10,7.8z" />
        <path d="M15.9,13.7c0.7-1.1,1.1-2.4,1.1-3.7c0-1.4-0.4-2.6-1.1-3.7L12.2,10L15.9,13.7z" />
        <path d="M10,12.2l-3.7,3.7C7.4,16.6,8.6,17,10,17s2.6-0.4,3.7-1.1L10,12.2z" />
        <path d="M4.1,6.3C3.4,7.4,3,8.6,3,10c0,1.4,0.4,2.6,1.1,3.7L7.8,10L4.1,6.3z" />
      </svg>
    ),
  },

  "in progress": {
    styles: "bg-[#0072bc] text-white shadow-[#00578f] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path
          d="M10,17c3.9,0,7-3.1,7-7s-3.1-7-7-7s-7,3.1-7,7
	S6.1,17,10,17z M10,4.6c3,0,5.4,2.4,5.4,5.4S13,15.4,10,15.4V4.6z"
        />
      </svg>
    ),
  },

  released: {
    styles: "bg-[#00a651] text-white shadow-[#007d3d] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <circle cx="10" cy="10" r="7" />
      </svg>
    ),
  },

  replaced: {
    styles: "bg-[#f26522] text-white shadow-[#cd541b] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path
          d="M10,3c-3.9,0-7,3.1-7,7c0,3.9,3.1,7,7,7s7-3.1,7-7C17,6.1,13.9,3,10,3z M10,14.5c-2.5,0-4.5-2-4.5-4.5s2-4.5,4.5-4.5
		s4.5,2,4.5,4.5S12.5,14.5,10,14.5z"
        />
        <circle cx="10" cy="10" r="2.5" />
      </svg>
    ),
  },

  revoked: {
    styles: "bg-[#ed145b] text-white shadow-[#c4114b] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <polygon
          id="revoked"
          points="17,7.7 12.3,3 10,5.3 7.7,3 3,7.7 5.3,10 3,12.3 7.7,17 10,14.7 12.3,17 17,12.3 14.7,10 "
        />
      </svg>
    ),
  },

  validated: {
    styles: "bg-[#00a651] text-white shadow-[#007d3d] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path
          d="M10,3c-3.9,0-7,3.1-7,7c0,3.9,3.1,7,7,7s7-3.1,7-7C17,6.1,13.9,3,10,3z M10,14.5c-2.5,0-4.5-2-4.5-4.5s2-4.5,4.5-4.5
	s4.5,2,4.5,4.5S12.5,14.5,10,14.5z"
        />
      </svg>
    ),
  },

  invalidated: {
    styles: "bg-[#ed145b] text-white shadow-[#c4114b] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path
          d="M10,3c-3.9,0-7,3.1-7,7c0,3.9,3.1,7,7,7s7-3.1,7-7C17,6.1,13.9,3,10,3z M14.5,10c0,0.8-0.2,1.5-0.6,2.2l-2.3-2.3l2.2-2.2
	C14.2,8.4,14.5,9.2,14.5,10z M12.2,6.1L10,8.3L7.8,6.1C8.5,5.7,9.2,5.5,10,5.5S11.5,5.7,12.2,6.1z M6.1,12.2
	c-0.4-0.6-0.6-1.4-0.6-2.2c0-0.8,0.2-1.6,0.6-2.3l2.2,2.2L6.1,12.2z M7.7,13.8l2.3-2.3l2.3,2.3c-0.7,0.4-1.4,0.6-2.3,0.6
	S8.4,14.2,7.7,13.8z"
        />
      </svg>
    ),
  },

  "file not found": {
    styles: "bg-[#ed145b] text-white shadow-[#c4114b] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path
          d="M15.8,7.3l-3.1-3.1C12.6,4.1,12.4,4,12.2,4H4.7C4.3,4,4,4.3,4,4.7v10.6C4,15.7,4.3,16,4.7,16h10.6c0.3,0,0.7-0.3,0.7-0.7
	V7.8C16,7.6,15.9,7.4,15.8,7.3z M13.7,12.3l-1.4,1.4L10,11.4l-2.3,2.3l-1.4-1.4L8.6,10L6.3,7.7l1.4-1.4L10,8.6l2.3-2.3l1.4,1.4
	L11.4,10L13.7,12.3z"
        />
      </svg>
    ),
  },

  pending: {
    styles: "bg-[#0072bc] text-white shadow-[#00578f] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-fallback"
        className="h-full"
      >
        <path
          d="M17,10c0-3.9-3.1-7-7-7c-3.9,0-7,3.1-7,7s3.1,7,7,7
	C13.9,17,17,13.9,17,10z M4.6,10C4.6,7,7,4.6,10,4.6c3,0,5.4,2.4,5.4,5.4L4.6,10z"
        />
      </svg>
    ),
  },

  preview: {
    styles:
      "bg-amber-300 text-black dark:bg-amber-700 dark:text-white shadow-amber-400 [&>svg]:fill-black dark:[&>svg]:fill-white dark:shadow-amber-600",
    Icon: () => <EyeIcon className="mx-0.5 h-4 w-4" />,
  },

  "validation exempted": {
    styles: "bg-[#00a651] text-white shadow-[#007d3d] [&>svg]:fill-white",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="fill-status-validation-exempted"
        className="h-full"
      >
        <path d="M5.8,8.5c.6-1.7,2.3-3,4.2-3s3.6,1.2,4.2,3h2.6c-.7-3.1-3.5-5.5-6.8-5.5s-6.1,2.3-6.8,5.5h2.6Z" />
        <path d="M14.2,11.5c-.6,1.7-2.3,3-4.2,3s-3.6-1.2-4.2-3h-2.6c.7,3.1,3.5,5.5,6.8,5.5s6.1-2.3,6.8-5.5h-2.6Z" />
      </svg>
    ),
  },
};

/**
 * Displays the status of any object. If new statuses get added, define their colors in the
 * `statusStyles` object above.
 */
export default function Status({ status, isAbbreviated = false }) {
  const tooltipAttr = useTooltip(`status-${toShishkebabCase(status)}`);

  const stylesForStatus = statusStyles[status] || statusStyles.fallback;
  const { styles, Icon } = stylesForStatus;

  if (isAbbreviated) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <div
            className={`h-5 w-5 rounded-full border border-white shadow-status ${styles}`}
            data-testid={`status-pill-${status.replace(/\s/g, "-")}`}
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
      <Icon className="ml-[-8px]" />
      <div className="pt-px">{status}</div>
    </PillBadge>
  );
}

Status.propTypes = {
  // Status of item
  status: PropTypes.string.isRequired,
  // Whether to display the status in abbreviated form
  isAbbreviated: PropTypes.bool,
};

/**
 * Display a banner at the top of the summary panel to give details about the meaning of the object
 * preview status.
 */
export function StatusPreviewDetail({ item }) {
  if (item.status === "preview") {
    return (
      <div className="${className} border-l border-r border-t border-panel">
        <div className="bg-amber-300 px-2 py-0.5 text-center text-sm text-black dark:bg-amber-700 dark:text-white">
          This object is in preview status. Metadata is subject to change until
          this object is released.
        </div>
      </div>
    );
  }
  return null;
}

StatusPreviewDetail.propTypes = {
  // Object with status
  item: PropTypes.object.isRequired,
};

// node_modules
import PropTypes from "prop-types";

/**
 * Styles for each possible status value. As new status values get added to the schemas, add a
 * corresponding entry with its colors here. bg-[#xxxxxx] define the color of the badge background
 * while shadow-[#xxxxxx] define the color of the badge outline.
 */
const statusStyles = {
  fallback: "bg-[#d0d0d0] text-black shadow-[#a0a0a0]",
  current: "bg-[#00a99d] text-white shadow-[#007f76]",
  deleted: "bg-[#ed1c24] text-white shadow-[#c6171d]",
  disabled: "bg-[#ed145b] text-white shadow-[#c4114b]",
  "in progress": "bg-[#0072bc] text-white shadow-[#00578f]",
  released: "bg-[#00a651] text-white shadow-[#007d3d]",
  replaced: "bg-[#f26522] text-white shadow-[#cd541b]",
  revoked: "bg-[#ed145b] text-white shadow-[#c4114b]",
  validated: "bg-[#00a651] text-white shadow-[#007d3d]",
  invalidated: "bg-[#ed145b] text-white shadow-[#c4114b]",
  "file not found": "bg-[#ed145b] text-white shadow-[#c4114b]",
  pending: "bg-[#0072bc] text-white shadow-[#00578f]",
};

/**
 * Displays the status of any object. If new statuses get added, define their colors in the
 * `statusStyles` object above.
 */
export default function Status({ status }) {
  const statusClass = statusStyles[status] || statusStyles.fallback;
  return (
    <div
      className={`h-5 w-fit whitespace-nowrap rounded-full border border-white px-2 pt-px text-xs font-semibold uppercase shadow-status ${statusClass}`}
      data-testid={`status-pill-${status.replace(/\s/g, "-")}`}
    >
      {status}
    </div>
  );
}

Status.propTypes = {
  // Status of item
  status: PropTypes.string.isRequired,
};

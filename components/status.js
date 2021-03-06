// node_modules
import PropTypes from "prop-types";

/**
 * Styles for each possible status value. As new status values get added to the schemas, add a
 * corresponding entry with its colors here. bg-[#xxxxxx] define the color of the badge background
 * while shadoow-[#xxxxxx] define the color of the badge outline.
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
};

/**
 * Displays the status of any object. If new statuses get added, define their colors in the
 * `statusStyles` object above.
 */
const Status = ({ status }) => {
  const statusClass = statusStyles[status] || statusStyles.fallback;
  return (
    <div
      className={`my-0.5 mx-px w-fit whitespace-nowrap rounded-full border border-white px-2 py-0 text-xs font-semibold uppercase shadow-status ${statusClass}`}
    >
      {status}
    </div>
  );
};

Status.propTypes = {
  // Status of item
  status: PropTypes.string.isRequired,
};

export default Status;

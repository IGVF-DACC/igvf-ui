/**
 * Defines icons not available in Heroicons. You normally use this by importing the Icon default
 * component and specifying the icon name as a property of Icon.
 */

import PropTypes from "prop-types";
/* istanbul ignore file */

const Icon = {
  Award: ({ className = null, testid = "icon-award" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M18.3,7.5l-1-1.3c-0.1-0.2-0.2-0.4-0.2-0.7V3.8c0-0.5-0.3-0.9-0.8-1.1l-1.6-0.5c-0.2-0.1-0.4-0.2-0.6-0.4
	l-1-1.3c-0.3-0.4-0.8-0.6-1.3-0.4l-1.6,0.5c-0.2,0.1-0.5,0.1-0.7,0L8.1,0.1c-0.5-0.2-1,0-1.3,0.4l-1,1.3C5.7,2,5.5,2.1,5.3,2.2
	L3.7,2.7C3.2,2.9,2.9,3.3,2.9,3.8v1.6c0,0.2-0.1,0.5-0.2,0.7l-1,1.3c-0.3,0.4-0.3,0.9,0,1.3l1,1.3c0.1,0.2,0.2,0.4,0.2,0.7v1.6
	c0,0.5,0.3,0.9,0.8,1.1l0.9,0.3L3.3,18c-0.1,0.3,0.1,0.5,0.4,0.5L6,18.1c0.1,0,0.2,0,0.3,0.1l1.6,1.7c0.2,0.2,0.5,0.1,0.6-0.1l1.3-4
	c0.1,0,0.2,0,0.4,0l1.3,4c0.1,0.3,0.4,0.3,0.6,0.1l1.6-1.7c0.1-0.1,0.2-0.1,0.3-0.1l2.3,0.4c0.3,0,0.5-0.2,0.4-0.5l-1.4-4.2l0.9-0.3
	c0.5-0.2,0.8-0.6,0.8-1.1v-1.6c0-0.2,0.1-0.5,0.2-0.7l1-1.3C18.6,8.4,18.6,7.9,18.3,7.5z M10,13.8c-3.1,0-5.7-2.5-5.7-5.7
	S6.9,2.5,10,2.5s5.7,2.5,5.7,5.7S13.1,13.8,10,13.8z"
      />
      <polygon points="10,3.6 11.4,6.5 14.4,6.9 12.2,9 12.7,12.1 10,10.6 7.3,12.1 7.8,9 5.6,6.9 8.6,6.5 " />
    </svg>
  ),
  Circle: ({ className = null, testid = "icon-circle" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <circle cx="10" cy="10" r="10" />
    </svg>
  ),
  Donor: ({ className = null, testid = "icon-donor" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M15,1.4H5L0,10l5,8.6h10l5-8.6L15,1.4z M13.3,12.1l-0.7,0.6v4.9H7.5v-4.9L6.7,12V7.8c0-0.9,0.7-1.6,1.6-1.6H10
	c-1,0-1.9-0.8-1.9-1.9c0-1,0.8-1.9,1.9-1.9s1.9,0.8,1.9,1.9c0,1-0.8,1.9-1.9,1.9h1.7c0.9,0,1.6,0.7,1.6,1.6V12.1z"
      />
    </svg>
  ),
  FileSet: ({ className = null, testid = "icon-fileset" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M17.5,4.7h-6.2V4.4c0-1.4-1.1-2.5-2.5-2.5H2.5C1.1,1.9,0,3,0,4.4v2.7c0,0,0,0,0,0.1c0,0,0,0,0,0.1v8.1
	c0,1.4,1.1,2.5,2.5,2.5h15.1c1.4,0,2.5-1.1,2.5-2.5V7.2C20,5.8,18.9,4.7,17.5,4.7z M8.6,13.2c0,0.7-0.5,1.2-1.2,1.2H4.7
	c-0.7,0-1.2-0.5-1.2-1.2V9.3c0-0.7,0.5-1.2,1.2-1.2h2.7c0.7,0,1.2,0.5,1.2,1.2V13.2z M16.5,13.2c0,0.7-0.5,1.2-1.2,1.2h-2.7
	c-0.7,0-1.2-0.5-1.2-1.2V9.3c0-0.7,0.5-1.2,1.2-1.2h2.7c0.7,0,1.2,0.5,1.2,1.2V13.2z"
      />
    </svg>
  ),
  Filter: ({ className = null, testid = "icon-filter" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <g className="stroke-[1.5]">
        <circle cx="10" cy="10" r="9.2" />
        <g style={{ strokeLinecap: "round" }}>
          <line x1="5.4" y1="8.1" x2="14.6" y2="8.1" />
          <line x1="7" y1="10.6" x2="13" y2="10.6" />
          <line x1="8.1" y1="13.2" x2="11.9" y2="13.2" />
        </g>
      </g>
    </svg>
  ),
  Gene: ({ className = null, testid = "icon-gene" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      stroke="currentColor"
      fill="none"
      data-testid={testid}
    >
      <path
        d="M14.2,1
	c-2.2,2.2,2.6,7,0.4,9.2c-2.2,2.2-7-2.6-9.2-0.4s2.6,7,0.4,9.2"
      />
      <path
        d="M1,14.2
	c2.2-2.2,7,2.6,9.2,0.4c2.2-2.2-2.6-7-0.4-9.2s7,2.6,9.2,0.4"
      />
    </svg>
  ),
  EllipsisHorizontal: ({
    className = null,
    testid = "icon-ellipsis-horizontal",
  }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 36 8"
      fill="currentColor"
      data-testid={testid}
    >
      <circle cx="18" cy="4" r="3.4" />
      <circle cx="31.6" cy="4" r="3.4" />
      <circle cx="4.4" cy="4" r="3.4" />
    </svg>
  ),
  Sample: ({ className = null, testid = "icon-sample" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M16.6,0h-1.5H5.3H3.8v1.2h1.5v3.7V11v4.1c0,2.7,2.2,4.9,4.9,4.9s4.9-2.2,4.9-4.9V11V4.9V1.2h1.5V0z M13.7,7H6.6
      V1.2h7.1V7z"
      />
    </svg>
  ),
  Splat: ({ className = null, testid = "icon-splat" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M19,14c0,0.6-0.2,1.1-0.6,1.4C18,15.8,17.5,16,17,16c-0.6,0-1.1-0.2-1.6-0.5c-0.5-0.3-1.2-1-2.2-2
		c-1.1-1.1-1.9-1.9-2.5-2.2c0,0.6,0.2,1.7,0.6,3.1c0.4,1.5,0.6,2.5,0.6,3.2c0,0.7-0.2,1.3-0.6,1.7C11.1,19.8,10.6,20,10,20
		c-0.6,0-1.1-0.2-1.5-0.7c-0.4-0.4-0.6-1-0.6-1.7c0-0.6,0.2-1.7,0.6-3.2C9,13,9.2,12,9.2,11.4c-0.5,0.3-1.4,1-2.5,2.2
		c-1,1-1.7,1.7-2.2,2C4.1,15.8,3.6,16,3,16c-0.5,0-1-0.2-1.4-0.6C1.2,15,1,14.5,1,14c0-0.6,0.2-1.1,0.7-1.6C2.3,12,3.5,11.5,5.4,11
		c1.5-0.4,2.5-0.7,3-1c-0.5-0.3-1.5-0.6-3-1C3.6,8.6,2.4,8.1,1.8,7.6C1.3,7.1,1,6.6,1,6c0-0.6,0.2-1,0.6-1.4C2,4.2,2.5,4,3,4
		c0.5,0,1,0.2,1.5,0.5c0.5,0.3,1.3,1,2.3,2.1c1.1,1.1,1.9,1.8,2.4,2.1C9.2,8.1,9,7,8.6,5.5C8.1,4,7.9,3,7.9,2.4
		c0-0.7,0.2-1.3,0.6-1.7C8.9,0.2,9.4,0,10,0c0.6,0,1.1,0.2,1.5,0.6c0.4,0.4,0.6,1,0.6,1.7c0,0.6-0.2,1.7-0.6,3.2
		C11,7,10.8,8.1,10.8,8.7c0.5-0.3,1.3-1,2.4-2.1c1-1.1,1.8-1.8,2.3-2.1S16.5,4,17,4c0.5,0,1,0.2,1.4,0.6S19,5.4,19,6
		c0,0.6-0.3,1.2-0.8,1.6c-0.5,0.5-1.7,0.9-3.6,1.4c-1.5,0.4-2.5,0.7-3,1c0.5,0.3,1.5,0.6,3.1,1c1.9,0.5,3.1,0.9,3.6,1.4
		C18.7,12.9,19,13.4,19,14z"
      />
    </svg>
  ),
  TableColumnsHidden: ({
    className = null,
    testid = "icon-table-columns-hidden",
  }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <rect x="0" y="7.5" width="6" height="5" />
      <path d="M12,8.5v3H8v-3H12 M13,7.5H7v5h6V7.5L13,7.5z" />
      <rect x="14" y="7.5" width="6" height="5" />
    </svg>
  ),
  TableColumnsVisible: ({
    className = null,
    testid = "icon-table-columns-visible",
  }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <rect x="0" y="8" width="6" height="4" />
      <rect x="7" y="8" width="6" height="4" />
      <rect x="14" y="8" width="6" height="4" />
    </svg>
  ),
  Treatment: ({ className = null, testid = "icon-treatment" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path d="M3.4,19.4c-0.8,0.8-2,0.8-2.8,0c-0.8-0.8-0.8-2,0-2.8s3.8-1,4.6-1.9C4.4,15.6,4.1,18.7,3.4,19.4z" />
      <path d="M18.9,1.1c-1.5-1.5-3.8-1.5-5.3,0l-3.2,3.2l5.3,5.3l3.2-3.2C20.4,4.9,20.4,2.6,18.9,1.1z" />
      <path
        className="fill-transparent stroke-current"
        d="M11.4,5c0,0-4.4,4.4-5.3,5.3c-0.9,0.9-0.1,2.3-0.2,3.8c1.6-0.1,2.9,0.7,3.8-0.2C10.6,13,15,8.6,15,8.6"
      />
    </svg>
  ),
};

/**
 * List all icon PropTypes here.
 */
Icon.Award.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Circle.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Donor.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.EllipsisHorizontal.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.FileSet.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Filter.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Gene.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Sample.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Splat.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.TableColumnsHidden.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.TableColumnsVisible.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Treatment.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};

export default Icon;

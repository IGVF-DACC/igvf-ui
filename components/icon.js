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
  Brand: ({ className = null, testid = "icon-brand" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <g className="fill-brand">
        <path
          d="M10,20C4.5,20,0,15.5,0,10C0,4.5,4.5,0,10,0c5.5,0,10,4.5,10,10C20,15.5,15.5,20,10,20z M10,2.8
		C6,2.8,2.8,6,2.8,10c0,4,3.2,7.2,7.2,7.2c4,0,7.2-3.2,7.2-7.2C17.2,6,14,2.8,10,2.8z"
        />
        <path d="M12.7,10.2l1.4,1.4V5.3c-0.8-0.7-1.8-1.2-2.8-1.4v7.7L12.7,10.2z" />
        <path d="M7.3,8.7l1.4-1.4V3.9c-1.1,0.2-2,0.7-2.8,1.4v2.1L7.3,8.7z" />
        <path d="M7.3,9.8L5.9,8.4v6.3c0.8,0.7,1.8,1.2,2.8,1.4V8.4L7.3,9.8z" />
      </g>
      <path
        className="fill-brand-accent"
        d="M12.7,11.3l-1.4,1.4v3.5c1.1-0.2,2-0.7,2.8-1.4v-2.1L12.7,11.3z"
      />
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
  Data: ({ className = null, testid = "icon-data" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M16.8,3H3.2C2.5,3,2,3.5,2,4.2v8.6C2,13.5,2.5,14,3.2,14h4.9c-0.3,0.9-0.6,1.5-1.1,2.2C6.7,16.6,7,17,7.4,17h5.2
	c0.4,0,0.7-0.5,0.4-0.8c-0.5-0.7-0.8-1.3-1.1-2.2h4.9c0.7,0,1.2-0.5,1.2-1.2V4.2C18,3.5,17.5,3,16.8,3z M16.8,11.3
	c0,0.3-0.2,0.5-0.5,0.5H3.8c-0.3,0-0.5-0.2-0.5-0.5V4.7c0-0.3,0.2-0.5,0.5-0.5h12.5c0.3,0,0.5,0.2,0.5,0.5V11.3z"
      />
      <path d="M6.7,6H4.5C4.2,6,4,5.7,4,5.4v0c0-0.3,0.2-0.5,0.5-0.5h2.2c0.3,0,0.5,0.2,0.5,0.5v0C7.2,5.7,7,6,6.7,6z" />
      <path d="M15.5,6h-7C8.2,6,8,5.7,8,5.4v0c0-0.3,0.2-0.5,0.5-0.5h7c0.3,0,0.5,0.2,0.5,0.5v0C16,5.7,15.8,6,15.5,6z" />
      <path d="M10.7,11H4.5C4.2,11,4,10.8,4,10.5v0C4,10.2,4.2,10,4.5,10h6.2c0.3,0,0.5,0.2,0.5,0.5v0C11.2,10.8,10.9,11,10.7,11z" />
      <path d="M15.5,11h-3.1c-0.3,0-0.5-0.2-0.5-0.5v0c0-0.3,0.2-0.5,0.5-0.5h3.1c0.3,0,0.5,0.2,0.5,0.5v0C16,10.8,15.8,11,15.5,11z" />
      <path d="M10,9.3H7.3C7,9.3,6.8,9.1,6.8,8.8v0c0-0.3,0.2-0.5,0.5-0.5H10c0.3,0,0.5,0.2,0.5,0.5v0C10.5,9.1,10.2,9.3,10,9.3z" />
      <path d="M5.5,9.3h-1C4.2,9.3,4,9.1,4,8.8v0c0-0.3,0.2-0.5,0.5-0.5h1C5.8,8.3,6,8.6,6,8.8v0C6,9.1,5.8,9.3,5.5,9.3z" />
      <path d="M15.5,9.3h-3.7c-0.3,0-0.5-0.2-0.5-0.5v0c0-0.3,0.2-0.5,0.5-0.5h3.7c0.3,0,0.5,0.2,0.5,0.5v0C16,9.1,15.8,9.3,15.5,9.3z" />
      <path d="M7.9,7.6H4.5C4.2,7.6,4,7.4,4,7.1v0c0-0.3,0.2-0.5,0.5-0.5h3.4c0.3,0,0.5,0.2,0.5,0.5v0C8.4,7.4,8.2,7.6,7.9,7.6z" />
      <path d="M12.2,7.6H9.7c-0.3,0-0.5-0.2-0.5-0.5v0c0-0.3,0.2-0.5,0.5-0.5h2.5c0.3,0,0.5,0.2,0.5,0.5v0C12.7,7.4,12.5,7.6,12.2,7.6z" />
      <path d="M15.5,7.6H14c-0.3,0-0.5-0.2-0.5-0.5v0c0-0.3,0.2-0.5,0.5-0.5h1.5c0.3,0,0.5,0.2,0.5,0.5v0C16,7.4,15.8,7.6,15.5,7.6z" />
    </svg>
  ),
  DataModel: ({ className = null, testid = "icon-data-model" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M17.2,11.9H16l-3.6-3.8C12.8,7.9,13,7.6,13,7.3V2.9c0-0.5-0.4-0.8-0.8-0.8H7.8C7.4,2.1,7,2.5,7,2.9v4.4
	c0,0.4,0.2,0.6,0.5,0.8L4,11.9H2.8c-0.5,0-0.8,0.4-0.8,0.8v4.4c0,0.5,0.4,0.8,0.8,0.8h4.4c0.5,0,0.8-0.4,0.8-0.8v-4.4
	c0-0.5-0.4-0.8-0.8-0.8H6l3.5-3.8h0.9l3.5,3.8h-1.2c-0.5,0-0.8,0.4-0.8,0.8v4.4c0,0.5,0.4,0.8,0.8,0.8h4.4c0.5,0,0.8-0.4,0.8-0.8
	v-4.4C18,12.3,17.6,11.9,17.2,11.9z"
      />
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
  Methodology: ({ className = null, testid = "icon-methodology" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <circle cx="10" cy="4.5" r="2.5" />
      <circle cx="15.5" cy="10" r="2.5" />
      <circle cx="10" cy="15.5" r="2.5" />
      <circle cx="4.5" cy="10" r="2.5" />
      <path d="M16,16H4V4h12V16z M5,15h10V5H5V15z" />
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
  Twitter: ({ className = null, testid = "icon-twitter" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="#1DA1F2"
      data-testid={testid}
    >
      <path
        d="M20,3.8c-0.7,0.3-1.5,0.5-2.4,0.6c0.8-0.5,1.5-1.3,1.8-2.3c-0.8,0.5-1.7,0.8-2.6,1c-0.7-0.8-1.8-1.3-3-1.3
	c-2.6,0-4.6,2.5-4,5C6.4,6.7,3.4,5.1,1.4,2.6C0.3,4.5,0.8,6.9,2.7,8.1C2,8.1,1.4,7.9,0.8,7.6c0,1.9,1.3,3.7,3.3,4.1
	c-0.6,0.2-1.2,0.2-1.9,0.1c0.5,1.6,2,2.8,3.8,2.8c-1.7,1.4-3.9,2-6.1,1.7c1.8,1.2,4,1.8,6.3,1.8c7.6,0,11.9-6.4,11.7-12.2
	C18.8,5.3,19.5,4.6,20,3.8z"
      />
    </svg>
  ),
  UserSignedIn: ({ className = null, testid = "icon-user-signed-out" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M10,1.8c-4.5,0-8.2,3.7-8.2,8.2c0,4.5,3.7,8.2,8.2,8.2c4.5,0,8.2-3.7,8.2-8.2C18.2,5.5,14.5,1.8,10,1.8z M15.2,14.2
	c-0.9-2.1-2.9-3.5-5.2-3.5c-2.3,0-4.4,1.4-5.2,3.5C3.9,13,3.3,11.6,3.3,10c0-3.7,3-6.7,6.7-6.7c3.7,0,6.7,3,6.7,6.7
	C16.7,11.6,16.1,13,15.2,14.2z"
      />
      <circle cx="10" cy="7.3" r="2.4" />
    </svg>
  ),
  UserSignedOut: ({ className = null, testid = "icon-user-signed-out" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      data-testid={testid}
    >
      <path
        d="M4.7,14.3c-0.2,0.4,0,0.9,0.3,1.1c1.4,1.1,3.2,1.7,5,1.7c1.9,0,3.6-0.6,5-1.7c0.3-0.3,0.5-0.7,0.3-1.1
	c-0.8-2.2-3-3.6-5.3-3.6S5.5,12.1,4.7,14.3L4.7,14.3z"
      />
      <circle cx="10" cy="7.3" r="2.4" />
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
Icon.Brand.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Circle.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.Data.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.DataModel.propTypes = {
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
Icon.Methodology.propTypes = {
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
Icon.Twitter.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.UserSignedIn.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};
Icon.UserSignedOut.propTypes = {
  className: PropTypes.string,
  testid: PropTypes.string,
};

export default Icon;

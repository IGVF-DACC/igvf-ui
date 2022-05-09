/**
 * Defines icons not available in Heroicons. You normally use this by importing the Icon default
 * component and specifying the icon name as a property of Icon.
 */

import PropTypes from "prop-types"

const Icon = {
  Award: ({ className = null }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
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
  CellLine: ({ className = null }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <g className="fill-transparent stroke-current">
        <path
          d="M14.7,5.3c0.3,2.3-2.6,4.3-4.5,4.5c-2.5,0.1-4-2.2-4.3-4.5C5.6,3,7.8,0.8,10.3,0.8C12.9,0.9,14.4,3.5,14.7,5.3
		z"
        />
        <path
          d="M19,17.4c-0.9,2.1-4.4,2.5-6.1,1.6c-2.2-1.1-2.4-3.9-1.5-6.1c0.9-2.1,3.9-2.9,6-1.6
		C19.7,12.7,19.7,15.7,19,17.4z"
        />
        <path
          d="M6.4,19.3C4.3,20.1,1.5,17.8,1,16c-0.8-2.4,1.1-4.5,3.3-5.3c2.2-0.8,4.8,0.7,5.4,3.2
		C10.2,16.4,8.1,18.6,6.4,19.3z"
        />
      </g>
      <circle cx="10.3" cy="5.3" r="1.3" />
      <circle cx="15.6" cy="14.7" r="1.3" />
      <circle cx="5.5" cy="14.5" r="1.3" />
    </svg>
  ),
  HumanDonor: ({ className = null }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        d="M15,1.4H5L0,10l5,8.6h10l5-8.6L15,1.4z M13.3,12.1l-0.7,0.6v4.9H7.5v-4.9L6.7,12V7.8c0-0.9,0.7-1.6,1.6-1.6H10
	c-1,0-1.9-0.8-1.9-1.9c0-1,0.8-1.9,1.9-1.9s1.9,0.8,1.9,1.9c0,1-0.8,1.9-1.9,1.9h1.7c0.9,0,1.6,0.7,1.6,1.6V12.1z"
      />
    </svg>
  ),
  TechnicalSample: ({ className = null }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        d="M16.6,0h-1.5H5.3H3.8v1.2h1.5v3.7V11v4.1c0,2.7,2.2,4.9,4.9,4.9s4.9-2.2,4.9-4.9V11V4.9V1.2h1.5V0z M13.7,7H6.6
      V1.2h7.1V7z"
      />
    </svg>
  ),
  Treatment: ({ className = null }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M3.4,19.4c-0.8,0.8-2,0.8-2.8,0c-0.8-0.8-0.8-2,0-2.8s3.8-1,4.6-1.9C4.4,15.6,4.1,18.7,3.4,19.4z" />
      <path d="M18.9,1.1c-1.5-1.5-3.8-1.5-5.3,0l-3.2,3.2l5.3,5.3l3.2-3.2C20.4,4.9,20.4,2.6,18.9,1.1z" />
      <path
        className="fill-transparent stroke-current"
        d="M11.4,5c0,0-4.4,4.4-5.3,5.3c-0.9,0.9-0.1,2.3-0.2,3.8c1.6-0.1,2.9,0.7,3.8-0.2C10.6,13,15,8.6,15,8.6"
      />
    </svg>
  ),
}

/**
 * List all icon PropTypes here.
 */
Icon.Award.propTypes = {
  className: PropTypes.string,
}
Icon.CellLine.propTypes = {
  className: PropTypes.string,
}
Icon.HumanDonor.propTypes = {
  className: PropTypes.string,
}
Icon.TechnicalSample.propTypes = {
  className: PropTypes.string,
}
Icon.Treatment.propTypes = {
  className: PropTypes.string,
}

export default Icon

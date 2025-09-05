/**
 * Displays a clickable thumbnail for an attachment, which could either appear as an icon
 * representing the type of the document, or a preview image for attachments types that browsers
 * can display directly in the page. Clicking icon thumbnails brings up the attachment in a browser
 * tab for attachment types that browsers can display in a tab, or downloads the attachments for
 * other attachment types. Clicking image thumbnails brings up the full-size preview image as an
 * overlay on the page.
 */

// node_modules
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import CloseButton from "./close-button";
// lib
import { attachmentToServerHref } from "../lib/attachment";

/**
 * Thumbnail icon SVGs.
 */
const thumbnailIcons = {
  default: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6h0
	V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
    </svg>
  ),

  autosql: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6h0
	V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
      <g className="fill-document-autosql">
        <rect x="15.6" y="70.1" width="68.8" height="25.7" />
        <g>
          <path
            d="M36.9,67.2l-0.4,1.5h-1.8l1.9-6.1H39l2,6.1h-1.9l-0.5-1.5H36.9z M38.4,66l-0.3-1.1
			c-0.1-0.3-0.2-0.8-0.3-1.1h0c-0.1,0.4-0.2,0.8-0.3,1.1L37.2,66H38.4z"
          />
          <path
            d="M44.9,62.6v3.3c0,1,0.4,1.6,1.1,1.6c0.8,0,1.1-0.6,1.1-1.6v-3.3h1.7v3.2c0,2-1.1,2.9-2.9,2.9
			c-1.7,0-2.8-0.9-2.8-3v-3.2H44.9z"
          />
          <path d="M53.2,64h-1.7v-1.4h5.2V64h-1.7v4.7h-1.7V64z" />
          <path
            d="M65.3,65.6c0,1.8-1.3,3.2-3.4,3.2c-2,0-3.2-1.3-3.2-3.1c0-1.9,1.3-3.2,3.3-3.2
			C64,62.5,65.3,63.8,65.3,65.6z M60.5,65.7c0,1,0.6,1.8,1.5,1.8c0.9,0,1.5-0.8,1.5-1.8c0-1-0.6-1.8-1.5-1.8S60.5,64.6,60.5,65.7z"
          />
        </g>
      </g>
      <g className="fill-white">
        <path
          d="M32.3,88.2c0.8,0.5,2.3,0.8,3.4,0.8c1.7,0,2.4-0.8,2.4-1.7c0-1.2-0.8-1.8-2.5-2.8
		c-3.2-1.9-3.7-4-3.7-5.5c0-3.2,2.1-6,6.6-6c1.3,0,2.6,0.3,3.2,0.7l-0.6,3.9c-0.6-0.3-1.4-0.7-2.6-0.7c-1.5,0-2.2,0.8-2.2,1.7
		c0,0.8,0.4,1.4,2.6,2.6c2.7,1.5,3.6,3.6,3.6,5.6c0,3.7-2.8,6.1-6.9,6.1c-1.7,0-3.2-0.4-3.9-0.8L32.3,88.2z"
        />
        <path
          d="M56.6,95.3c-1.9-0.3-4-1-5.6-1.9c-0.5-0.3-0.8-0.5-1-0.5c-4.1,0-6.4-3.9-6.4-10.1
		c0-4.7,2-9.9,6.8-9.9c5.3,0,6.3,5.9,6.3,9.6c0,4.6-1,7.7-2.8,8.7v0.1c1.2,0.6,2.6,1,3.9,1.5L56.6,95.3z M52,82.7
		c0-3.6-0.5-5.9-1.8-5.9c-1.2,0-2,2.3-1.9,6c-0.1,4,0.6,6.2,1.9,6.2C51.4,89,52,86.8,52,82.7z"
        />
        <path d="M59,73.1h4.5v15.8h4.8v3.8H59V73.1z" />
      </g>
      <g className="fill-gray-500">
        <path
          d="M61.7,35.1c0.1,0,0.2-0.1,0.3-0.1v-8.2c-3.6,1.1-7.8,1.7-11.9,1.7c-4.2,0-8.3-0.6-11.9-1.7
		c0,2.5,0,4.7,0,8.2c0.1,0.1,0.2,0.1,0.3,0.1C45.4,37.3,54.6,37.3,61.7,35.1z"
        />
        <path
          d="M38.3,25.3c7.1,2.2,16.3,2.2,23.4,0c0.1,0,0.2-0.1,0.3-0.1v-0.6v-5.8c0-0.7-0.4-1.3-1.1-1.5
		c-6.6-2.1-15.1-2.1-21.7,0c-0.6,0.2-1.1,0.8-1.1,1.5c0,2.4,0,4.2,0,5.8c0,0.2,0,0.4,0,0.6C38.1,25.2,38.2,25.2,38.3,25.3z"
        />
        <path
          d="M50,38.3c-4.2,0-8.3-0.6-11.9-1.7c0,0.5,0,0.9,0,1.5v5.8c0,0.7,0.4,1.3,1.1,1.5
		c6.6,2.1,15.1,2.1,21.7,0c0.6-0.2,1.1-0.8,1.1-1.5c0-2.4,0-4.2,0-5.8v-1.5C58.3,37.7,54.2,38.3,50,38.3z"
        />
      </g>
    </svg>
  ),

  html: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6h0
	V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
      <rect
        x="15.6"
        y="70.1"
        className="fill-document-html"
        width="68.8"
        height="25.7"
      />
      <g className="fill-white">
        <path d="M26.6,73.1v7.6h3.3v-7.6h4.5v19.6h-4.5v-7.8h-3.3v7.8h-4.5V73.1H26.6z" />
        <path d="M39.8,77.3h-3.4v-4.2h11.3v4.2h-3.4v15.4h-4.5V77.3z" />
        <path
          d="M61.6,86.5c-0.1-1.6-0.2-3.9-0.2-6h-0.1c-0.3,2.1-0.8,4.5-1.1,5.7l-1.4,6h-3.2l-1.3-6
		c-0.3-1.2-0.8-3.6-1-5.7h-0.1c-0.1,2.1-0.2,4.4-0.3,6l-0.3,6.1h-3.8l1.5-19.6H55l1.2,6.3c0.5,2.4,1,4.7,1.3,6.9h0.1
		c0.3-2.1,0.7-4.5,1.2-6.9l1.2-6.3h4.7l1.2,19.6h-4L61.6,86.5z"
        />
        <path d="M68.6,73.1h4.5v15.8h4.8v3.8h-9.3V73.1z" />
      </g>
      <g className="fill-gray-500">
        <path d="M31,40.7v-4.5l15.3-9.8v6l-9.8,5.9v0.2l9.8,5.9v6L31,40.7z" />
        <path d="M53.7,44.4l9.8-5.9v-0.2l-9.8-5.9v-6L69,36.2v4.5l-15.3,9.8V44.4z" />
      </g>
    </svg>
  ),

  json: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6
		h0V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
      <g className="fill-gray-500">
        <g>
          <path
            d="M30.3,41.8c1,0.3,1.7,0.8,2.1,1.5c0.4,0.7,0.6,1.9,0.6,3.6v2.2c0,1,0.1,1.7,0.3,2.1
			c0.2,0.4,0.6,0.6,1.2,0.7c0.1,0,0.3,0.1,0.6,0.1c0.9,0.1,1.3,0.5,1.3,1.2c0,0.3-0.1,0.6-0.3,0.8c-0.2,0.2-0.6,0.3-1,0.3
			c-1.7,0-2.9-0.4-3.6-1.3s-1-2.4-1-4.8v-1.8c0-1.2-0.2-2-0.5-2.5c-0.3-0.5-1.1-0.8-2.4-1.1c-0.4-0.1-0.7-0.2-0.8-0.4
			c-0.2-0.2-0.3-0.5-0.3-0.9c0-0.3,0.1-0.6,0.2-0.8s0.4-0.3,0.7-0.4c0.2,0,0.4-0.1,0.7-0.2c1.7-0.4,2.5-1.5,2.5-3.5v-1.8
			c0-2.3,0.4-3.9,1.1-4.8c0.7-0.9,1.9-1.3,3.6-1.3c0.4,0,0.7,0.1,1,0.3c0.2,0.2,0.3,0.5,0.3,0.8c0,0.7-0.4,1.1-1.3,1.2
			c-0.2,0-0.3,0.1-0.4,0.1c-0.6,0.1-1.1,0.4-1.3,0.7c-0.2,0.4-0.4,1.1-0.4,2.2v2.2c0,1.7-0.2,2.9-0.6,3.6C32,41,31.3,41.5,30.3,41.8
			z"
          />
          <path
            d="M48.1,45.1c0.1-0.3,0.2-0.5,0.3-0.6c0.1-0.1,0.3-0.1,0.6-0.1h3.1c0.1,0,0.2,0,0.3,0.1
			c0.1,0.1,0.1,0.1,0.1,0.2c0,0,0,0.1,0,0.2c0,0.1-0.1,0.2-0.1,0.2l-3.9,8.1c-0.1,0.2-0.2,0.3-0.3,0.3c-0.1,0.1-0.2,0.1-0.4,0.1
			c-0.1,0-0.1,0-0.2,0c0,0-0.1,0-0.1,0l-1-0.4c-0.2-0.1-0.3-0.1-0.3-0.2c-0.1-0.1-0.1-0.2-0.1-0.3c0,0,0-0.1,0-0.1
			c0-0.1,0-0.1,0.1-0.2L48.1,45.1z M46.9,37.9c0-0.8,0.3-1.4,0.8-1.9c0.5-0.5,1.3-0.8,2.1-0.8c0.9,0,1.6,0.2,2.2,0.7
			c0.6,0.5,0.8,1.1,0.8,1.9s-0.3,1.4-0.8,1.9c-0.6,0.5-1.3,0.7-2.2,0.7c-0.9,0-1.6-0.2-2.1-0.7S46.9,38.7,46.9,37.9z"
          />
          <path
            d="M69.7,41.8c-1-0.3-1.7-0.8-2.1-1.5c-0.4-0.7-0.6-1.9-0.6-3.6v-2.2c0-1.1-0.1-1.8-0.3-2.2
			c-0.2-0.4-0.6-0.6-1.2-0.8c-0.1,0-0.3-0.1-0.6-0.1c-0.9-0.1-1.3-0.5-1.3-1.1c0-0.4,0.1-0.7,0.3-0.9c0.2-0.2,0.5-0.3,1-0.3
			c1.7,0,2.9,0.4,3.6,1.3s1.1,2.4,1.1,4.8V37c0,2,0.8,3.1,2.4,3.5c0.3,0.1,0.5,0.1,0.7,0.2c0.3,0.1,0.6,0.2,0.7,0.4
			c0.1,0.2,0.2,0.4,0.2,0.7c0,0.3-0.1,0.6-0.2,0.8c-0.2,0.2-0.4,0.3-0.7,0.4c-0.1,0-0.3,0.1-0.5,0.1c-1.8,0.3-2.7,1.5-2.7,3.5v1.8
			c0,2.3-0.3,3.9-1,4.8c-0.7,0.8-1.9,1.3-3.6,1.3c-0.4,0-0.8-0.1-1-0.3c-0.2-0.2-0.3-0.5-0.3-0.9c0-0.6,0.4-1,1.3-1.1
			c0.2,0,0.3,0,0.4-0.1c0.7-0.1,1.1-0.3,1.3-0.7c0.2-0.4,0.4-1.1,0.4-2.2v-2.2c0-1.7,0.2-2.8,0.6-3.6C68,42.6,68.7,42.1,69.7,41.8z"
          />
        </g>
      </g>
      <rect
        x="15.6"
        y="70.1"
        className="fill-document-json"
        width="68.8"
        height="25.7"
      />
      <g className="fill-white">
        <path
          d="M28.7,73.1h4.5v13c0,6.2-3.1,6.8-5.9,6.8c-0.9,0-1.7-0.1-2.1-0.3l0.4-3.8C26,89,26.4,89,26.9,89
		c0.9,0,1.8-0.4,1.8-2.6V73.1z"
        />
        <path
          d="M35.8,88.2c0.8,0.5,2.3,0.8,3.4,0.8c1.7,0,2.4-0.8,2.4-1.7c0-1.2-0.8-1.8-2.5-2.8
		c-3.2-1.9-3.7-4-3.7-5.5c0-3.2,2.1-6,6.6-6c1.3,0,2.6,0.3,3.2,0.7l-0.6,3.9c-0.6-0.3-1.4-0.7-2.6-0.7c-1.5,0-2.2,0.8-2.2,1.7
		c0,0.8,0.4,1.4,2.6,2.6c2.7,1.5,3.6,3.6,3.6,5.6c0,3.7-2.8,6.1-6.9,6.1c-1.7,0-3.2-0.4-3.9-0.8L35.8,88.2z"
        />
        <path
          d="M60.2,82.5c0,7.4-2.7,10.4-6.6,10.4c-4.9,0-6.5-5.2-6.5-10.1c0-4.8,2-9.9,6.8-9.9
		C59.2,72.9,60.2,78.8,60.2,82.5z M51.8,82.9c0,4.6,0.8,6.1,2,6.1c1.2,0,1.8-2.3,1.8-6.3c0-3.4-0.5-5.9-1.8-5.9
		C52.6,76.8,51.8,78.6,51.8,82.9z"
        />
        <path
          d="M62.5,92.7V73.1h4.1l2.8,7c0.5,1.2,1.4,3.7,1.9,5.2h0.1c-0.1-1.6-0.4-5.4-0.4-9.1v-3.2h3.9v19.6
		h-4.1l-2.6-6.6c-0.6-1.5-1.5-4.1-1.9-5.5h-0.1c0.1,1.7,0.3,4.9,0.3,8.8v3.4H62.5z"
        />
      </g>
    </svg>
  ),

  pdf: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6h0
	V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
      <g className="fill-document-pdf">
        <rect x="15.6" y="70.1" width="68.8" height="25.7" />
        <path
          d="M74.1,42.7c-3.6-3.8-13.4-2.2-15.7-1.9c-3.4-3.4-5.7-7.2-6.7-8.6c1.2-3.6,2.2-7.6,2.2-11.5
	c0-3.6-1.4-7.2-5.2-7.2c-1.4,0-2.7,0.7-3.4,1.9c-1.7,2.9-1,8.6,1.7,14.5c-1.4,4.3-3.8,10.7-6.7,15.7c-3.8,1.4-12.2,5.2-12.9,9.5
	c-0.2,1.2,0.2,2.6,1.2,3.4c1,1,2.2,1.2,3.4,1.2c5,0,10-6.9,13.6-13.1c2.9-1,7.4-2.4,11.9-3.1c5.2,4.8,10,5.5,12.4,5.5
	c3.4,0,4.5-1.4,5-2.6C75.5,45.4,75.1,43.7,74.1,42.7z M70.7,45.1c-0.2,1-1.4,1.9-3.6,1.4c-2.6-0.7-5-1.9-6.9-3.6
	c1.7-0.2,5.7-0.7,8.6-0.2C69.8,43,71,43.7,70.7,45.1L70.7,45.1z M47.6,16.5c0.2-0.4,0.7-0.7,1.2-0.7c1.2,0,1.4,1.4,1.4,2.6
	c-0.2,2.9-0.7,6-1.7,8.6C46.6,21.8,46.9,17.9,47.6,16.5z M47.3,43.5c1.2-2.2,2.6-6.2,3.1-7.6c1.2,2.2,3.4,4.5,4.3,5.7
	C55,41.3,50.7,42.3,47.3,43.5L47.3,43.5z M39.2,49c-3.3,5.2-6.4,8.6-8.4,8.6c-0.2,0-0.7,0-1-0.2c-0.2-0.5-0.5-1-0.2-1.4
	C29.9,54,33.8,51.3,39.2,49z"
        />
      </g>
      <g className="fill-white">
        <path
          d="M31.3,73.5c1.1-0.2,2.7-0.4,4.3-0.4c2.4,0,4.3,0.3,5.7,1.5c1.2,1.1,1.8,2.7,1.8,4.3
		c0,2.2-0.7,3.9-1.8,5c-1.3,1.2-3.3,1.7-4.8,1.7c-0.2,0-0.4,0-0.7,0v6.9h-4.4V73.5z M35.7,82.1c0.2,0,0.3,0,0.5,0
		c1.8,0,2.4-1.3,2.4-2.7c0-1.6-0.6-2.7-2.1-2.7c-0.3,0-0.6,0.1-0.8,0.1V82.1z"
        />
        <path
          d="M45.1,73.5c1-0.2,2.5-0.4,4.2-0.4c2.6,0,4.4,0.6,5.7,1.8c1.7,1.6,2.5,4.2,2.5,7.8
		c0,3.7-1,6.6-2.8,8.2c-1.4,1.2-3.3,1.8-6.2,1.8c-1.3,0-2.6-0.1-3.4-0.2V73.5z M49.6,89.1c0.1,0.1,0.4,0.1,0.6,0.1
		c1.6,0,2.8-1.8,2.8-6.6c0-3.6-0.8-5.9-2.8-5.9c-0.2,0-0.4,0-0.6,0.1V89.1z"
        />
        <path d="M59.8,73.2h8.9V77h-4.4v4.2h4.2v3.7h-4.2v7.6h-4.5V73.2z" />
      </g>
    </svg>
  ),

  svs: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6h0
	V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
      <rect
        x="15.6"
        y="70.1"
        className="fill-document-svs"
        width="68.8"
        height="25.7"
      />
      <g className="fill-white">
        <path
          d="M32.5,88.2c0.8,0.5,2.3,0.8,3.4,0.8c1.7,0,2.4-0.8,2.4-1.7c0-1.2-0.8-1.8-2.5-2.8
		c-3.2-1.9-3.7-4-3.7-5.5c0-3.2,2.1-6,6.6-6c1.3,0,2.6,0.3,3.2,0.7l-0.6,3.9c-0.6-0.3-1.4-0.7-2.6-0.7c-1.5,0-2.2,0.8-2.2,1.7
		c0,0.8,0.4,1.4,2.6,2.6c2.7,1.5,3.6,3.6,3.6,5.6c0,3.7-2.8,6.1-6.9,6.1c-1.7,0-3.2-0.4-3.9-0.8L32.5,88.2z"
        />
        <path
          d="M47.3,92.7L43,73.1h5l1.2,8.1c0.3,2.1,0.6,4.3,0.8,6.5H50c0.2-2.2,0.5-4.4,0.8-6.6l1.1-8h5
		l-4.4,19.6H47.3z"
        />
        <path
          d="M57.8,88.2c0.8,0.5,2.3,0.8,3.4,0.8c1.7,0,2.4-0.8,2.4-1.7c0-1.2-0.8-1.8-2.5-2.8
		c-3.2-1.9-3.7-4-3.7-5.5c0-3.2,2.1-6,6.6-6c1.3,0,2.6,0.3,3.2,0.7l-0.6,3.9c-0.6-0.3-1.4-0.7-2.6-0.7c-1.5,0-2.2,0.8-2.2,1.7
		c0,0.8,0.4,1.4,2.6,2.6c2.7,1.5,3.6,3.6,3.6,5.6c0,3.7-2.8,6.1-6.9,6.1c-1.7,0-3.2-0.4-3.9-0.8L57.8,88.2z"
        />
      </g>
      <g className="fill-gray-500">
        <path d="M80.3,61.6h-44V28.1h44V61.6z M38.3,57.2l9.8-4.9l10.2,3.5l12-7.4l8,4.3V30.1h-40V57.2z" />
        <path d="M63.7,51.6h-44V18.1h44V51.6z M21.7,49.6h40V20.1h-40V49.6z" />
        <circle cx="29.6" cy="27.1" r="3.7" />
      </g>
    </svg>
  ),

  tiff: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6h0
	V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
      <rect
        x="15.6"
        y="70.1"
        className="fill-document-tiff"
        width="68.8"
        height="25.7"
      />
      <g className="fill-gray-500">
        <path d="M72,54.7H28V21.2h44V54.7z M30,50.3l9.8-4.9L50,48.9l12-7.4l8,4.3V23.2H30V50.3z" />
        <circle cx="37.9" cy="30.2" r="3.7" />
      </g>
      <g className="fill-white">
        <path d="M32.4,77.3H29v-4.2h11.3v4.2h-3.4v15.4h-4.5V77.3z" />
        <path d="M46.8,73.1v19.6h-4.5V73.1H46.8z" />
        <path d="M50.1,73.1h9V77h-4.5v4.2h4.2V85h-4.2v7.7h-4.5V73.1z" />
        <path d="M62,73.1h9V77h-4.5v4.2h4.2V85h-4.2v7.7H62V73.1z" />
      </g>
    </svg>
  ),

  tsv: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6h0
	V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
      <rect
        x="15.6"
        y="70.1"
        className="fill-document-tsv"
        width="68.8"
        height="25.7"
      />
      <g className="fill-gray-500">
        <path
          d="M37.8,28.9h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C40,27.9,39,28.9,37.8,28.9z"
        />
        <path
          d="M54.8,28.9h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C57,27.9,56,28.9,54.8,28.9z"
        />
        <path
          d="M71.8,28.9h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C74,27.9,73,28.9,71.8,28.9z"
        />
        <path
          d="M37.8,36.8h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C40,35.8,39,36.8,37.8,36.8z"
        />
        <path
          d="M54.8,36.8h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C57,35.8,56,36.8,54.8,36.8z"
        />
        <path
          d="M71.8,36.8h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C74,35.8,73,36.8,71.8,36.8z"
        />
        <path
          d="M37.8,44.7h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C40,43.7,39,44.7,37.8,44.7z"
        />
        <path
          d="M54.8,44.7h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C57,43.7,56,44.7,54.8,44.7z"
        />
        <path
          d="M71.8,44.7h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C74,43.7,73,44.7,71.8,44.7z"
        />
        <path
          d="M37.8,52.6h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C40,51.6,39,52.6,37.8,52.6z"
        />
        <path
          d="M54.8,52.6h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C57,51.6,56,52.6,54.8,52.6z"
        />
        <path
          d="M71.8,52.6h-9.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h9.6c1.2,0,2.2,1,2.2,2.2v0
		C74,51.6,73,52.6,71.8,52.6z"
        />
      </g>
      <g className="fill-white">
        <path d="M34.8,77.3h-3.4v-4.2h11.3v4.2h-3.4v15.4h-4.5V77.3z" />
        <path
          d="M44.2,88.2c0.8,0.5,2.3,0.8,3.4,0.8c1.7,0,2.4-0.8,2.4-1.7c0-1.2-0.8-1.8-2.5-2.8
		c-3.2-1.9-3.7-4-3.7-5.5c0-3.2,2.1-6,6.6-6c1.3,0,2.6,0.3,3.2,0.7L53,77.5c-0.6-0.3-1.4-0.7-2.6-0.7c-1.5,0-2.2,0.8-2.2,1.7
		c0,0.8,0.4,1.4,2.6,2.6c2.7,1.5,3.6,3.6,3.6,5.6c0,3.7-2.8,6.1-6.9,6.1c-1.7,0-3.2-0.4-3.9-0.8L44.2,88.2z"
        />
        <path
          d="M59,92.7l-4.3-19.6h5l1.2,8.1c0.3,2.1,0.6,4.3,0.8,6.5h0.1c0.2-2.2,0.5-4.4,0.8-6.6l1.1-8h5
		l-4.4,19.6H59z"
        />
      </g>
    </svg>
  ),

  txt: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
    >
      <path
        d="M88.6,13.4L88.6,13.4C88.6,13.4,88.6,13.4,88.6,13.4L75.2,0h0h-2H11.4v100h77.2c0-24.8,0-74,0-84.6h0
	V13.4z M85.8,13.4H75.2V2.8L85.8,13.4z M86.6,98H13.4V2h59.8v13.4h13.4V98z"
      />
      <rect
        x="15.6"
        y="70.1"
        className="fill-document-txt"
        width="68.8"
        height="25.7"
      />
      <g className="fill-white">
        <path d="M29.5,77.3h-3.4v-4.2h11.3v4.2H34v15.4h-4.5V77.3z" />
        <path d="M48.1,84.4h-4.3v4.4h4.8v3.9h-9.3V73.1h9V77h-4.5v3.7h4.3V84.4z" />
        <path
          d="M57.4,92.7l-1-3.1c-0.4-1.2-0.7-2.3-1-3.5h-0.1c-0.3,1.2-0.6,2.4-0.8,3.6l-0.8,3h-4.4l3.5-10
		l-3.3-9.5h4.7l0.9,3.2c0.3,1.1,0.6,2.1,0.8,3.2h0.1c0.3-1.1,0.5-2.1,0.7-3.2l0.7-3.2h4.5L58.2,83l3.8,9.7H57.4z"
        />
        <path d="M65.9,77.3h-3.4v-4.2h11.3v4.2h-3.4v15.4h-4.5V77.3z" />
      </g>
      <g className="fill-gray-400">
        <path
          d="M61,21.5H27.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2H61c1.2,0,2.2,1,2.2,2.2v0
		C63.2,20.5,62.2,21.5,61,21.5z"
        />
        <path
          d="M72.2,30.7H27.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h44.5c1.2,0,2.2,1,2.2,2.2v0
		C74.4,29.7,73.4,30.7,72.2,30.7z"
        />
        <path
          d="M68.2,39.9H27.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h40.6c1.2,0,2.2,1,2.2,2.2v0
		C70.4,39,69.4,39.9,68.2,39.9z"
        />
        <path
          d="M70.2,49.2H27.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h42.6c1.2,0,2.2,1,2.2,2.2v0
		C72.4,48.2,71.4,49.2,70.2,49.2z"
        />
        <path
          d="M66.5,58.4H27.6c-1.2,0-2.2-1-2.2-2.2v0c0-1.2,1-2.2,2.2-2.2h38.9c1.2,0,2.2,1,2.2,2.2v0
		C68.7,57.4,67.8,58.4,66.5,58.4z"
        />
      </g>
    </svg>
  ),
};

/**
 * Maps attachment types to thumbnail icons. Viewable image attachments have the string "image" here
 * to indicate that the attachment itself should appear as the thumbnail.
 */
const thumbnailIconMap = {
  "application/json": thumbnailIcons.json,
  "application/pdf": thumbnailIcons.pdf,
  "image/gif": "image",
  "image/jpeg": "image",
  "image/png": "image",
  "image/svs": thumbnailIcons.svs,
  "image/tiff": thumbnailIcons.tiff,
  "text/autosql": thumbnailIcons.autosql,
  "text/html": thumbnailIcons.html,
  "text/plain": thumbnailIcons.txt,
  "text/tab-separated-values": thumbnailIcons.tsv,
};

/**
 * Default square size of the attachment thumbnails in pixels.
 */
const DEFAULT_SIZE = 100;

/**
 * Display an image thumbnail for an attachment that's viewable in the browser. When the user
 * clicks the thumbnail, display the attachment image preview as a modal overlay on the page.
 */
function ImageThumbnailAndPreview({ attachment, ownerPath, alt, size }) {
  // True if the attachment image preview is visible.
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPreviewOpen(true)}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="mx-auto"
        aria-label={`Open full-size preview of ${attachment.download}`}
      >
        <picture className="item-center flex h-full justify-center">
          <img
            className="block object-contain"
            src={attachmentToServerHref(attachment, ownerPath)}
            alt={alt}
          />
        </picture>
      </button>
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        className="relative z-50"
      >
        <div
          data-testid="dialog-background"
          className="fixed inset-0 bg-white/90"
        />
        <div className="fixed inset-0 overflow-y-auto px-3 py-8 text-center">
          <CloseButton
            className="absolute top-1 right-1"
            onClick={() => setIsPreviewOpen(false)}
            label="Close the full-size preview image"
          >
            <XMarkIcon />
          </CloseButton>
          <Dialog.Panel className="mx-auto inline-block max-w-3xl">
            <picture className="block border border-gray-200">
              <img
                className="border-data-border block border"
                src={attachmentToServerHref(attachment, ownerPath)}
                alt={alt}
              />
            </picture>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

ImageThumbnailAndPreview.propTypes = {
  // The attachment to display
  attachment: PropTypes.object.isRequired,
  // The path to the owner of the attachment
  ownerPath: PropTypes.string.isRequired,
  // The alt text to use for the thumbnail image
  alt: PropTypes.string.isRequired,
  // Size of the thumbnail in pixels
  size: PropTypes.number,
};

/**
 * Display the thumbnail for the given attachment.
 */
export default function AttachmentThumbnail({
  attachment,
  ownerPath,
  alt,
  size = DEFAULT_SIZE,
}) {
  const thumbnailIcon =
    thumbnailIconMap[attachment.type] || thumbnailIcons.default;
  if (thumbnailIcon === "image") {
    return (
      <ImageThumbnailAndPreview
        attachment={attachment}
        ownerPath={ownerPath}
        alt={alt}
        size={size}
      />
    );
  }

  // For non-image and non-previewable image attachments, get the associated preview icon, and link
  // it so it appears in its own browser tab.
  return (
    <a
      className="mx-auto block"
      href={attachmentToServerHref(attachment, ownerPath)}
      target="_blank"
      rel="noreferrer"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {thumbnailIcon}
      <span className="sr-only">Download {attachment.download}</span>
    </a>
  );
}

AttachmentThumbnail.propTypes = {
  // Attachment object to display
  attachment: PropTypes.shape({
    type: PropTypes.string.isRequired,
    download: PropTypes.string.isRequired,
  }).isRequired,
  // Path of the object that owns the attachment (no protocol; no domain)
  ownerPath: PropTypes.string.isRequired,
  // Alt text for the preview
  alt: PropTypes.string.isRequired,
  // Size of the thumbnail in pixels
  size: PropTypes.number,
};

import PropTypes from "prop-types";
import React from "react";
import { useRouter } from "next/router";
import Button from "./button";

/**
 * This is acts like a link like Button.Link but uses an icon like Button.Icon
 */
export const LinkIcon = ({
  href,
  navigationClick = () => {},
  type = "primary",
  id = null,
  size = "6",
  className = "",
  label,
  isDisabled = false,
  children,
}) => {
  const router = useRouter();

  const onClick = () => {
    if (navigationClick) {
      navigationClick();
    }
    router.push(href);
  };

  return (
    <Button.Icon
      onClick={onClick}
      type={type}
      id={id}
      size={size}
      label={label}
      className={className}
      isDisabled={isDisabled}
    >
      {children}
    </Button.Icon>
  );
};

LinkIcon.propTypes = {
  // Link location that the page will navigate to when the button is clicked
  href: PropTypes.string,
  // Called when the button is clicked before going to the URL in href
  navigationClick: PropTypes.func,
  // Button color type
  type: PropTypes.PropTypes.oneOf([
    "primary",
    "secondary",
    "tertiary",
    "error",
    "warning",
    "success",
    "info",
    "primary-outline",
    "secondary-outline",
    "tertiary-outline",
    "error-outline",
    "warning-outline",
    "success-outline",
    "info-outline",
  ]),
  // Additional Tailwind CSS classes to apply to the <button> element
  className: PropTypes.string,
  // HTML ID of the button element
  id: PropTypes.string,
  // Size of the icon, default "6"
  size: PropTypes.string,
  // Accessible label of the button for screen readers
  label: PropTypes.string.isRequired,
  // True to disable the button
  isDisabled: PropTypes.bool,
};

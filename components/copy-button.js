// node_modules
import { CheckIcon, ClipboardCopyIcon } from "@heroicons/react/outline"
import PropTypes from "prop-types"
import { useState } from "react"
// components
import Button from "./button"

const CopyButton = ({ target, label, className = "" }) => {
  const [isCopied, setCopied] = useState(false)

  /**
   * Copies the given text to the clipboard.
   */
  const copy = () => {
    navigator.clipboard.writeText(target).then(() => {
      // Temporarily display a checkmark to confirm the copy.
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    })
  }

  return (
    <Button.Icon onClick={copy} className={className} label={label}>
      {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
    </Button.Icon>
  )
}

CopyButton.propTypes = {
  // The element to copy
  target: PropTypes.string.isRequired,
  // Accessible label for the button
  label: PropTypes.string.isRequired,
  // Additional Tailwind CSS class names
  className: PropTypes.string,
}

export default CopyButton

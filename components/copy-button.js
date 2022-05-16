// node_modules
import { CheckIcon, ClipboardCopyIcon } from "@heroicons/react/outline"
import PropTypes from "prop-types"
import { useState } from "react"

const CopyButton = ({ target, className = "" }) => {
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
    <button
      type="button"
      className={`block h-6 w-8 rounded-sm border border-gray-400 py-px px-1.5 ${className}`}
      onClick={copy}
    >
      {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
    </button>
  )
}

CopyButton.propTypes = {
  // The element to copy
  target: PropTypes.string.isRequired,
  // Additional Tailwind CSS class names
  className: PropTypes.string,
}

export default CopyButton

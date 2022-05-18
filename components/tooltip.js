// node_modules
import { Popover } from "@headlessui/react"
import PropTypes from "prop-types"
import { useState } from "react"

/**
 * Prototype version of a Tooltip component. This needs extending to include:
 * * automated positioning depending on screen position
 * * allowing specification of position at least above or below the element
 */
const Tooltip = ({ content, className = "", children }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false)

  const onMouseEnter = () => {
    setTooltipVisible(true)
  }

  const onMouseLeave = () => {
    setTooltipVisible(false)
  }

  return (
    <div
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <Popover className="relative">
        <Popover.Panel
          static={isTooltipVisible}
          className="absolute z-10 w-max max-w-xs border bg-white px-4 py-1 text-sm drop-shadow-md"
        >
          <div className="relative">{content}</div>
        </Popover.Panel>
      </Popover>
    </div>
  )
}

Tooltip.propTypes = {
  // Contents of the tooltip
  content: PropTypes.node.isRequired,
  // Tailwind CSS classes to add to the tooltip wrapper element
  className: PropTypes.string,
}

export default Tooltip

// node_modules
import { Children } from "react"

/**
 * Displays the status of any object. The children must include exactly one text item (the status
 * string) or nothing gets displayed. If new statuses get added, define their colors in
 * globals.css, add their background- and border-color classes to the status properties in
 * tailwind.config.js, and add them to the safelist property because the className gets generated
 * dynamically here, and so these class names get tree shaken unless you add them to that list.
 */
const Status = ({ children }) => {
  if (Children.count(children) === 1) {
    const status = children.replace(" ", "-")
    return (
      <div
        className={`m-0.5 w-fit rounded-full border border-white px-2 py-0 text-xs font-semibold uppercase bg-status-${status} text-status-${status} shadow-outline-${status}`}
      >
        {children}
      </div>
    )
  }
  return null
}

export default Status

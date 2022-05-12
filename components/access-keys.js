// node_modules
import { Popover } from "@headlessui/react"
import { RefreshIcon, TrashIcon } from "@heroicons/react/solid"
import PropTypes from "prop-types"
import { useContext, useState } from "react"
// components
import SessionContext from "./session-context"
// libs
import { resetAccessKey, deleteAccessKey } from "../libs/access-keys"

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

/**
 * Display a single access key control button, normally an icon child of this component.
 */
const AccessKeyControl = ({ label, onClick, children }) => {
  return (
    <button onClick={onClick} className="h-5 w-5">
      <Tooltip content={label}>
        {children}
        <span className="sr-only">{label}</span>
      </Tooltip>
    </button>
  )
}

AccessKeyControl.propTypes = {
  // The label for the control for screen readers and tooltip
  label: PropTypes.string.isRequired,
  // Function to call when the user clicks the control
  onClick: PropTypes.func.isRequired,
}

/**
 * Displays a single access key and its associated controls.
 */
const AccessKeyItem = ({ accessKey, onResetClick, onDeleteClick }) => {
  return (
    <div className="flex items-center justify-between border px-2 py-1">
      <div className="font-mono">{accessKey.access_key_id}</div>
      <div className="flex">
        <AccessKeyControl
          label={`Reset access key ${accessKey.access_key_id}`}
          onClick={onResetClick}
        >
          <RefreshIcon />
        </AccessKeyControl>
        <AccessKeyControl
          label={`Delete access key ${accessKey.access_key_id}`}
          onClick={onDeleteClick}
        >
          <TrashIcon />
        </AccessKeyControl>
      </div>
    </div>
  )
}

AccessKeyItem.propTypes = {
  // Array of access keys from the session user object
  accessKey: PropTypes.shape({ access_key_id: PropTypes.string }).isRequired,
  // Callback to reset the access key
  onResetClick: PropTypes.func.isRequired,
  // Callback to delete the access key
  onDeleteClick: PropTypes.func.isRequired,
}

/**
 * Displays a list of access keys and their associated controls.
 */
const AccessKeyList = ({ accessKeys }) => {
  const { session } = useContext(SessionContext)

  const onResetClick = (accessKeyId) => {
    resetAccessKey(accessKeyId, session)
  }

  const onDeleteClick = (accessKeyId) => {
    deleteAccessKey(accessKeyId, session)
  }

  return (
    <div className="block sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {accessKeys.map((accessKey) => {
        return (
          <AccessKeyItem
            key={accessKey.uuid}
            accessKey={accessKey}
            onResetClick={() => onResetClick(accessKey.access_key_id)}
            onDeleteClick={() => onDeleteClick(accessKey.access_key_id)}
          />
        )
      })}
    </div>
  )
}

AccessKeyList.propTypes = {
  // Array of access keys from user object
  accessKeys: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default AccessKeyList

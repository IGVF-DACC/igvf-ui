// node_modules
import { Popover } from "@headlessui/react"
import { RefreshIcon, TrashIcon } from "@heroicons/react/solid"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import { Fragment, useContext, useState } from "react"
// components
import Button from "./button"
import CopyButton from "./copy-button"
import Modal from "./modal"
import SessionContext from "./session-context"
// libs
import { resetAccessKey, deleteAccessKey } from "../libs/access-keys"
import { createAccessKey } from "../libs/access-keys"
import { DataItemLabel } from "./data-area"

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
 * Displays the access key ID and secret in a table.
 */
const AccessKeyDisplay = ({ accessKeyId, accessKeySecret }) => {
  const rows = [
    {
      label: "Access key ID",
      value: accessKeyId,
    },
    {
      label: "Access key secret",
      value: accessKeySecret,
    },
  ]

  return (
    <div className="my-5 gap-3 border border-gray-200 bg-gray-100 py-2.5 px-5 md:grid md:auto-cols-min md:grid-cols-min-2">
      {rows.map((row) => {
        return (
          <Fragment key={row.label}>
            <DataItemLabel className="flex h-full items-center whitespace-nowrap">
              {row.label}
            </DataItemLabel>
            <div className="flex items-center justify-between">
              <div className="shrink-1 font-mono">{row.value}</div>
              <div className="ml-2 flex shrink-0 justify-end">
                <CopyButton target={row.value} />
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

AccessKeyDisplay.propTypes = {
  // The access key ID
  accessKeyId: PropTypes.string.isRequired,
  // The access key secret
  accessKeySecret: PropTypes.string.isRequired,
}

/**
 * Displays a button to create a new access key.
 */
export const CreateAccessKeyTrigger = () => {
  // True if modal displaying newly created access-keys open
  const [isKeysOpen, setKeysOpen] = useState(false)
  // Access key ID
  const [accessKeyId, setAccessKeyId] = useState("")
  // Access key secret
  const [accessKeySecret, setAccessKeySecret] = useState("")

  const router = useRouter()
  const { session } = useContext(SessionContext)

  /**
   * Create a new access key and opens the modal to display it.
   */
  const createKey = () => {
    createAccessKey(session).then((response) => {
      setAccessKeyId(response.access_key_id)
      setAccessKeySecret(response.secret_access_key)

      // Rerender the page with the new access keys and with the modal showing the new access keys
      // open.
      router.replace(router.asPath)
      setKeysOpen(true)
    })
  }

  const closeModal = () => {
    setKeysOpen(false)
  }

  return (
    <>
      <Button className="mb-4 w-full sm:w-auto" onClick={createKey}>
        Create Access Key
      </Button>
      <Modal isOpen={isKeysOpen} onClose={closeModal}>
        <Modal.Header onClose={closeModal}>Created Access Key</Modal.Header>
        <Modal.Body>
          <p>
            Please make a note of the new secret access key. This is the last
            time you will be able to view it.
          </p>
          <div className="flex justify-center">
            <AccessKeyDisplay
              accessKeyId={accessKeyId}
              accessKeySecret={accessKeySecret}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
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
 * Displays the modal to confirm the user wants to delete an access key.
 */
const DeleteAccessKeyModal = ({ accessKeyId, isOpen, onConfirm, onCancel }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <Modal.Header onClose={onCancel}>Delete Access Key</Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the access key{" "}
          <strong>{accessKeyId}</strong>?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Delete</Button>
      </Modal.Footer>
    </Modal>
  )
}

DeleteAccessKeyModal.propTypes = {
  // ID of access key to delete
  accessKeyId: PropTypes.string.isRequired,
  // True if the modal is open
  isOpen: PropTypes.bool.isRequired,
  // Function to call when the user confirms the deletion
  onConfirm: PropTypes.func.isRequired,
  // Function to call when the user cancels the deletion
  onCancel: PropTypes.func.isRequired,
}

/**
 * Displays a single access key and its associated controls.
 */
const AccessKeyItem = ({ accessKey, onReset, onDelete }) => {
  // True if access key delete warning modal is visible.
  const [isDeleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between border px-2 py-1">
        <div className="font-mono">{accessKey.access_key_id}</div>
        <div className="flex">
          <AccessKeyControl
            label={`Reset access key ${accessKey.access_key_id}`}
            onClick={onReset}
          >
            <RefreshIcon />
          </AccessKeyControl>
          <AccessKeyControl
            label={`Delete access key ${accessKey.access_key_id}`}
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon />
          </AccessKeyControl>
        </div>
      </div>
      <DeleteAccessKeyModal
        accessKeyId={accessKey.access_key_id}
        isOpen={isDeleteOpen}
        onConfirm={onDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}

AccessKeyItem.propTypes = {
  // Array of access keys from the session user object
  accessKey: PropTypes.shape({ access_key_id: PropTypes.string }).isRequired,
  // Callback to reset the access key
  onReset: PropTypes.func.isRequired,
  // Callback to delete the access key
  onDelete: PropTypes.func.isRequired,
}

/**
 * Displays a list of access keys and their associated controls.
 */
export const AccessKeyList = ({ accessKeys }) => {
  const { session } = useContext(SessionContext)

  const router = useRouter()

  const onReset = (accessKeyId) => {
    resetAccessKey(accessKeyId, session)
  }

  const onDelete = (accessKeyId) => {
    deleteAccessKey(accessKeyId, session)

    // Rerender the page with the new access keys and with the modal showing the new access keys
    // open.
    router.replace(router.asPath)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {accessKeys.map((accessKey) => {
        return (
          <AccessKeyItem
            key={accessKey.uuid}
            accessKey={accessKey}
            onReset={() => onReset(accessKey.access_key_id)}
            onDelete={() => onDelete(accessKey.access_key_id)}
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

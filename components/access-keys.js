// node_modules
import { RefreshIcon, TrashIcon } from "@heroicons/react/solid"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import { Fragment, useContext, useState } from "react"
// components
import Button from "./button"
import CopyButton from "./copy-button"
import Modal from "./modal"
import SessionContext from "./session-context"
import Tooltip from "./tooltip"
// libs
import { resetAccessKey, deleteAccessKey } from "../libs/access-keys"
import { createAccessKey } from "../libs/access-keys"
import { DataItemLabel } from "./data-area"

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
                <CopyButton target={row.value} label={row.label} />
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
 * Messages to display in the access key creation or reset modal.
 */
const accessKeyModalMessages = {
  create: {
    title: "Your secret key has been created",
    close: "Close dialog containing your new access key",
  },
  reset: {
    title: "Your secret key has been reset",
    close: "Close dialog containing your reset access key",
  },
}

/**
 * Displays the modal to show the user their new or reset access keys. This component always shows
 * the modal, so display or hide it from the parent component.
 */
const AccessKeyModals = ({
  accessKeyId,
  accessKeySecret,
  createOrReset,
  onClose,
}) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <Modal.Header
        closeLabel={accessKeyModalMessages[createOrReset].close}
        onClose={onClose}
      >
        {accessKeyModalMessages[createOrReset].title}
      </Modal.Header>
      <Modal.Body>
        <p>
          Please make a note of the new secret access key. This is the last time
          you will be able to view it.
        </p>
        <div className="flex justify-center">
          <AccessKeyDisplay
            accessKeyId={accessKeyId}
            accessKeySecret={accessKeySecret}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="info"
          onClick={onClose}
          label={accessKeyModalMessages[createOrReset].close}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

AccessKeyModals.propTypes = {
  // The access key ID
  accessKeyId: PropTypes.string.isRequired,
  // The new access key secret
  accessKeySecret: PropTypes.string.isRequired,
  // The action to perform on the access key
  createOrReset: PropTypes.oneOf(["create", "reset"]).isRequired,
  // Callback to close the modal
  onClose: PropTypes.func.isRequired,
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
      {isKeysOpen && (
        <AccessKeyModals
          accessKeyId={accessKeyId}
          accessKeySecret={accessKeySecret}
          createOrReset="create"
          onClose={closeModal}
        />
      )}
    </>
  )
}

/**
 * Displays a button to create a new access key.
 */
export const ResetAccessKeyTrigger = ({ accessKeyId }) => {
  // True if modal displaying reset access-keys open
  const [isKeysOpen, setKeysOpen] = useState(false)
  // Access key secret
  const [accessKeySecret, setAccessKeySecret] = useState("")
  const { session } = useContext(SessionContext)

  /**
   * Create a new access key and opens the modal to display it.
   */
  const resetKey = () => {
    resetAccessKey(accessKeyId, session).then((response) => {
      setAccessKeySecret(response.secret_access_key)
      setKeysOpen(true)
    })
  }

  const closeModal = () => {
    setKeysOpen(false)
  }

  return (
    <>
      <AccessKeyControl
        label={`Reset access key ${accessKeyId}`}
        onClick={resetKey}
      >
        <RefreshIcon />
      </AccessKeyControl>
      {isKeysOpen && (
        <AccessKeyModals
          accessKeyId={accessKeyId}
          accessKeySecret={accessKeySecret}
          createOrReset="create"
          onClose={closeModal}
        />
      )}
    </>
  )
}

ResetAccessKeyTrigger.propTypes = {
  // The access key ID to reset
  accessKeyId: PropTypes.string.isRequired,
}

const DeleteAccessKeyTrigger = ({ accessKeyId }) => {
  // True if access key delete warning modal is visible.
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const router = useRouter()
  const { session } = useContext(SessionContext)

  /**
   * Called to perform the deletion of the access key.
   */
  const onDelete = () => {
    deleteAccessKey(accessKeyId, session).then(() => {
      // Rerender the page with the new access keys and with the modal showing the new access keys
      // open.
      router.replace(router.asPath)
    })
  }

  const onCancel = () => {
    setDeleteOpen(false)
  }

  return (
    <>
      <AccessKeyControl
        label={`Delete access key ${accessKeyId}`}
        onClick={() => setDeleteOpen(true)}
      >
        <TrashIcon />
      </AccessKeyControl>
      <Modal isOpen={isDeleteOpen} onClose={onCancel}>
        <Modal.Header
          onClose={onCancel}
          closeModal="Cancel deleting access key"
        >
          Delete Access Key
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete the access key{" "}
            <strong>{accessKeyId}</strong>? You cannot undo this action.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="info"
            onClick={onCancel}
            label="Cancel deleting access key"
          >
            Cancel
          </Button>
          <Button
            type="alert"
            onClick={onDelete}
            label="Confirm deleting access key"
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

DeleteAccessKeyTrigger.propTypes = {
  // ID of access key to delete
  accessKeyId: PropTypes.string.isRequired,
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
const AccessKeyItem = ({ accessKey }) => {
  return (
    <>
      <div className="flex items-center justify-between border px-2 py-1">
        <div className="font-mono">{accessKey.access_key_id}</div>
        <div className="flex">
          <ResetAccessKeyTrigger accessKeyId={accessKey.access_key_id} />
          <DeleteAccessKeyTrigger accessKeyId={accessKey.access_key_id} />
        </div>
      </div>
    </>
  )
}

AccessKeyItem.propTypes = {
  // Array of access keys from the session user object
  accessKey: PropTypes.shape({ access_key_id: PropTypes.string }).isRequired,
}

/**
 * Displays a list of access keys and their associated controls.
 */
export const AccessKeyList = ({ accessKeys }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {accessKeys.map((accessKey) => {
        return <AccessKeyItem key={accessKey.uuid} accessKey={accessKey} />
      })}
    </div>
  )
}

AccessKeyList.propTypes = {
  // Array of access keys from user object
  accessKeys: PropTypes.arrayOf(PropTypes.object).isRequired,
}

// node_modules
import {
  CheckIcon,
  ClipboardCopyIcon,
  RefreshIcon,
  TrashIcon,
} from "@heroicons/react/solid"
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
import {
  createAccessKey,
  deleteAccessKey,
  resetAccessKey,
} from "../libs/access-keys"

/**
 * Displays the access key ID and secret for the modal used when creating or resetting an access
 * key.
 */
const AccessKeyDisplay = ({ accessKeyId, accessKeySecret }) => {
  // The labels and keys appear in a two-row table. The row contents get defined here. On mobile
  // they appear in one column.
  const rows = [
    {
      label: "Access Key ID",
      value: accessKeyId,
    },
    {
      label: "Access Key Secret",
      value: accessKeySecret,
    },
  ]

  return (
    <div className="my-5 w-full gap-3 border border-modal-border bg-gray-100 py-2.5 px-2 dark:bg-gray-800 md:grid md:w-auto md:auto-cols-min md:grid-cols-min-2 md:px-5">
      {rows.map((row) => {
        return (
          <Fragment key={row.label}>
            <div className="flex items-center whitespace-nowrap font-bold text-data-title md:h-full">
              {row.label}
            </div>
            <div className="mb-2 flex items-center justify-between last:mb-0 md:mb-0">
              <div className="shrink-1 font-mono">{row.value}</div>
              <div className="ml-2 flex shrink-0 justify-end">
                <CopyButton.Icon target={row.value} label={row.label}>
                  {(isCopied) =>
                    isCopied ? <CheckIcon /> : <ClipboardCopyIcon />
                  }
                </CopyButton.Icon>
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

AccessKeyDisplay.propTypes = {
  // Access key ID
  accessKeyId: PropTypes.string.isRequired,
  // Access key secret
  accessKeySecret: PropTypes.string.isRequired,
}

/**
 * The access key creation and reset modals have nearly identical contents except for these
 * messages.
 */
const accessKeyModalMessages = {
  create: {
    title: "Your new secret key",
    close: "Close dialog containing your new access key",
  },
  reset: {
    title: "Your reset secret key",
    close: "Close dialog containing your reset access key",
  },
}

/**
 * Displays the modal to show the user their new or reset access keys. This component always shows
 * the modal, so its visibility gets controlled from the parent component.
 */
const AccessKeyModal = ({
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
          Please make a note of the new access key secret. You have no way to
          retrieve it once you close this dialog.
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

AccessKeyModal.propTypes = {
  // New (create) or existing (reset) access key ID
  accessKeyId: PropTypes.string.isRequired,
  // New access key secret
  accessKeySecret: PropTypes.string.isRequired,
  // Specifies either the create or reset messages to display in the modal
  createOrReset: PropTypes.oneOf(["create", "reset"]).isRequired,
  // Callback to close the modal
  onClose: PropTypes.func.isRequired,
}

/**
 * Displays a button and modal to create a new access key.
 */
export const CreateAccessKeyTrigger = () => {
  // True if modal displaying newly created access-keys is open
  const [isOpen, setOpen] = useState(false)
  // Access key ID
  const [accessKeyId, setAccessKeyId] = useState("")
  // Access key secret
  const [accessKeySecret, setAccessKeySecret] = useState("")

  const router = useRouter()
  const { session } = useContext(SessionContext)

  /**
   * Called to create a new access key. Once that happens it opens the modal to display the new
   * access key ID and secret.
   */
  const createKey = () => {
    createAccessKey(session).then((response) => {
      setAccessKeyId(response.access_key_id)
      setAccessKeySecret(response.secret_access_key)

      // Rerender the page with the new access keys and with the modal showing the new access keys
      // open.
      router.replace(router.asPath)
      setOpen(true)
    })
  }

  const closeModal = () => {
    setOpen(false)
  }

  return (
    <>
      <Button className="mt-2 w-full sm:w-auto" onClick={createKey}>
        Create Access Key
      </Button>
      {isOpen && (
        <AccessKeyModal
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
 * Display a single access key control button.
 */
const AccessKeyControl = ({ label, onClick, type, children }) => {
  return (
    <Button.Icon label={label} onClick={onClick} type={type}>
      <Tooltip content={label}>{children}</Tooltip>
    </Button.Icon>
  )
}

AccessKeyControl.propTypes = {
  // The label for the control for screen readers and tooltip
  label: PropTypes.string.isRequired,
  // Function to call when the user clicks the control
  onClick: PropTypes.func.isRequired,
  // Additional Tailwind CSS class names to apply to the button
  type: PropTypes.string,
}

/**
 * Displays a button and new-key modal to reset an existing access key.
 */
export const ResetAccessKeyTrigger = ({ accessKeyId }) => {
  // True if modal displaying reset access-keys open
  const [isOpen, setOpen] = useState(false)
  // Access key secret
  const [accessKeySecret, setAccessKeySecret] = useState("")

  const { session } = useContext(SessionContext)

  /**
   * Creates a new access key and opens the modal to display it.
   */
  const resetKey = () => {
    resetAccessKey(accessKeyId, session).then((response) => {
      setAccessKeySecret(response.secret_access_key)
      setOpen(true)
    })
  }

  const closeModal = () => {
    setOpen(false)
  }

  return (
    <>
      <AccessKeyControl
        label={`Reset access key ${accessKeyId}`}
        onClick={resetKey}
        type="secondary"
      >
        <RefreshIcon className="fill-white" />
      </AccessKeyControl>
      {isOpen && (
        <AccessKeyModal
          accessKeyId={accessKeyId}
          accessKeySecret={accessKeySecret}
          createOrReset="reset"
          onClose={closeModal}
        />
      )}
    </>
  )
}

ResetAccessKeyTrigger.propTypes = {
  // Access key ID to reset
  accessKeyId: PropTypes.string.isRequired,
}

/**
 * Displays a button and warning modal to delete an access key.
 */
const DeleteAccessKeyTrigger = ({ accessKeyId }) => {
  // True if access key delete warning modal is visible.
  const [isOpen, setOpen] = useState(false)

  const router = useRouter()
  const { session } = useContext(SessionContext)

  /**
   * Called to perform the deletion of the access key.
   */
  const onDelete = () => {
    deleteAccessKey(accessKeyId, session).then(() => {
      // Rerender the page with the deleted access key removed.
      router.replace(router.asPath)
    })
  }

  const onCancel = () => {
    setOpen(false)
  }

  return (
    <>
      <AccessKeyControl
        label={`Delete access key ${accessKeyId}`}
        onClick={() => setOpen(true)}
        type="alert"
      >
        <TrashIcon className="fill-white" />
      </AccessKeyControl>
      <Modal isOpen={isOpen} onClose={onCancel}>
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
 * Displays a single access key and its associated controls.
 */
const AccessKeyItem = ({ accessKey }) => {
  return (
    <>
      <div className="flex items-center justify-between border border-data-border px-3 py-2 md:px-2 md:py-1">
        <div className="font-mono">{accessKey.access_key_id}</div>
        <div className="flex gap-1">
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
  if (accessKeys.length > 0) {
    return (
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accessKeys.map((accessKey) => {
          return <AccessKeyItem key={accessKey.uuid} accessKey={accessKey} />
        })}
      </div>
    )
  }
  return null
}

AccessKeyList.propTypes = {
  // Array of access keys from user object
  accessKeys: PropTypes.arrayOf(PropTypes.object).isRequired,
}

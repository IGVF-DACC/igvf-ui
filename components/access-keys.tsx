// node_modules
import {
  CheckIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { Fragment, useContext, useState } from "react";
// components
import { Button } from "./form-elements";
import { CopyButton } from "./copy-button";
import Modal from "./modal";
import SessionContext from "./session-context";
// lib
import {
  createAccessKey,
  deleteAccessKey,
  resetAccessKey,
} from "../lib/access-keys";
import { isErrorObject } from "../lib/fetch-request";

/**
 * Gets a user-facing message from a failed access-key request.
 *
 * @param error - Error object returned from the failed access-key request
 * @param action - Action being performed (e.g., "create", "reset", "delete")
 */
function getAccessKeyErrorMessage(error: unknown, action: string): string {
  if (isErrorObject(error)) {
    const messages = [error.description, error.detail]
      .filter((message) => typeof message === "string")
      .map((message) => message.trim())
      .filter(Boolean);
    return (
      [...new Set(messages)].join(" ") || `Unable to ${action} the access key.`
    );
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return `Unable to ${action} the access key.`;
}

/**
 * Displays the access key ID and secret for the modal used when creating or resetting an access
 * key.
 *
 * @param accessKeyId - Access key ID to display.
 * @param accessKeySecret - Access key secret to display.
 */
function AccessKeyDisplay({
  accessKeyId,
  accessKeySecret,
}: {
  accessKeyId: string;
  accessKeySecret: string;
}) {
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
  ];

  return (
    <div className="border-modal-border md:grid-cols-min-2 my-5 w-full gap-3 border bg-gray-100 px-2 py-2.5 md:grid md:w-auto md:auto-cols-min md:px-5 dark:bg-gray-800">
      {rows.map((row) => {
        return (
          <Fragment key={row.label}>
            <div className="text-data-title flex items-center font-bold whitespace-nowrap md:h-full">
              {row.label}
            </div>
            <div className="mb-2 flex items-center justify-between last:mb-0 md:mb-0">
              <div className="shrink font-mono">{row.value}</div>
              <div className="ml-2 flex shrink-0 justify-end">
                <CopyButton.Icon target={row.value} label={row.label}>
                  {(isCopied) =>
                    isCopied ? <CheckIcon /> : <ClipboardDocumentCheckIcon />
                  }
                </CopyButton.Icon>
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
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
};

/**
 * Displays the modal to show the user their new or reset access keys. This component always shows
 * the modal, so its visibility gets controlled from the parent component.
 *
 * @param accessKeyId - Access key ID to display.
 * @param accessKeySecret - Access key secret to display.
 * @param createOrReset - Specifies whether the modal is for creating or resetting an access key.
 * @param onClose - Callback to close the modal.
 */
function AccessKeyModal({
  accessKeyId,
  accessKeySecret,
  createOrReset,
  onClose,
}: {
  accessKeyId: string;
  accessKeySecret: string;
  createOrReset: "create" | "reset";
  onClose: () => void;
}) {
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
          onClick={onClose}
          label={accessKeyModalMessages[createOrReset].close}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Displays a button and modal to create a new access key.
 *
 * @param onAccessKeyChange - Callback to notify parent component that the access key list has changed
 * @param onError - Callback to display an error message if access key creation fails
 */
export function CreateAccessKeyTrigger({
  onAccessKeyChange,
  onError,
}: {
  onAccessKeyChange: () => void;
  onError: (message: string) => void;
}) {
  // True if modal displaying newly created access-keys is open
  const [isOpen, setOpen] = useState(false);
  // Access key ID
  const [accessKeyId, setAccessKeyId] = useState("");
  // Access key secret
  const [accessKeySecret, setAccessKeySecret] = useState("");
  const { session, sessionProperties } = useContext(SessionContext);
  const canCreateAccessKeys = sessionProperties?.user?.lab !== undefined;

  /**
   * Called to create a new access key. Once that happens it opens the modal to display the new
   * access key ID and secret.
   */
  async function createKey() {
    onError("");
    try {
      const response = await createAccessKey(session);
      setAccessKeyId(response.access_key_id);
      setAccessKeySecret(response.secret_access_key);

      // Tell the parent component that the access key list has changed. Open the modal to show the
      // new access key to the user so they can copy it.
      onAccessKeyChange();
      setOpen(true);
    } catch (error) {
      onError(getAccessKeyErrorMessage(error, "create"));
    }
  }

  function closeModal() {
    setOpen(false);
  }

  if (canCreateAccessKeys) {
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
    );
  }
  return null;
}

/**
 * Display a single access key control button.
 *
 * @param label - Label for the control for screen readers and tooltip
 * @param onClick - Function to call when the user clicks the control
 * @param type - Type of button to display
 * @param hasIconOnly - True if the control contains only an icon
 * @param children - The content of the button
 */
function AccessKeyControl({
  label,
  onClick,
  type,
  hasIconOnly,
  children,
}: {
  label: string;
  onClick: () => void;
  type?: string;
  hasIconOnly?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Button
      label={label}
      onClick={onClick}
      type={type}
      hasIconOnly={hasIconOnly}
    >
      {children}
    </Button>
  );
}

/**
 * Displays a button and new-key modal to reset an existing access key.
 *
 * @param accessKeyId - Access key ID to reset
 */
export function ResetAccessKeyTrigger({
  accessKeyId,
  onError,
}: {
  accessKeyId: string;
  onError: (message: string) => void;
}) {
  // True if modal displaying reset access-keys open
  const [isOpen, setOpen] = useState(false);
  // Access key secret
  const [accessKeySecret, setAccessKeySecret] = useState("");

  const { session } = useContext(SessionContext);

  /**
   * Creates a new access key and opens the modal to display it.
   */
  async function resetKey() {
    onError("");
    try {
      const response = await resetAccessKey(accessKeyId, session);
      setAccessKeySecret(response.secret_access_key);
      setOpen(true);
    } catch (error) {
      onError(getAccessKeyErrorMessage(error, "reset"));
    }
  }

  function closeModal() {
    setOpen(false);
  }

  return (
    <>
      <AccessKeyControl
        label={`Reset access key ${accessKeyId}`}
        onClick={resetKey}
        type="primary"
      >
        <ArrowPathIcon className="fill-white" />
        Reset
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
  );
}

/**
 * Displays a button and warning modal to delete an access key.
 *
 * @param accessKeyId - Access key ID to delete
 * @param onAccessKeyChange - Callback to tell the parent the access key list has changed
 */
function DeleteAccessKeyTrigger({
  accessKeyId,
  onAccessKeyChange,
  onError,
}: {
  accessKeyId: string;
  onAccessKeyChange: () => void;
  onError: (message: string) => void;
}) {
  // True if access key delete warning modal is visible.
  const [isOpen, setOpen] = useState(false);

  const { session } = useContext(SessionContext);

  /**
   * Called to perform the deletion of the access key.
   */
  function onDelete() {
    onError("");
    setOpen(false);
    void deleteAccessKey(accessKeyId, session)
      .then(() => {
        // Rerender the page with the deleted access key removed.
        onAccessKeyChange();
      })
      .catch((error) => {
        onError(getAccessKeyErrorMessage(error, "delete"));
      });
  }

  function onCancel() {
    setOpen(false);
  }

  return (
    <>
      <AccessKeyControl
        label={`Delete access key ${accessKeyId}`}
        onClick={() => setOpen(true)}
        type="warning"
        hasIconOnly
      >
        <TrashIcon />
      </AccessKeyControl>
      <Modal isOpen={isOpen} onClose={onCancel}>
        <Modal.Header
          onClose={onCancel}
          closeLabel="Cancel deleting access key"
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
            type="secondary"
            onClick={onCancel}
            label="Cancel deleting access key"
          >
            Cancel
          </Button>
          <Button
            type="warning"
            onClick={onDelete}
            label="Confirm deleting access key"
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/**
 * Displays a single access key and its associated controls.
 *
 * @param accessKey - Access key object to display
 * @param onAccessKeyChange - Callback to tell the parent the access key list has changed
 * @param onError - Callback to display or clear an access-key error
 */
export function AccessKeyItem({
  accessKey,
  onAccessKeyChange,
  onError,
}: {
  accessKey: { access_key_id: string };
  onAccessKeyChange: () => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="border-panel flex items-center justify-between border px-3 py-2 md:px-2 md:py-1">
      <div className="font-mono">{accessKey.access_key_id}</div>
      <div className="flex gap-1">
        <ResetAccessKeyTrigger
          accessKeyId={accessKey.access_key_id}
          onError={onError}
        />
        <DeleteAccessKeyTrigger
          accessKeyId={accessKey.access_key_id}
          onAccessKeyChange={onAccessKeyChange}
          onError={onError}
        />
      </div>
    </div>
  );
}

/**
 * Displays a list of access keys and their associated controls.
 */
export function AccessKeyList({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {children}
    </div>
  );
}

// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import React, { useContext, useState, useEffect } from "react";
// components
import { Button, ButtonLink } from "./form-elements";
import FlashMessage from "./flash-message";
import JsonEditor, { canEdit } from "./edit-func";
import SessionContext from "./session-context";
import PagePreamble from "./page-preamble";
// lib
import FetchRequest from "../lib/fetch-request";
import { sortedJson } from "../lib/general";
import { itemToSchema } from "../lib/schema";
/* istanbul ignore file */

export function useEditor(action) {
  /**
   * Represents whether the Editor component can be actively typed in or saved.
   * This is determined by the logged in status of the user and if the user has
   * edit permissions on that object being edited.
   */
  const [edit, setEditing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const isEdit = router.asPath.endsWith(`#!${action}`);
    // If the URL says edit but we aren't editing yet, set the state
    if (isEdit && !edit) {
      setEditing(true);
    }

    // If the URL has us not editing but we just were, set to false, and update props
    if (!isEdit && edit) {
      setEditing(false);
    }
  }, [edit, router, action]);

  return edit;
}

export function EditableItem({ item, children }) {
  const editing = useEditor("edit");
  return editing ? <EditPage item={item} /> : <>{children}</>;
}

EditableItem.propTypes = {
  item: PropTypes.object.isRequired,
};

export function SaveCancelControl({ saveClick, itemPath, saveEnabled }) {
  return (
    <div className="flex space-x-1">
      <ButtonLink href={itemPath} type="secondary">
        Cancel
      </ButtonLink>
      <Button onClick={saveClick} isDisabled={!saveEnabled} type="primary">
        Save
      </Button>
    </div>
  );
}

SaveCancelControl.propTypes = {
  saveClick: PropTypes.func.isRequired,
  itemPath: PropTypes.string.isRequired,
  saveEnabled: PropTypes.bool.isRequired,
};

export function SavedErrors({ errors = [] }) {
  return (
    <div>
      <p className="text-lg text-rose-600">Errors from Save:</p>
      <ul className="list-disc">
        {errors.map((error) => (
          <li key={error.description} className="text-base text-rose-600">
            {error.keys}: {error.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

SavedErrors.propTypes = {
  errors: PropTypes.array.isRequired,
};

export default function EditPage({ item }) {
  const { profiles, session } = useContext(SessionContext);

  const path = item["@id"];

  const { isAuthenticated } = useAuth0();

  function editable(item) {
    // cannot edit if not logged in or object not editable
    const itemSchema = itemToSchema(item, profiles);
    const editable = Boolean(itemSchema && canEdit(itemSchema));
    return isAuthenticated && editable;
  }

  /**
   * The text is the current editor text of the underlying Ace editor component.
   */
  const [text, setText] = useState(() => JSON.stringify({}, null, 4));

  /**
   * When attempting to save the edited text to the backend, if there are any
   * errors that come back from the server, this list will contain the error objects
   */
  const [saveErrors, setSaveErrors] = useState([]);

  const isEditable = editable(item);

  /**
   * Interactivity properties of the underlying Ace editor. `canEdit` implies the
   * user may modify the text field. `canSave` means that the Save button is active.
   * errors list indicates that the JSON entered in the field is malformed. Errors
   * is passed to the "annotations" of the underlying Ace editor which will show an
   * indicator that there's a JSON syntax error.
   *
   * If there are errors the text should not be saveable. If the user has insufficient
   * permissions both saving and editing should be disabled.
   */
  const [editorStatus, setEditorStatus] = useState({
    canEdit: isEditable,
    canSave: isEditable,
    errors: [],
  });

  useEffect(() => {
    const getRequest = new FetchRequest({ session });
    getRequest.getObject(`${path}?frame=edit`).then((value) => {
      setText(JSON.stringify(sortedJson(value.union()), null, 4));
    });
  }, [path, session]);

  const router = useRouter();

  function onChange(newValue) {
    setText(newValue);
    const isEditable = editable(item);
    const { canSave, errors } = editorStatus;
    setEditorStatus({
      canEdit: isEditable,
      canSave: canSave && isEditable,
      errors,
    });
  }

  function onError(errs) {
    const { canEdit } = editorStatus;
    setEditorStatus({
      canEdit,
      canSave: errs.length === 0 && canEdit,
      errors: errs,
    });
  }

  function save() {
    setEditorStatus({
      canEdit: false,
      canSave: false,
      errors: [],
    });
    const value = sortedJson(JSON.parse(text));
    const putRequest = new FetchRequest({ session });
    putRequest.putObject(path, value).then((response) => {
      if (response.status === "success") {
        setSaveErrors([]);
        router.push(path);
      } else {
        setEditorStatus({
          canEdit: true,
          canSave: true,
          errors: [],
        });

        const defaultDescription =
          "Error saving new item, ensure the fields are filled out correctly";
        const defaultKeys = "Generic Error";
        const errors = response.errors
          ? response.errors.map((err) => {
              // Surround each err name with ``, and separate by comma
              const keys = err.name
                .map((val) => {
                  return `\`${val}\``;
                })
                .join(", ");
              // Unique identifier for this error object
              const key = `${keys}${err.description}`;
              return {
                description: err.description,
                keys,
                key,
              };
            })
          : [
              {
                description: defaultDescription,
                keys: defaultKeys,
                key: `${defaultKeys}${defaultDescription}`,
              },
            ];
        setSaveErrors([...new Set(errors)]);
      }
    });
  }

  return (
    <div className="space-y-1">
      <PagePreamble />
      <JsonEditor
        text={text}
        onChange={onChange}
        enabled={editorStatus.canEdit}
        onError={onError}
      />
      <div className="flex flex-row-reverse">
        <SaveCancelControl
          saveClick={save}
          saveEnabled={editorStatus.canSave}
          itemPath={item["@id"]}
        />
      </div>
      {saveErrors.length > 0 &&
        saveErrors.map((error) => (
          <FlashMessage
            key={error.description}
            message={
              error.keys
                ? `${error.keys}: ${error.description}`
                : `${error.description}`
            }
            onClose={() => {
              const filteredErrors = saveErrors.filter(
                (e) => e.description !== error.description
              );
              setSaveErrors(filteredErrors);
            }}
          />
        ))}
    </div>
  );
}

EditPage.propTypes = {
  item: PropTypes.object.isRequired,
};

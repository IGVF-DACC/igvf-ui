// node_modules
import PropTypes from "prop-types"
import React, { useContext, useState, useEffect } from "react"
// components
import Button from "./button"
import EditJson, { EditLink, canEdit } from "./edit-func"
import SessionContext from "./session-context"
import { useAuthenticated } from "./authentication"
import { useRouter } from "next/router"
// libs
import Fetch from "../libs/session-fetch"

export const useEditor = (item, viewComponent) => {
  const editing = (url) => {
    return url.endsWith("#!edit")
  }

  /**
   * Represents whether the Editor component can be actively typed in or saved.
   * This is determined by the logged in status of the user and if the user has
   * edit permissions on that object being edited.
   */
  const [edit, setEditing] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const isEdit = editing(document.URL)
    // If the URL says edit but we aren't editing yet, set the state
    if (isEdit && !edit) {
      setEditing(true)
    }

    // If the URL has us not editing but we just were, set to false, and update props
    if (!isEdit && edit) {
      setEditing(false)
      router.replace(router.asPath)
    }
  }, [edit, router])

  const editpage = <EditPage item={item} />
  const editlink = <EditLink item={item} />

  const componentToShow = edit ? (
    editpage
  ) : (
    <>
      {viewComponent}
      {editlink}
    </>
  )
  return componentToShow
}

export const EditableItem = ({ item, children }) => {
  return useEditor(item, children)
}

EditableItem.propTypes = {
  item: PropTypes.object.isRequired,
}

const SaveCancelControl = ({
  cancelClick,
  saveClick,
  itemPath,
  saveEnabled,
}) => {
  return (
    <div className="flex space-x-1">
      <Button.Link
        href={itemPath}
        type="primary-outline"
        navigationClick={cancelClick}
      >
        Cancel
      </Button.Link>
      <Button
        onClick={saveClick}
        disabled={!saveEnabled}
        type={saveEnabled ? "primary" : "info"}
      >
        Save
      </Button>
    </div>
  )
}

SaveCancelControl.propTypes = {
  cancelClick: PropTypes.func.isRequired,
  saveClick: PropTypes.func.isRequired,
  itemPath: PropTypes.string.isRequired,
  saveEnabled: PropTypes.bool.isRequired,
}

function sortedJson(obj) {
  if (Array.isArray(obj)) {
    return obj.map((value) => sortedJson(value))
  }
  // We know it's not an array if we're here because the above `if`
  if (typeof obj == "object") {
    const sorted = {}
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = obj[key]
      })
    return sorted
  }
  return obj
}

const SavedErrors = ({ errors = [] }) => {
  return (
    <div>
      <p className="text-lg text-rose-600">Errors from Save:</p>
      <ul className="list-disc">
        {errors.map((error) => (
          <li key={error.description} className="text-base text-rose-600">
            {error.description}
          </li>
        ))}
      </ul>
    </div>
  )
}

SavedErrors.propTypes = {
  errors: PropTypes.array.isRequired,
}

const EditPage = ({ item }) => {
  const path = item["@id"]

  const loggedIn = useAuthenticated()

  const editable = (item) => {
    // cannot edit if not logged in or object not editable
    const editable = canEdit(item)
    return loggedIn && editable
  }

  const jsonErrors = (json) => {
    // cannot save if we cannot edit or if the JSON is wrong
    try {
      JSON.parse(json)
      return []
    } catch (err) {
      // Save the error
      return [err.message]
    }
  }

  const { session } = useContext(SessionContext)

  /**
   * The text is the current editor text of the underlying Ace editor component.
   */
  const [text, setText] = useState(() => {
    JSON.stringify({}, null, 4)
  })

  /**
   * When attempting to save the edited text to the backend, if there are any
   * errors that come back from the server, this list will contain the error objects
   */
  const [saveErrors, setSaveErrors] = useState([])

  const isEditable = editable(item)

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
  })

  useEffect(() => {
    const fetch = new Fetch(session)
    fetch
      .getObject(`${path}?frame=edit`, "GET")
      .then((value) => {
        const json = value.json()
        return json
      })
      .then((value) => {
        setText(JSON.stringify(sortedJson(value), null, 4))
      })
  }, [path, session])

  const router = useRouter()

  const onChange = (newValue) => {
    setText(newValue)
    const errors = jsonErrors(newValue)
    const isEditable = editable(item)
    const status = {
      canEdit: isEditable,
      canSave: errors.length == 0 && isEditable,
      errors,
    }
    setEditorStatus(status)
  }

  const save = () => {
    setEditorStatus({
      canEdit: false,
      canSave: false,
      errors: [],
    })
    const value = sortedJson(JSON.parse(text))
    const fetch = new Fetch(session)
    fetch.updateObject(path, "PATCH", value).then((response) => {
      if (response.ok) {
        setSaveErrors([])
        router.push(path)
      } else {
        setEditorStatus({
          canEdit: true,
          canSave: true,
          errors: [],
        })
        const errors = response.errors.map((err) => ({
          description: err.description,
          keys: err.names
            .map((val) => {
              return `\`${val}\``
            })
            .join(", "),
        }))
        setSaveErrors(errors)
      }
    })
  }

  return (
    <div className="space-y-1">
      <EditJson
        text={text}
        onChange={onChange}
        enabled={editorStatus.canEdit}
        errors={editorStatus.errors}
      />
      <div>
        <SaveCancelControl
          cancelClick={() => ({})}
          saveClick={save}
          itemPath={path}
          saveEnabled={editorStatus.canSave}
        />
        {saveErrors.length > 0 && <SavedErrors errors={saveErrors} />}
      </div>
    </div>
  )
}

EditPage.propTypes = {
  item: PropTypes.object.isRequired,
}

export default EditPage

// node_modules
import dynamic from "next/dynamic"
import PropTypes from "prop-types"
import React from "react"
// components
import Button from "./button"

export const canEdit = (item) => {
  if ("actions" in item) {
    return (
      item.actions.find(
        (act) => act.name == "edit" || act.name == "edit-json"
      ) != undefined
    )
  }
  return false
}

const Editor = dynamic(
  async () => {
    const ace = await import("react-ace")
    require("ace-builds/src-noconflict/mode-json")
    require("ace-builds/src-noconflict/theme-solarized_light")
    return ace
  },
  {
    loading: () => {
      return <div>Loading...</div>
    },
    ssr: false,
  }
)

const JsonEditor = ({ text, onChange, enabled, errors = [] }) => {
  const annotations = errors.map((msg) => ({
    row: 0,
    column: 0,
    text: msg,
    type: "error",
  }))

  const editor = (
    <Editor
      value={text}
      mode="json"
      theme="solarized_light"
      name="JSON Editor"
      onLoad={() => ({})}
      onChange={onChange}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      annotations={annotations}
      width="100%"
      readOnly={!enabled}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        useWorker: false,
        tabSize: 4,
        maxLines: 1000,
        minLines: 24,
      }}
    />
  )
  return editor
}

JsonEditor.propTypes = {
  // The text that will be shown in the editor
  text: PropTypes.string.isRequired,
  // Function that will be called whenever the contents of the editor changes
  onChange: PropTypes.func.isRequired,
  // When false, the text field on the editor cannot be changed, and when true
  // editing is allowed
  enabled: PropTypes.bool.isRequired,
  // If there are any errors in the text, these are passed on to the react-ace `annotations`
  // prop and are rendered in the editor component. Array elements are the error
  // messages as strings.
  errors: PropTypes.array,
}

const ControlButton = ({ onClick, isDisabled = false, children }) => {
  return (
    <Button onClick={onClick} enabled={!isDisabled}>
      {children}
    </Button>
  )
}

ControlButton.propTypes = {
  onClick: PropTypes.func,
  isDisabled: PropTypes.bool,
}

const SaveCancelControl = ({ cancelClick, saveClick }) => {
  return (
    <div>
      <Button onClick={cancelClick} id="edit-cancel">
        Cancel
      </Button>
      <Button onClick={saveClick} id="edit-save">
        Save
      </Button>
    </div>
  )
}

SaveCancelControl.propTypes = {
  cancelClick: PropTypes.func.isRequired,
  saveClick: PropTypes.func.isRequired,
}

const EditJson = ({ text, onChange, enabled = true, errors = [] }) => {
  return (
    <div className="relative m-px w-full border-2 border-solid border-slate-300">
      <JsonEditor
        text={text}
        onChange={onChange}
        enabled={enabled}
        errors={errors}
      />
    </div>
  )
}

EditJson.propTypes = {
  text: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  enabled: PropTypes.bool,
  errors: PropTypes.array,
}

export const EditLink = ({ item }) => {
  const removeTrailingSlash = (url) => {
    return url.endsWith("/") ? url.slice(0, url.length - 1) : url
  }

  const editPath = `${removeTrailingSlash(item["@id"])}/#!edit`
  if (canEdit(item)) {
    return (
      <Button.Link href={editPath} navigationClick={() => {}}>
        Edit JSON
      </Button.Link>
    )
  }
  return null
}

EditLink.propTypes = {
  item: PropTypes.object.isRequired,
}

export default EditJson

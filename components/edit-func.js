// node_modules
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import React from "react";
// components
import Button from "./button";

export const canEdit = (item, actions = ["edit", "edit-json"]) => {
  if ("actions" in item) {
    return item.actions.find((act) => actions.includes(act.name)) != undefined;
  }
  return false;
};

const Editor = dynamic(
  async () => {
    const ace = await import("react-ace");
    require("ace-builds/src-noconflict/mode-json");
    require("ace-builds/src-noconflict/theme-solarized_light");
    return ace;
  },
  {
    loading: () => {
      return <div>Loading...</div>;
    },
    ssr: false,
  }
);

const JsonEditor = ({ text, onChange, enabled, errors = [] }) => {
  const annotations = errors.map((msg) => ({
    row: 0,
    column: 0,
    text: msg,
    type: "error",
  }));

  return (
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
  );
};

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
};

const ControlButton = ({ onClick, isDisabled = false, children }) => {
  return (
    <Button onClick={onClick} enabled={!isDisabled}>
      {children}
    </Button>
  );
};

ControlButton.propTypes = {
  onClick: PropTypes.func,
  isDisabled: PropTypes.bool,
};

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
  );
};

EditJson.propTypes = {
  text: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  enabled: PropTypes.bool,
  errors: PropTypes.array,
};

export const EditLink = ({ item }) => {
  const removeTrailingSlash = (url) => {
    return url.endsWith("/") ? url.slice(0, url.length - 1) : url;
  };

  const editPath = `${removeTrailingSlash(item["@id"])}/#!edit`;
  if (canEdit(item)) {
    return (
      <Button.LinkIcon
        label="Edit"
        href={editPath}
        className="mt-2"
        size="6"
        type="primary-outline"
      >
        <PencilSquareIcon title="Edit" />
      </Button.LinkIcon>
    );
  }
  return null;
};

EditLink.propTypes = {
  item: PropTypes.object.isRequired,
};

export default EditJson;

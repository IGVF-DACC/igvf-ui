// node_modules
import dynamic from "next/dynamic";
import findDuplicatedPropertyKeys from "find-duplicated-property-keys";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";
import { useContext, useEffect, useState } from "react";
import _ from "lodash";
// components
import { Button, ButtonLink } from "./form-elements";
import SessionContext from "./session-context";
import GlobalContext from "./global-context";
// lib
import { removeTrailingSlash } from "../lib/general";
import { itemToSchema } from "../lib/schema";
/* istanbul ignore file */

/**
 * Determines whether the given schema represents an object type that people can edit.
 * @param {object} schema For type being tested for editability
 * @returns {boolean} True if the schema represents an object type people can edit
 */
export function canEdit(schema) {
  return Boolean(schema.identifyingProperties?.length > 0);
}

function jsonErrors(json) {
  // cannot save if we cannot edit or if the JSON is wrong
  try {
    JSON.parse(json);
    const r = findDuplicatedPropertyKeys(json);
    if (r.length > 0) {
      return [`duplicate key: '${r[0].key}'`];
    }
    return [];
  } catch (err) {
    // Save the error
    return [err.message];
  }
}

const Editor = dynamic(
  async () => {
    const ace = await import("react-ace");
    require("ace-builds/src-noconflict/mode-json");
    require("ace-builds/src-noconflict/theme-solarized_light");
    require("ace-builds/src-noconflict/theme-solarized_dark");
    require("ace-builds/src-noconflict/ext-language_tools");
    return ace;
  },
  {
    loading: () => {
      return <div>Loading...</div>;
    },
    ssr: false,
  }
);

const CONTRAST_MODE_LIGHT = "solarized_light";
const CONTRAST_MODE_DARK = "solarized_dark";

export default function JsonEditor({
  text,
  onChange,
  enabled,
  onError = null,
}) {
  const { darkMode } = useContext(GlobalContext);

  const [theme, setTheme] = useState(CONTRAST_MODE_LIGHT);

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (darkMode.enabled) {
      setTheme(CONTRAST_MODE_DARK);
    } else {
      setTheme(CONTRAST_MODE_LIGHT);
    }
  }, [darkMode.enabled]);

  useEffect(() => {
    const newErrors = jsonErrors(text);
    // If we have a new error,
    // or if we previously had an error but now have [] then set Errors
    if (
      (newErrors.length > 0 && !_.isEqual(newErrors, errors)) ||
      (newErrors.length === 0 && errors.length > 0)
    ) {
      if (onError !== null) {
        onError(newErrors);
      }
      setErrors(newErrors);
    }
  }, [text, errors, onError]);

  const annotations = errors.map((msg) => ({
    row: 0,
    column: 0,
    text: msg,
    type: "error",
  }));

  return (
    <>
      <div className="relative m-px w-full border-2 border-solid border-slate-300">
        <Editor
          value={text}
          mode="json"
          theme={theme}
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
      </div>
    </>
  );
}

JsonEditor.propTypes = {
  // The text that will be shown in the editor
  text: PropTypes.string.isRequired,
  // Function that will be called whenever the contents of the editor changes
  onChange: PropTypes.func.isRequired,
  // When false, the text field on the editor cannot be changed, and when true
  // editing is allowed
  enabled: PropTypes.bool.isRequired,
  // If defined, then this is called if the parsed text produces any JSON parse errors
  onError: PropTypes.func,
};

function ControlButton({ onClick, isDisabled = false, children }) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      {children}
    </Button>
  );
}

ControlButton.propTypes = {
  onClick: PropTypes.func,
  isDisabled: PropTypes.bool,
};

// export default function EditJson({
//   text,
//   onChange,
//   enabled = true,
// }) {
//   return (
//     <div className="relative m-px w-full border-2 border-solid border-slate-300">
//       <JsonEditor
//         text={text}
//         onChange={onChange}
//         enabled={enabled}
//       />
//     </div>
//   );
// }

// EditJson.propTypes = {
//   text: PropTypes.string.isRequired,
//   onChange: PropTypes.func.isRequired,
//   enabled: PropTypes.bool,
// };

export function EditLink({ item }) {
  const { profiles } = useContext(SessionContext);
  const { isAuthenticated } = useAuth0();

  const itemSchema = itemToSchema(item, profiles);
  if (isAuthenticated && itemSchema && canEdit(itemSchema)) {
    const editPath = `${removeTrailingSlash(item["@id"])}#!edit`;
    return (
      <div className="flex justify-end">
        <ButtonLink
          label="Edit"
          href={editPath}
          type="secondary"
          size="sm"
          hasIconOnly
        >
          <PencilSquareIcon title="Edit" />
        </ButtonLink>
      </div>
    );
  }
  return null;
}

EditLink.propTypes = {
  item: PropTypes.object.isRequired,
};

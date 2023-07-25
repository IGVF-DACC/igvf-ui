// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { empty } from "empty-schema";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { PropTypes } from "prop-types";
import { useContext, useState, useEffect } from "react";
// components
import { SaveCancelControl, useEditor } from "./edit";
import EditJson, { canEdit } from "./edit-func";
import FlashMessage from "./flash-message";
import { ButtonLink } from "./form-elements";
import SessionContext from "./session-context";
// lib
import FetchRequest from "../lib/fetch-request";
import { urlWithoutParams, sortedJson } from "../lib/general";
import { collectionToSchema } from "../lib/schema";
/* istanbul ignore file */

/**
 * Looks for an action in the item with a name in the list of given actions
 * and returns the profile path of the first one found, or null if none are found.
 * @param {*} item snovault object
 * @param {*} actions list of actions to find from which to grab
 * the profile path
 * @returns the profile path corresponding to an action or null if there
 * are no available actions or if the none of the specified actions are present.
 */
function actionProfile(item, actions) {
  if ("actions" in item) {
    const act = item.actions.find((act) => actions.includes(act.name));
    if (act !== null) {
      return act.profile;
    }
  }
  return null;
}

/**
 * This takes a schema object and adds to the required properties
 * in order for the blank template library to autogenerate stubs
 * for as many fields as makes sense
 *
 * We eliminate properties that have permission requirements, not
 * submittable, commented with "Do not submit", or arrays/objects.
 *
 * @param {*} schema the schema to modify in perpartion for producing
 * an empty template
 *
 * @returns The modified schema with appropriate fields added as
 * required
 */
function convertOptionalIntoRequiredSchema(schema) {
  const topProperties = Object.entries(schema.properties)
    .filter(([, p]) => {
      return p.comment ? !p.comment.includes("Do not submit") : true;
    })
    .filter(([, p]) => {
      return !p.permission;
    })
    .filter(([, p]) => {
      return p.notSubmittable ? !p.notSubmittable : true;
    })
    .filter(([, p]) => {
      return !["array", "object"].includes(p.type);
    })
    .map(([k]) => {
      return k;
    });
  const newschema = schema;
  newschema.required = [...topProperties, ...schema.required];
  return newschema;
}

/**
 * Extract a usable name from a schema object that we can use in a path to add or edit an object.
 * Likely this doesn't match the real path, but igvfd can use this to redirect to the correct path.
 * @param {object} schema Schema for a single type from /profiles
 * @returns {string} Name of the schema; null if not found
 */
function schemaToName(schema) {
  const matchingName = schema.$id.match(/^\/profiles\/(.*)\.json$/);
  return matchingName ? matchingName[1] : null;
}

/**
 * Generates a button link to the #!add url for the given collection.
 * A custom label can be suplied with the `label` prop.
 */
export function AddLink({ schema, label = null }) {
  const { isAuthenticated } = useAuth0();
  if (isAuthenticated && canEdit(schema)) {
    const schemaName = schemaToName(schema);
    if (schemaName) {
      const objectAddPath =
        schema.$id === "/profiles/page.json"
          ? "/add-page#!edit"
          : `/${schemaName}#!add`;

      return (
        <ButtonLink
          label={label}
          href={objectAddPath}
          size="sm"
          type="secondary"
          hasIconOnly
        >
          <PlusIcon />
        </ButtonLink>
      );
    }
  }
  return null;
}

AddLink.propTypes = {
  // Schema for the collection to add to
  schema: PropTypes.object.isRequired,
  // Label for the Add button
  label: PropTypes.string,
};

export function AddInstancePage({ collection }) {
  const { profiles, session } = useContext(SessionContext);
  const { isAuthenticated } = useAuth0();

  /**
   * The text is the current editor text of the underlying Ace editor component.
   */
  const [text, setText] = useState(() => JSON.stringify({}, null, 4));

  const router = useRouter();

  // Cannot add if not logged in or "add" not an action
  function addable(collection) {
    const itemSchema = collectionToSchema(collection, profiles);
    const canAdd = Boolean(itemSchema && canEdit(itemSchema));
    return isAuthenticated && canAdd;
  }

  function jsonErrors(json) {
    // cannot save if we cannot edit or if the JSON is wrong
    try {
      JSON.parse(json);
      return [];
    } catch (err) {
      // Save the error
      return [err.message];
    }
  }

  /**
   * When attempting to save the edited text to the backend, if there are any
   * errors that come back from the server, this list will contain the error objects
   */
  const [saveErrors, setSaveErrors] = useState([]);
  const isAddable = addable(collection);

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
    canEdit: isAddable,
    canSave: isAddable,
    errors: [],
  });

  // Profile Path for the "add" action in this collection
  const profilePath = actionProfile(collection, "add");

  useEffect(() => {
    // Grab the schema from profilePath so we can make an empty object template
    new FetchRequest({ session }).getObject(profilePath).then((schema) => {
      // We have the schema, so produce a dummy json from the schema
      const biggerSchema = convertOptionalIntoRequiredSchema(schema);
      const basic = empty(biggerSchema);
      setText(JSON.stringify(basic, null, 4));
    });
  }, [profilePath, session]);

  function onChange(newValue) {
    setText(newValue);
    const errors = jsonErrors(newValue);
    const isAddable = addable(collection);
    const status = {
      canEdit: isAddable,
      canSave: errors.length === 0 && isAddable,
      errors,
    };
    setEditorStatus(status);
  }

  function save() {
    setEditorStatus({
      canEdit: false,
      canSave: false,
      errors: [],
    });

    const value = sortedJson(JSON.parse(text));
    const collectPath = urlWithoutParams(collection["@id"]);
    new FetchRequest({ session })
      .postObject(collectPath, value)
      .then((response) => {
        if (response.status === "success") {
          setSaveErrors([]);
          router.push(response["@graph"][0]["@id"]);
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
      <EditJson
        text={text}
        onChange={onChange}
        enabled={editorStatus.canEdit}
        errors={editorStatus.errors}
      />
      <div className="flex justify-end">
        <SaveCancelControl
          saveClick={save}
          itemPath={urlWithoutParams(collection["@id"])}
          saveEnabled={editorStatus.canSave}
        />
      </div>
      {saveErrors.length > 0 &&
        saveErrors.map((error) => (
          <FlashMessage
            key={`${error.key}`}
            message={
              error.keys
                ? `${error.keys}: ${error.description}`
                : `${error.description}`
            }
            onClose={() => {
              const filteredErrors = saveErrors.filter(
                (e) => e.key !== error.key,
              );
              setSaveErrors(filteredErrors);
            }}
          />
        ))}
    </div>
  );
}

AddInstancePage.propTypes = {
  collection: PropTypes.object.isRequired,
};

export function AddableItem({ collection, children }) {
  const editing = useEditor("add");
  return editing ? (
    <AddInstancePage collection={collection} />
  ) : (
    <>{children}</>
  );
}

AddableItem.propTypes = {
  collection: PropTypes.object.isRequired,
};

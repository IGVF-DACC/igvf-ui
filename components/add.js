import Button from "./button";
import { PropTypes } from "prop-types";
import SessionContext from "./session-context";
import { useContext } from "react";
import FetchRequest from "../lib/fetch-request";
import { useAuthenticated } from "./authentication";
import EditJson, { canEdit } from "./edit-func";
import { useState } from "react";
import { useEffect } from "react";
import { SaveCancelControl, SavedErrors, sortedJson, useEditor } from "./edit";
import { useRouter } from "next/router";
import { empty } from "empty-schema";
import { urlWithoutParams } from "../lib/general";
import ProfileMapContext from "./profile-map";

/**
 * Looks for an action in the item with a name in the list of given actions
 * and returns the profile path of the first one found, or null if none are found.
 * @param {*} item snovault object
 * @param {*} actions list of actions to find from which to grab
 * the profile path
 * @returns the profile path corresponding to an action or null if there
 * are no available actions or if the none of the specified actions are present.
 */
const actionProfile = (item, actions) => {
  if ("actions" in item) {
    const act = item.actions.find((act) => actions.includes(act.name));
    if (act != null) {
      return act.profile;
    }
  }
  return null;
};

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
const convertOptionalIntoRequiredSchema = (schema) => {
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
};

/**
 * Generates a button link to the #!add url for the given collection.
 * A custom label can be suplied with the `label` prop.
 */
export const AddLink = ({
  collection,
  label = "Add Instance",
  type = "primary",
  size = "sm",
}) => {
  const collectPath = urlWithoutParams(collection["@id"]);

  if (canEdit(collection, ["add"])) {
    return (
      <Button.Link type={type} size={size} href={`${collectPath}#!add`}>
        {label}
      </Button.Link>
    );
  }
};

AddLink.propTypes = {
  collection: PropTypes.object.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.string,
};

export const AddInstancePage = ({ collection }) => {
  const { session } = useContext(SessionContext);
  const loggedIn = useAuthenticated();

  /**
   * The text is the current editor text of the underlying Ace editor component.
   */
  const [text, setText] = useState(() => JSON.stringify({}, null, 4));

  const router = useRouter();

  // Cannot add if not logged in or "add" not an action
  const addable = (collection) => {
    const canAdd = canEdit(collection, "add");
    return loggedIn && canAdd;
  };

  const jsonErrors = (json) => {
    // cannot save if we cannot edit or if the JSON is wrong
    try {
      JSON.parse(json);
      return [];
    } catch (err) {
      // Save the error
      return [err.message];
    }
  };

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

  const onChange = (newValue) => {
    setText(newValue);
    const errors = jsonErrors(newValue);
    const isAddable = addable(collection);
    const status = {
      canEdit: isAddable,
      canSave: errors.length == 0 && isAddable,
      errors,
    };
    setEditorStatus(status);
  };

  const save = () => {
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
          router.push(collectPath);
        } else {
          setEditorStatus({
            canEdit: true,
            canSave: true,
            errors: [],
          });

          const errors = response.errors
            ? response.errors.map((err) => ({
                description: err.description,
                keys: err.name
                  .map((val) => {
                    return `\`${val}\``;
                  })
                  .join(", "),
              }))
            : [
                {
                  description:
                    "Error saving new item, ensure the fields are filled out correctly",
                  keys: "Generic Error",
                },
              ];
          setSaveErrors(errors);
        }
      });
  };

  const cancel = () => {
    router.back();
  };

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
          cancelClick={cancel}
          saveClick={save}
          itemPath={urlWithoutParams(collection["@id"])}
          saveEnabled={editorStatus.canSave}
        />
        {saveErrors.length > 0 && <SavedErrors errors={saveErrors} />}
      </div>
    </div>
  );
};

AddInstancePage.propTypes = {
  collection: PropTypes.object.isRequired,
};

export const AddableItem = ({ collection, children }) => {
  const editing = useEditor("add");
  return editing ? (
    <AddInstancePage collection={collection} />
  ) : (
    <>{children}</>
  );
};

AddableItem.propTypes = {
  collection: PropTypes.object.isRequired,
};

/**
 * Given a schema, if the present user has sufficient permissions a
 * button is produced which points to the corresponding collection #!add
 * URL, allowing the user to Add an object of the schema type to the
 * collection.
 */
export const AddItemFromSchema = ({
  schema,
  label = "Add Instance",
  type = "primary-outline",
  size = "sm",
}) => {

  const { profileMap } = useContext(ProfileMapContext);

  const [collection, setCollection] = useState(null);

  useEffect(() => {
    const schemaId = schema["$id"].match(/^\/profiles\/(.+).json$/)[1];

    setCollection(profileMap[schemaId]);
  }, [profileMap, schema]);

  if (collection) {
    return (
      <AddLink collection={collection} label={label} type={type} size={size} />
    );
  }
};

AddItemFromSchema.propTypes = {
  schema: PropTypes.object.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.string,
};

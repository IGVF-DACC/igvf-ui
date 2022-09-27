import Button from "./button";
import { PropTypes } from 'prop-types';
import SessionContext from './session-context';
import { useContext } from 'react';
import FetchRequest from "../lib/fetch-request";
import { useAuthenticated } from './authentication';
import EditJson, { canEdit } from './edit-func';
import { useState } from 'react';
import { useEffect } from 'react';
import { SaveCancelControl, SavedErrors } from "./edit";
import { useRouter } from 'next/router';
import { empty } from 'empty-schema';

export const collectionPath = (schema) => {
  // Something like "/profiles/human_donor.json"
  const schema_id = removeJsonExtension(schema["$id"]);
  // Go from "/profiles/human_donor" to "human_donor"
  const collection = schema_id.split("/").pop();
  return `/${collection}`;
};

const actionProfile = (item, actions) => {
  if ("actions" in item) {
    const act = item.actions.find(
      (act) => actions.includes(act.name)
    );
    if (act != null) {
      return act.profile;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

function sortedJson(obj) {
  if (Array.isArray(obj)) {
    return obj.map((value) => sortedJson(value));
  }
  // We know it's not an array if we're here because the above `if`
  if (typeof obj == "object") {
    const sorted = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = obj[key];
      });
    return sorted;
  }
  return obj;
}

const convertOptionalIntoRequiredSchema = (schema) => {
  const topProperties = Object.keys(schema["properties"]).filter((k) => { return !["@type", "uuid", "@id", "schema_version"].includes(k); });
  const newschema = schema;
  newschema.required = topProperties;
  return newschema;
};

export const useEditor = (collection, viewComponent, action = "edit") => {
  // const editing = (url) => {
  //   return url.endsWith(`#!${action}`);
  // };

  /**
   * Represents whether the Editor component can be actively typed in or saved.
   * This is determined by the logged in status of the user and if the user has
   * edit permissions on that object being edited.
   */
  const [edit, setEditing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const isEdit = document.URL.endsWith(`#!${action}`);
    // If the URL says edit but we aren't editing yet, set the state
    if (isEdit && !edit) {
      setEditing(true);
    }

    // If the URL has us not editing but we just were, set to false, and update props
    if (!isEdit && edit) {
      setEditing(false);
      router.replace(router.asPath);
    }
  }, [edit, router, action]);

  const addpage = <AddInstancePage collection={collection} />;
  const addlink = <AddLink collection={collection} />;

  const componentToShow = edit ? (
    addpage
  ) : (
    <>
      {viewComponent}
      {addlink}
    </>
  );
  return componentToShow;
};

const removeJsonExtension = (url) => {
  return url.endsWith(".json") ? url.split(".").slice(0, -1).join(".") : url;
};

const collectionPathWithoutLimit = (collection) => {
  return collection["@id"].split("?")[0];
};

export const AddLink = ({ collection }) => {
  // const addPath = `${removeJsonExtension(schema["$id"])}/#!add`;
  if (canEdit(collection, ["add"])) {
    const collectPath = collectionPathWithoutLimit(collection);
    return (
      <Button.Link href={`${collectPath}/#!add`} navigationClick={() => {}}>
        Add Instance
      </Button.Link>
    );
  }
};

AddLink.propTypes = {
  collection: PropTypes.object.isRequired,
};

export const AddInstancePage = ({ collection }) => {
  const { session } = useContext(SessionContext);
  // const request = useMemo(() => { return new FetchRequest(session); }, [session]);
  const loggedIn = useAuthenticated();

  console.log("Render!");
  console.log(session);
  /**
   * The text is the current editor text of the underlying Ace editor component.
   */
  const [text, setText] = useState(() => {
    JSON.stringify({}, null, 4);
  });

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

  const profilePath = actionProfile(collection, "add");

  useEffect(() => {
    new FetchRequest(session).getObject(profilePath).then((schema) => {
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
      canSave: true,
      errors,
    };
    setEditorStatus(status);
  };

  const save = () => {
    console.log("SAVING!");
    setEditorStatus({
      canEdit: false,
      canSave: false,
      errors: [],
    });

    const value = sortedJson(JSON.parse(text));
    const collectionPath = collectionPathWithoutLimit(collection);
    console.log("SESSION before POST!");
    console.log(session);
    new FetchRequest(session).postObject(collectionPath, value).then((response) => {
      if (response.status === "success") {
        setSaveErrors([]);
        router.push(collectionPath);
      } else {
        setEditorStatus({
          canEdit: true,
          canSave: true,
          errors: [],
        });
        const errors = response.errors.map((err) => ({
          description: err.description,
          keys: err.name
            .map((val) => {
              return `\`${val}\``;
            })
            .join(", "),
        }));
        setSaveErrors(errors);
      }
    });
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
          cancelClick={() => ({})}
          saveClick={save}
          itemPath={collectionPathWithoutLimit(collection)}
          saveEnabled={editorStatus.canSave}
        />
        {saveErrors.length > 0 && <SavedErrors errors={saveErrors}/>}
      </div>
    </div>
  );
};

AddInstancePage.propTypes = {
  collection: PropTypes.object.isRequired,
};

export const AddableItem = ({ collection, children }) => {
  return useEditor(collection, children, "add");
};

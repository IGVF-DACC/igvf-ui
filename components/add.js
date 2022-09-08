import Button from "./button";
import { PropTypes } from 'prop-types';

export const canAdd = (_schema) => {
  if ("hello" in _schema) {
    console.log("hello");
  }
  return true;
};

export const collectionPath = (schema) => {
  // Something like "/profiles/human_donor.json"
  const schema_id = removeJsonExtension(schema["$id"]);
  // Go from "/profiles/human_donor" to "human-donor"
  const collection = schema_id.split("/").pop().replace("_", "-");
  return `/${collection}s`;
};

const removeJsonExtension = (url) => {
  return url.endsWith(".json") ? url.split(".").slice(0, -1).join(".") : url;
};

export const AddLink = ({ schema }) => {
  const addPath = `${removeJsonExtension(schema["$id"])}/#!add`;

  if (canAdd(schema)) {
    return (
      <Button.Link href={addPath} navigationClick={() => {}}>
        Add Instance
      </Button.Link>
    );
  }
};

AddLink.propTypes = {
  schema: PropTypes.object.isRequired,
};

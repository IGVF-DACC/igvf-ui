// node_modules
import {
  BeakerIcon,
  BookmarkIcon,
  CircleStackIcon,
  DocumentIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  PaperClipIcon,
  PencilSquareIcon,
  PhotoIcon,
  RectangleGroupIcon,
  SparklesIcon,
  TagIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
// components
import Icon from "./icon";

/**
 * Maps the `@type` for an individual schema to an icon component. For any `@type` without an icon,
 * just don't include that `@type` in this map so that a default icon gets used.
 */
const schemaIconMap = {
  Award: Icon.Award,
  Biomarker: BookmarkIcon,
  Document: PaperClipIcon,
  Donor: Icon.Donor,
  File: DocumentTextIcon,
  FileSet: Icon.FileSet,
  Gene: Icon.Gene,
  Image: PhotoIcon,
  Lab: BeakerIcon,
  Modification: RectangleGroupIcon,
  OntologyTerm: TagIcon,
  Page: DocumentIcon,
  PhenotypicFeature: SparklesIcon,
  Publication: PencilSquareIcon,
  Sample: Icon.Sample,
  Software: CircleStackIcon,
  Source: InformationCircleIcon,
  Treatment: Icon.Treatment,
  User: UserGroupIcon,
};

/**
 * Displays an icon for the given schema @type. Schema types without an icon use a default icon.
 */
export default function SchemaIcon({ type, className = "w-4 h-4" }) {
  const SingleSchemaIcon = schemaIconMap[type] || Icon.Splat;
  return <SingleSchemaIcon className={className} />;
}

SchemaIcon.propTypes = {
  // @type of the schema whose icon to display
  type: PropTypes.string.isRequired,
  // Additional Tailwind CSS classes to apply to the icon
  className: PropTypes.string,
};

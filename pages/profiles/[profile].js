// node_modules
import { AnimatePresence, motion } from "framer-motion";
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { marked } from "marked";
import { useContext, useState } from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../../components/animation";
import Breadcrumbs from "../../components/breadcrumbs";
import Checkbox from "../../components/checkbox";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import Icon from "../../components/icon";
import JsonPanel from "../../components/json-panel";
import PagePreamble from "../../components/page-preamble";
import SessionContext from "../../components/session-context";
import {
  TabGroup,
  TabList,
  TabPane,
  TabPanes,
  TabTitle,
} from "../../components/tabs";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { errorObjectToProps } from "../../lib/errors";
import { toShishkebabCase } from "../../lib/general";
import FetchRequest from "../../lib/fetch-request";
import { AddLink } from "../../components/add";

/**
 * Display an expandable/collapsable JSON panel for the given schema property or dependency.
 */
function SchemaJsonPanel({ property, panelId, isJsonDetailOpen }) {
  return (
    <AnimatePresence>
      {isJsonDetailOpen && (
        <motion.div
          className="overflow-hidden"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          transition={standardAnimationTransition}
          variants={standardAnimationVariants}
        >
          <JsonPanel
            id={`schema-json-${panelId}`}
            className="ml-5 border border-gray-300 text-xs"
          >
            {JSON.stringify(property, null, 2)}
          </JsonPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

SchemaJsonPanel.propTypes = {
  // Schema property to display
  property: PropTypes.object.isRequired,
  // HTML id of the JSON panel
  panelId: PropTypes.string.isRequired,
  // True if the JSON panel is open
  isJsonDetailOpen: PropTypes.bool.isRequired,
};

/**
 * Display a single property dependency with a toggle to show the JSON detail.
 */
function Dependency({
  dependencyProperty,
  dependencies,
  isJsonDetailOpen,
  setJsonDetailOpen,
}) {
  const dependency = dependencies[dependencyProperty];
  const dependencyControlId = `dependency-${dependencyProperty}-control`;
  const dependencyPanelId = `dependency-${dependencyProperty}`;

  return (
    <div className="my-6 first:mt-0 last:mb-0">
      <button
        id={dependencyControlId}
        onClick={(e) => setJsonDetailOpen(dependencyProperty, e.altKey)}
        className="flex items-center pr-2 text-sm font-bold text-schema-prop"
        aria-label={`${dependencyProperty} dependency`}
        aria-expanded={isJsonDetailOpen}
        aria-controls={dependencyPanelId}
      >
        {isJsonDetailOpen ? (
          <MinusIcon className="mr-1 h-4 w-4" />
        ) : (
          <PlusIcon className="mr-1 h-4 w-4" />
        )}
        <div className="break-all text-left">{dependencyProperty}</div>
      </button>
      <div className="ml-5 text-sm text-schema-prop-description">
        {dependency.comment}
      </div>
      <SchemaJsonPanel
        property={dependency}
        panelId={dependencyPanelId}
        isJsonDetailOpen={isJsonDetailOpen}
      />
    </div>
  );
}

Dependency.propTypes = {
  // Property that has dependencies
  dependencyProperty: PropTypes.string.isRequired,
  // Single property dependency to display
  dependencies: PropTypes.object.isRequired,
  // True if the JSON panel is open
  isJsonDetailOpen: PropTypes.bool.isRequired,
  // Callback to set the JSON panel open state
  setJsonDetailOpen: PropTypes.func.isRequired,
};

/**
 * Section of the display that shows the property dependencies of a schema.
 */
function Dependencies({ dependencies = null }) {
  // Contains the names of all properties with their JSON panels open
  const [openJsonIds, setOpenJsonIds] = useState([]);

  // Callback to set the JSON panel open state for property dependencies.
  function handleJsonPanelOpen(propertyId, isOptionKey) {
    if (openJsonIds.includes(propertyId)) {
      // The clicked property is open. Remove it from the list of open panels, or close all panels
      // if the user holds down the option key.
      if (isOptionKey) {
        setOpenJsonIds([]);
      } else {
        setOpenJsonIds(openJsonIds.filter((id) => id !== propertyId));
      }
    } else {
      // The clicked property is closed. Add it to the list of open panels, or open all panels if
      // the user holds down the option key.
      if (isOptionKey) {
        setOpenJsonIds(Object.keys(dependencies));
      } else {
        setOpenJsonIds([...openJsonIds, propertyId]);
      }
    }
  }

  if (dependencies) {
    const properties = Object.keys(dependencies).sort();
    return (
      <div className="p-4">
        {properties.map((property) => (
          <Dependency
            key={property}
            dependencyProperty={property}
            dependencies={dependencies}
            isJsonDetailOpen={openJsonIds.includes(property)}
            setJsonDetailOpen={handleJsonPanelOpen}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="px-2 py-6 text-center italic">
      No property dependencies for this schema.
    </div>
  );
}

Dependencies.propTypes = {
  // All schema property dependencies to display
  dependencies: PropTypes.object,
};

/**
 * If a property is not user submittable, display this status. Otherwise, display nothing.
 */
function NotSubmittableStatus({ property }) {
  return property.notSubmittable ? (
    <Icon.PencilSlash
      className="mr-1 h-4 w-4"
      testid={`property-not-submittable-${toShishkebabCase(property.title)}`}
    />
  ) : null;
}

NotSubmittableStatus.propTypes = {
  // Schema property to display the not-submittable status of properties
  property: PropTypes.object.isRequired,
};

/**
 * Defines the status badge background and border colors for each possible schema type.
 */
const TYPE_COLORS = {
  string:
    "text-schema-prop-type-string bg-schema-prop-type-string border-schema-prop-type-string",
  number:
    "text-schema-prop-type-number bg-schema-prop-type-number border-schema-prop-type-number",
  integer:
    "text-schema-prop-type-integer bg-schema-prop-type-integer border-schema-prop-type-integer",
  boolean:
    "text-schema-prop-type-boolean bg-schema-prop-type-boolean border-schema-prop-type-boolean",
  array:
    "text-schema-prop-type-array bg-schema-prop-type-array border-schema-prop-type-array",
  object:
    "text-schema-prop-type-object bg-schema-prop-type-object border-schema-prop-type-object",
  link: "text-schema-prop-type-link bg-schema-prop-type-link border-schema-prop-type-link",
  null: "text-schema-prop-type-null bg-schema-prop-type-null border-schema-prop-type-null",
  default:
    "text-schema-prop-type-default bg-schema-prop-type-default border-schema-prop-type-default",
};

/**
 * Display the types of the given schema property as little badges. In rare cases, a property can
 * have multiple types, in which case this displays multiple type badges side by side.
 */
function SchemaTypes({ property }) {
  if (property.type) {
    // property.type can hold a single value or an array of values. Normalize that to an array
    // even for one value.
    const types = Array.isArray(property.type)
      ? property.type
      : [property.type];

    // Convert any "string" entries to "link" if the property has a `linkTo` property.
    const typesWithLinks = types.map((type) => {
      return type === "string" && property.linkTo ? "link" : type;
    });

    return (
      <div className="flex gap-1">
        {typesWithLinks.map((type) => {
          const typeColor = TYPE_COLORS[type] || TYPE_COLORS.default;
          return (
            <div
              key={type}
              className={`border px-1 text-xs font-semibold text-gray-800 ${typeColor}`}
            >
              {type}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

SchemaTypes.propTypes = {
  // Schema property to display
  property: PropTypes.object.isRequired,
};

/**
 * Display a single property of the schema including its name, types, submittable status,
 * description, and the property's collapsable JSON representation.
 */
function SchemaProperty({
  propertyId,
  properties,
  isJsonDetailOpen,
  setJsonDetailOpen,
}) {
  const property = properties[propertyId];
  const propertyControlId = `property-${propertyId}-control`;
  const propertyPanelId = `property-${propertyId}`;

  return (
    <div
      className="my-6 first:mt-0 last:mb-0"
      data-testid={`schema-property-${propertyId}`}
    >
      <div className="gap-1 @sm:flex">
        <button
          id={propertyControlId}
          onClick={(e) => setJsonDetailOpen(propertyId, e.altKey)}
          className="flex items-center pr-1 text-sm font-bold text-schema-prop"
          aria-label={`${propertyId} property`}
          aria-expanded={isJsonDetailOpen}
          aria-controls={propertyPanelId}
        >
          {isJsonDetailOpen ? (
            <MinusIcon className="mr-1 h-4 w-4" />
          ) : (
            <PlusIcon className="mr-1 h-4 w-4" />
          )}
          <div className="break-all text-left">{propertyId}</div>
        </button>
        <div className="ml-5 flex gap-1 @sm:ml-0">
          <SchemaTypes property={property} />
          <NotSubmittableStatus property={property} />
        </div>
      </div>
      {property.description && (
        <div className="ml-5 text-sm text-schema-prop-description">
          {property.description}
        </div>
      )}
      <SchemaJsonPanel
        property={property}
        panelId={propertyPanelId}
        isJsonDetailOpen={isJsonDetailOpen}
      />
    </div>
  );
}

SchemaProperty.propTypes = {
  // Schema property to display
  propertyId: PropTypes.string.isRequired,
  // All schema properties to display
  properties: PropTypes.object,
  // True if the JSON panel is open
  isJsonDetailOpen: PropTypes.bool.isRequired,
  // Callback to set the JSON panel open state
  setJsonDetailOpen: PropTypes.func.isRequired,
};

/**
 * Display all the properties of a schema.
 */
function SchemaProperties({ properties }) {
  // Holds names of all properties with their JSON panels open
  const [openPropertyIds, setOpenPropertyIds] = useState([]);
  // True if only submittable properties get displayed
  const [isNotSubmittableVisible, setIsNotSubmittableVisible] = useState(false);

  // Callback to set the JSON panel open state for a property.
  function handleJsonPanelOpen(propertyId, isOptionKey) {
    if (openPropertyIds.includes(propertyId)) {
      if (isOptionKey) {
        setOpenPropertyIds([]);
      } else {
        setOpenPropertyIds(openPropertyIds.filter((id) => id !== propertyId));
      }
    } else {
      if (isOptionKey) {
        setOpenPropertyIds(Object.keys(properties));
      } else {
        setOpenPropertyIds([...openPropertyIds, propertyId]);
      }
    }
  }

  // Filter out any properties that are not submittable if the user has chosen to hide them.
  const allPropertyIds = Object.keys(properties);
  const visiblePropertyIds = isNotSubmittableVisible
    ? allPropertyIds
    : allPropertyIds.filter(
        (propertyId) =>
          !properties[propertyId].notSubmittable &&
          !properties[propertyId].readonly
      );

  return (
    <div className="p-4">
      <Checkbox
        id="only-submittable"
        checked={isNotSubmittableVisible}
        name="not-submittable-visible"
        onClick={() => setIsNotSubmittableVisible(!isNotSubmittableVisible)}
        className="items-center text-sm"
      >
        Include non-submittable properties
        <Icon.PencilSlash className="ml-1 h-4 w-4" />
      </Checkbox>
      {visiblePropertyIds.sort().map((propertyId) => (
        <SchemaProperty
          key={propertyId}
          propertyId={propertyId}
          properties={properties}
          isJsonDetailOpen={openPropertyIds.includes(propertyId)}
          setJsonDetailOpen={handleJsonPanelOpen}
        />
      ))}
    </div>
  );
}

SchemaProperties.propTypes = {
  // Schema properties to display
  properties: PropTypes.object.isRequired,
};

/**
 * Display the schema in a formatted, easily readable way with expandable properties.
 */
function FormattedSchema({ schema }) {
  return (
    <>
      <div className="p-4">
        <DataArea>
          <DataItemLabel>Title</DataItemLabel>
          <DataItemValue>{schema.title}</DataItemValue>
          <DataItemLabel>Description</DataItemLabel>
          <DataItemValue>{schema.description}</DataItemValue>
          {schema.required?.length > 0 && (
            <>
              <DataItemLabel>Required</DataItemLabel>
              <DataItemValue>{schema.required.sort().join(", ")}</DataItemValue>
            </>
          )}
          {schema.identifyingProperties?.length > 0 && (
            <>
              <DataItemLabel>Identifying Properties</DataItemLabel>
              <DataItemValue>
                {schema.identifyingProperties.sort().join(", ")}
              </DataItemValue>
            </>
          )}
        </DataArea>
      </div>
      <TabGroup>
        <TabList>
          <TabTitle>Properties</TabTitle>
          <TabTitle>Dependencies</TabTitle>
        </TabList>
        <TabPanes>
          <TabPane>
            <SchemaProperties properties={schema.properties} />
          </TabPane>
          <TabPane>
            <Dependencies dependencies={schema.dependentSchemas} />
          </TabPane>
        </TabPanes>
      </TabGroup>
    </>
  );
}

FormattedSchema.propTypes = {
  // Schema to display formatted
  schema: PropTypes.object.isRequired,
};

/**
 * Display the formatted changelog for a schema.
 */
function Changelog({ changelog }) {
  const html = marked(changelog);

  return (
    <div
      className="prose px-4 py-2 dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

Changelog.propTypes = {
  // Changelog markdown to display
  changelog: PropTypes.string.isRequired,
};

export default function Schema({ schema, changelog, schemaPath }) {
  const { collectionTitles } = useContext(SessionContext);
  const pageTitle = collectionTitles?.[schemaPath] || schema.title;

  return (
    <>
      <Breadcrumbs />
      <PagePreamble pageTitle={pageTitle} />
      <div className="mb-2 flex justify-end">
        <AddLink schema={schema} label="Add" />
      </div>
      <DataPanel className="p-0 @container">
        <TabGroup>
          <TabList>
            <TabTitle>Schema</TabTitle>
            <TabTitle>JSON</TabTitle>
            <TabTitle>Changelog</TabTitle>
          </TabList>
          <TabPanes>
            <TabPane>
              <FormattedSchema schema={schema} />
            </TabPane>
            <TabPane>
              <JsonPanel>{JSON.stringify(schema, null, 4)}</JsonPanel>
            </TabPane>
            <TabPane>
              <Changelog changelog={changelog} />
            </TabPane>
          </TabPanes>
        </TabGroup>
      </DataPanel>
    </>
  );
}

Schema.propTypes = {
  // Schema object for the path
  schema: PropTypes.object.isRequired,
  // Changelog markdown for the schema
  changelog: PropTypes.string.isRequired,
  // Last part of the schema profile path
  schemaPath: PropTypes.string.isRequired,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const schema = (
    await request.getObject(`/profiles/${params.profile}`)
  ).union();
  if (FetchRequest.isResponseSuccess(schema)) {
    const changelog = await request.getText(schema.changelog, "");
    const breadcrumbs = await buildBreadcrumbs(
      schema,
      params.profile,
      req.headers.cookie
    );
    return {
      props: {
        schema,
        changelog,
        pageContext: { title: schema.title },
        schemaPath: params.profile,
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(schema);
}

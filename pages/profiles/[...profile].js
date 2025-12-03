// node_modules
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircleIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  LinkIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
// components
import { AddLink } from "../../components/add";
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "../../components/animation";
import Breadcrumbs from "../../components/breadcrumbs";
import Checkbox from "../../components/checkbox";
import { CopyButton, useCopyAction } from "../../components/copy-button";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { ButtonLink, FormLabel } from "../../components/form-elements";
import HelpTip from "../../components/help-tip";
import Icon from "../../components/icon";
import JsonPanel, { JsonPanelTool } from "../../components/json-panel";
import MarkdownSection from "../../components/markdown-section";
import PagePreamble from "../../components/page-preamble";
import {
  SchemaRequired,
  SchemaSearchField,
  SchemaVersion,
  SearchAndReportType,
} from "../../components/profiles";
import SessionContext from "../../components/session-context";
import {
  TabGroup,
  TabList,
  TabPane,
  TabPanes,
  TabTitle,
} from "../../components/tabs";
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// lib
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { toShishkebabCase } from "../../lib/general";
import {
  checkSearchTermSchema,
  notSubmittableProperty,
  schemaPageTabUrl,
  schemaToType,
} from "../../lib/profiles";
import { decodeUriElement, encodeUriElement } from "../../lib/query-encoding";

/**
 * Use as IDs for each of the tabs on the schema page.
 */
const TAB_ID_SCHEMA = "schema";
const TAB_ID_JSON = "json";
const TAB_ID_CHANGELOG = "changelog";
const TAB_ID_PROPERTIES = "properties";
const TAB_ID_DEPENDENCIES = "dependencies";

/**
 * Display a button that copies the given URL of the Properties or Dependencies tab to the
 * clipboard.
 */
function AttributePanelUrlCopyButton({ attributeId, url }) {
  const tooltipAttr = useTooltip("copy-attribute-url");

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <div>
          <CopyButton.Icon
            target={url}
            label="Copy URL to open this property by default to clipboard"
            size="sm"
          >
            {(isCopied) => (isCopied ? <CheckIcon /> : <LinkIcon />)}
          </CopyButton.Icon>
        </div>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>
        Copy the URL for <code>{attributeId}</code> to your clipboard. When you
        open this URL in your browser, the JSON panel for{" "}
        <code>{attributeId}</code> opens by default.
      </Tooltip>
    </>
  );
}

AttributePanelUrlCopyButton.propTypes = {
  // ID of the property or dependency to copy to the clipboard
  attributeId: PropTypes.string.isRequired,
  // URL to copy to the clipboard
  url: PropTypes.string.isRequired,
};

/**
 * Display an expandable/collapsable JSON panel for the given schema property or dependency.
 */
function SchemaJsonPanel({
  attribute,
  attributeId,
  schemaAttributeUrl,
  isJsonDetailOpen,
}) {
  const attributeUrl = `${schemaAttributeUrl}?property=${attributeId}`;

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
            id={`schema-json-property-${attributeId}`}
            className="border-panel ml-5 border text-xs"
            isLowContrast
          >
            {JSON.stringify(attribute, null, 2)}
            <JsonPanelTool>
              <AttributePanelUrlCopyButton
                attributeId={attributeId}
                url={attributeUrl}
              />
            </JsonPanelTool>
          </JsonPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

SchemaJsonPanel.propTypes = {
  // Schema property or dependency to display
  attribute: PropTypes.object.isRequired,
  // HTML id of the property or dependency name for this JSON panel
  attributeId: PropTypes.string.isRequired,
  // Whole URL of a single schema page plus the Properties or Dependencies tab path
  schemaAttributeUrl: PropTypes.string.isRequired,
  // True if the JSON panel is open
  isJsonDetailOpen: PropTypes.bool.isRequired,
};

/**
 * Display a button that copies the given attribute name to the clipboard. The button includes a
 * helpful tooltip.
 */
function CopyAttributeNameControl({ attributeName }) {
  const tooltipAttr = useTooltip(`property-name-${attributeName}`);
  const { isCopied, initiateCopy } = useCopyAction(attributeName);

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <button onClick={initiateCopy} className="cursor-pointer">
          {isCopied ? (
            <CheckCircleIcon className="h-3 w-3" />
          ) : (
            <ClipboardDocumentCheckIcon className="h-3 w-3" />
          )}
        </button>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>
        Copy <code>{attributeName}</code> to your clipboard.
      </Tooltip>
    </>
  );
}

CopyAttributeNameControl.propTypes = {
  // Name of the property to copy to the clipboard
  attributeName: PropTypes.string.isRequired,
};

/**
 * Display a single property dependency with a toggle to show the JSON detail.
 */
function Dependency({
  dependencyId,
  dependencies,
  schemaDependenciesUrl = "",
  isJsonDetailOpen,
  setJsonDetailOpen,
}) {
  const dependency = dependencies[dependencyId];
  const dependencyControlId = `dependency-${dependencyId}-control`;
  const dependencyPanelId = `dependency-${dependencyId}`;

  return (
    <div className="my-6 first:mt-0 last:mb-0">
      <div className="flex gap-1">
        <button
          id={dependencyControlId}
          onClick={(e) => setJsonDetailOpen(dependencyId, e.altKey)}
          className="text-schema-prop flex items-center text-sm font-bold"
          aria-label={`${dependencyId} dependency`}
          aria-expanded={isJsonDetailOpen}
          aria-controls={dependencyPanelId}
        >
          {isJsonDetailOpen ? (
            <MinusIcon className="mr-1 h-4 w-4" />
          ) : (
            <PlusIcon className="mr-1 h-4 w-4" />
          )}
          <div className="text-left break-all">{dependencyId}</div>
        </button>
        <CopyAttributeNameControl attributeName={dependencyId} />
      </div>
      <div className="text-schema-prop-description ml-5 text-sm">
        {dependency.comment}
      </div>
      <SchemaJsonPanel
        attribute={dependency}
        attributeId={dependencyId}
        schemaAttributeUrl={schemaDependenciesUrl}
        isJsonDetailOpen={isJsonDetailOpen}
      />
    </div>
  );
}

Dependency.propTypes = {
  // Property that has dependencies
  dependencyId: PropTypes.string.isRequired,
  // Single property dependency to display
  dependencies: PropTypes.object.isRequired,
  // Whole URL including the protocol and host for the base schema page
  schemaDependenciesUrl: PropTypes.string,
  // True if the JSON panel is open
  isJsonDetailOpen: PropTypes.bool.isRequired,
  // Callback to set the JSON panel open state
  setJsonDetailOpen: PropTypes.func.isRequired,
};

/**
 * Section of the display that shows the property dependencies of a schema.
 */
function Dependencies({
  dependencies = null,
  schemaDependenciesUrl,
  openedProperties,
}) {
  // Contains the names of all properties with their JSON panels open
  const [openJsonIds, setOpenJsonIds] = useState(openedProperties);

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

  if (dependencies && Object.keys(dependencies).length > 0) {
    const properties = Object.keys(dependencies).sort();
    return (
      <div className="p-4">
        {properties.map((property) => (
          <Dependency
            key={property}
            dependencyId={property}
            dependencies={dependencies}
            schemaDependenciesUrl={schemaDependenciesUrl}
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
  // Whole URL of a single schema page plus the Schema Dependencies tab path
  schemaDependenciesUrl: PropTypes.string,
  // Open these properties' JSON panels on tab load
  openedProperties: PropTypes.array.isRequired,
};

/**
 * If a property is not user submittable, display this status. Otherwise, display nothing.
 */
function NotSubmittableStatus({ property }) {
  return notSubmittableProperty(property) ? (
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
  linkto:
    "text-schema-prop-type-link bg-schema-prop-type-link border-schema-prop-type-link",
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
      return type === "string" && property.linkTo ? "linkto" : type;
    });

    // For single-type properties that are arrays, determine the type of the array elements and add
    // that to the "array" badge.
    if (typesWithLinks.length === 1 && typesWithLinks[0] === "array") {
      if (property.items) {
        let arrayElementType = "";
        if (property.items.type === "string") {
          if (property.items.linkTo) {
            arrayElementType = "linkto";
          } else {
            arrayElementType = "string";
          }
        } else if (property.items.type === "number") {
          arrayElementType = "number";
        } else if (property.items.type === "object") {
          arrayElementType = "object";
        }
        if (arrayElementType) {
          typesWithLinks[0] = `${typesWithLinks[0]}[${arrayElementType}]`;
        }
      }
    }

    return (
      <div className="flex gap-1">
        {typesWithLinks.map((type) => {
          // If the type starts with "array" use the "array" color. Otherwise, use the type itself
          // to determine the color.
          const typeColor = type.startsWith("array")
            ? TYPE_COLORS.array
            : TYPE_COLORS[type] || TYPE_COLORS.default;

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
  schemaPropertiesUrl = "",
  isJsonDetailOpen,
  setJsonDetailOpen,
  isHighlighted,
}) {
  const property = properties[propertyId];
  const propertyControlId = `property-${propertyId}-control`;
  const propertyPanelId = `property-${propertyId}`;

  return (
    <div
      className="my-6 first:mt-0 last:mb-0"
      data-testid={`schema-property-${propertyId}`}
    >
      <div className="mb-0.5 gap-1 @sm:flex">
        <button
          id={propertyControlId}
          onClick={(e) => setJsonDetailOpen(propertyId, e.altKey)}
          className="text-schema-prop flex cursor-pointer items-center text-sm font-bold"
          aria-label={`${propertyId} property${
            isHighlighted ? " (highlighted)" : ""
          }`}
          aria-expanded={isJsonDetailOpen}
          aria-controls={propertyPanelId}
        >
          {isJsonDetailOpen ? (
            <MinusIcon className="mr-1 h-4 w-4" />
          ) : (
            <PlusIcon className="mr-1 h-4 w-4" />
          )}
          <div
            className={`scroll-mt-46 text-left break-all @2xl:scroll-mt-32 ${
              isHighlighted ? "bg-schema-name-highlight" : ""
            }`}
          >
            {propertyId}
          </div>
        </button>
        <CopyAttributeNameControl attributeName={propertyId} />
        <div className="ml-5 flex gap-1 @sm:ml-0">
          <SchemaTypes property={property} />
          <NotSubmittableStatus property={property} />
        </div>
      </div>
      {property.description && (
        <div className="text-schema-prop-description ml-5 text-sm">
          {property.description}
        </div>
      )}
      <SchemaJsonPanel
        attribute={property}
        attributeId={propertyId}
        schemaAttributeUrl={schemaPropertiesUrl}
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
  // Whole URL of a single schema page plus the Schema Properties tab path
  schemaPropertiesUrl: PropTypes.string,
  // True if the JSON panel is open
  isJsonDetailOpen: PropTypes.bool.isRequired,
  // Callback to set the JSON panel open state
  setJsonDetailOpen: PropTypes.func.isRequired,
  // True to highlight the property name
  isHighlighted: PropTypes.bool.isRequired,
};

/**
 * Display all the properties of a schema.
 */
function SchemaProperties({
  properties,
  openedProperties,
  searchTerm,
  setSearchTerm,
  schemaPropertiesUrl = "",
}) {
  // Holds names of all properties with their JSON panels open
  const [openPropertyIds, setOpenPropertyIds] = useState(openedProperties);
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

  // If any openedProperties are non-submittable, automatically show non-submittable properties on
  // page load.
  useEffect(() => {
    const isAtLeastOneOpenPropertyNotSubmittable = openedProperties.some(
      (property) => notSubmittableProperty(properties[property])
    );
    if (isAtLeastOneOpenPropertyNotSubmittable && !isNotSubmittableVisible) {
      setIsNotSubmittableVisible(true);
    }
  }, []);

  // Filter out any properties that are not submittable if the user has chosen to hide them.
  const allPropertyIds = Object.keys(properties);
  const visiblePropertyIds = isNotSubmittableVisible
    ? allPropertyIds
    : allPropertyIds.filter(
        (propertyId) => !notSubmittableProperty(properties[propertyId])
      );

  useEffect(() => {
    if (searchTerm) {
      // Scroll the first highlighted name into view.
      const highlightedNames = document.getElementsByClassName(
        "bg-schema-name-highlight"
      );
      if (highlightedNames.length > 0) {
        highlightedNames[0].scrollIntoView();
      }
    }
  }, [searchTerm]);

  return (
    <>
      <section className="border-panel bg-schema-search sticky top-[37px] z-10 border-b px-4 py-2">
        <FormLabel>Search Schema Properties</FormLabel>
        <div className="mb-4">
          <SchemaSearchField
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchMode={"SEARCH_MODE_PROPERTIES"}
          />
          <HelpTip>
            Highlight properties with matching names, &ldquo;title&rdquo;
            attributes, or an enum of those properties. Matching properties
            might be non-submittable.
          </HelpTip>
        </div>
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
      </section>
      <div className="p-4">
        {visiblePropertyIds.sort().map((propertyId) => {
          const isHighlighted = checkSearchTermSchema(
            searchTerm,
            properties,
            propertyId
          );
          return (
            <SchemaProperty
              key={propertyId}
              propertyId={propertyId}
              properties={properties}
              schemaPropertiesUrl={schemaPropertiesUrl}
              isJsonDetailOpen={openPropertyIds.includes(propertyId)}
              setJsonDetailOpen={handleJsonPanelOpen}
              isHighlighted={isHighlighted}
            />
          );
        })}
      </div>
    </>
  );
}

SchemaProperties.propTypes = {
  // Schema properties to display
  properties: PropTypes.object.isRequired,
  // Open these properties' JSON panels on tab load
  openedProperties: PropTypes.array.isRequired,
  // Search term to highlight matching properties
  searchTerm: PropTypes.string.isRequired,
  // Callback to set the search term
  setSearchTerm: PropTypes.func.isRequired,
  // Whole URL including the protocol and host for the base schema page
  schemaPropertiesUrl: PropTypes.string,
};

/**
 * Display the schema in a formatted, easily readable way with expandable properties.
 */
function FormattedSchema({
  schema,
  openedProperties,
  searchTerm,
  setSearchTerm,
  defaultTabId,
  schemaTabUrl = "",
}) {
  // Filter openedProperties to only include properties that exist as keys in the schema's properties.
  const existingopenedProperties = schema.properties
    ? openedProperties.filter((property) =>
        Object.keys(schema.properties).includes(property)
      )
    : [];

  // Generate URLs for each of the Schema tab sub-tabs; used to open those tabs on page load.
  const tabUrls = {
    [TAB_ID_PROPERTIES]: schemaPageTabUrl(schemaTabUrl, TAB_ID_PROPERTIES),
    [TAB_ID_DEPENDENCIES]: schemaPageTabUrl(schemaTabUrl, TAB_ID_DEPENDENCIES),
  };

  return (
    <>
      <div className="p-4">
        <DataArea>
          <DataItemLabel>Title</DataItemLabel>
          <DataItemValue>{schema.title}</DataItemValue>
          <DataItemLabel>Description</DataItemLabel>
          <DataItemValue>{schema.description}</DataItemValue>
          <DataItemLabel>Version</DataItemLabel>
          <DataItemValue>
            <SchemaVersion schema={schema} />
          </DataItemValue>
          <SchemaRequired schema={schema} />
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
      <TabGroup defaultId={defaultTabId}>
        <TabList>
          <SchemaTab
            id={TAB_ID_PROPERTIES}
            tabTitle="Properties"
            tabUrl={tabUrls[TAB_ID_PROPERTIES]}
          >
            Properties
          </SchemaTab>
          <SchemaTab
            id={TAB_ID_DEPENDENCIES}
            tabTitle="Dependencies"
            tabUrl={tabUrls[TAB_ID_DEPENDENCIES]}
          >
            Dependencies
          </SchemaTab>
        </TabList>
        <TabPanes>
          <TabPane className="relative">
            <SchemaProperties
              properties={schema.properties}
              openedProperties={existingopenedProperties}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              schemaPropertiesUrl={tabUrls[TAB_ID_PROPERTIES]}
            />
          </TabPane>
          <TabPane>
            <Dependencies
              dependencies={schema.dependentSchemas}
              openedProperties={existingopenedProperties}
              schemaDependenciesUrl={tabUrls[TAB_ID_DEPENDENCIES]}
            />
          </TabPane>
        </TabPanes>
      </TabGroup>
    </>
  );
}

FormattedSchema.propTypes = {
  // Schema to display formatted
  schema: PropTypes.object.isRequired,
  // Open these properties' JSON panels on page load
  openedProperties: PropTypes.array.isRequired,
  // Search term to highlight matching properties
  searchTerm: PropTypes.string.isRequired,
  // Callback to set the search term
  setSearchTerm: PropTypes.func.isRequired,
  // ID of the default tab
  defaultTabId: PropTypes.string.isRequired,
  // Whole URL including the protocol and host for the base schema page and Schema tab
  schemaTabUrl: PropTypes.string,
};

/**
 * Display the formatted changelog for a schema.
 */
function Changelog({ changelog }) {
  return <MarkdownSection className="px-4 py-2">{changelog}</MarkdownSection>;
}

Changelog.propTypes = {
  // Changelog markdown to display
  changelog: PropTypes.string.isRequired,
};

/**
 * Displays a tab title with a copy button to copy the URL that opens this tab on page load.
 */
function SchemaTab({ id, tabTitle, tabUrl = "", children }) {
  const { isCopied, initiateCopy } = useCopyAction(tabUrl);
  const tooltipAttr = useTooltip(`copy-tab-url-${id}`);

  return (
    <div className="relative">
      <TabTitle id={id}>{children}</TabTitle>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <button
          onClick={initiateCopy}
          className="absolute top-0 right-1 bottom-0 my-auto"
        >
          {isCopied ? (
            <CheckCircleIcon className="h-3 w-3" />
          ) : (
            <LinkIcon className="h-3 w-3 opacity-0 hover:opacity-100" />
          )}
        </button>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>
        Copy the URL for the {tabTitle} tab to your clipboard. When you open
        this URL in your browser, this tab opens by default.
      </Tooltip>
    </div>
  );
}

SchemaTab.propTypes = {
  // ID of the tab whose path we copy
  id: PropTypes.string.isRequired,
  // Displayed title of the tab
  tabTitle: PropTypes.string,
  // Whole URL including the protocol and host for the tab being rendered
  tabUrl: PropTypes.string,
};

export default function Schema({
  schema,
  changelog,
  collection,
  tab,
  subTab,
  openedProperties,
}) {
  // Search term the user has entered or that we've detected in the URL hash
  const [searchTerm, setSearchTerm] = useState("");
  // Full URL of the page so we can link to tabs and properties within tabs
  const [schemaPageUrl, setSchemaPageUrl] = useState("");

  const { collectionTitles, profiles } = useContext(SessionContext);
  const pageTitle = collectionTitles?.[collection] || schema.title;
  const schemaType = schemaToType(schema, profiles);

  // Generate URLs for each of the top-level tabs; used to open those tabs on page load.
  const tabUrls = {
    [TAB_ID_SCHEMA]: schemaPageTabUrl(schemaPageUrl, TAB_ID_SCHEMA),
    [TAB_ID_JSON]: schemaPageTabUrl(schemaPageUrl, TAB_ID_JSON),
    [TAB_ID_CHANGELOG]: schemaPageTabUrl(schemaPageUrl, TAB_ID_CHANGELOG),
  };

  useEffect(() => {
    if (window.location) {
      // Rerender the page with relevant properties highlighted if we detect a search term in the
      // URL hash.
      setSearchTerm(decodeUriElement(window.location.hash.slice(1)));

      // Generate the full base page URL to select tabs and open property JSON panels on page load.
      const origin = window.location.origin;
      setSchemaPageUrl(`${origin}/profiles/${collection}/`);
    }
  }, []);

  return (
    <>
      <Breadcrumbs item={schema} />
      <PagePreamble pageTitle={pageTitle} />
      <div className="mb-1 flex justify-between">
        <div className="flex gap-1">
          <ButtonLink
            href={`/profiles${
              searchTerm ? `#${encodeUriElement(searchTerm)}` : ""
            }`}
            size="sm"
            label="Back to schema directory"
          >
            Schema Directory
          </ButtonLink>
          <SearchAndReportType type={schemaType} title={schema.title} />
        </div>
        <AddLink schema={schema} label="Add" />
      </div>
      <DataPanel className="@container" isPaddingSuppressed>
        <TabGroup defaultId={tab}>
          <TabList>
            <SchemaTab
              id={TAB_ID_SCHEMA}
              tabTitle="Schema"
              tabUrl={tabUrls[TAB_ID_SCHEMA]}
            >
              Schema
            </SchemaTab>
            <SchemaTab
              id={TAB_ID_JSON}
              tabTitle="JSON"
              tabUrl={tabUrls[TAB_ID_JSON]}
            >
              JSON
            </SchemaTab>
            <SchemaTab
              id={TAB_ID_CHANGELOG}
              tabTitle="Changelog"
              tabUrl={tabUrls[TAB_ID_CHANGELOG]}
            >
              Changelog
            </SchemaTab>
          </TabList>
          <TabPanes>
            <TabPane>
              <FormattedSchema
                schema={schema}
                openedProperties={openedProperties}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                defaultTabId={subTab}
                schemaTabUrl={tabUrls[TAB_ID_SCHEMA]}
              />
            </TabPane>
            <TabPane>
              <JsonPanel isBorderHidden>
                {JSON.stringify(schema, null, 2)}
              </JsonPanel>
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
  // Collection name from the schema path
  collection: PropTypes.string.isRequired,
  // ID of the tab to select without user interaction
  tab: PropTypes.string.isRequired,
  // ID of the sub-tab to select without user interaction
  subTab: PropTypes.string.isRequired,
  // Properties to open on page load
  openedProperties: PropTypes.array.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const [profile, tab, subTab] = params.profile;
  const schema = (await request.getObject(`/profiles/${profile}`)).union();
  if (FetchRequest.isResponseSuccess(schema)) {
    const changelog = await request.getText(schema.changelog, "");

    // Get any `property=` query parameters to open specific properties' JSON panels on page load.
    // Annoyingly, the query property is a string for a single property and an array for multiple
    // properties, so we have to normalize `property` to an array even for singles.
    let openedProperties = [];
    if (query.property) {
      openedProperties = Array.isArray(query.property)
        ? query.property
        : [query.property];
    }

    return {
      props: {
        schema,
        changelog,
        collection: profile,
        tab: tab || "",
        subTab: subTab || "",
        openedProperties,
        pageContext: { title: schema.title },
      },
    };
  }
  return errorObjectToProps(schema);
}

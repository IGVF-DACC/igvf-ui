// node_modules
import {
  Bars4Icon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  TableCellsIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components
import { AddLink } from "../../components/add";
import Breadcrumbs from "../../components/breadcrumbs";
import { AttachedButtons, ButtonLink } from "../../components/form-elements";
import { TextField } from "../../components/form-elements";
import PagePreamble from "../../components/page-preamble";
import SchemaIcon from "../../components/schema-icon";
import { Tooltip, TooltipRef, useTooltip } from "../../components/tooltip";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { deprecatedSchemas } from "../../lib/constants";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { toShishkebabCase } from "../../lib/general";

/**
 * Copy the given schema object and delete deprecated schemas from it.
 * @param {object} profiles Schema object to copy and delete deprecated schemas from
 * @returns {object} New schema object with deprecated schemas deleted
 */
function deleteDeprecatedSchemas(profiles) {
  // Copy profiles properties except for those in `deprecatedSchemas`.
  const newProfiles = { ...profiles };
  for (const schema of deprecatedSchemas) {
    if (newProfiles[schema]) {
      delete newProfiles[schema];
    }
  }
  return newProfiles;
}

/**
 * Returns true if the given object type is displayable in the UI. This also indicates that you
 * can add and edit objects of this type.
 * @param {string} objectType Object @type to check
 * @param {object} schemas List of schemas to display in the list; directly from /profiles endpoint
 * @param {object} tree Top of the _hierarchy tree at this level
 * @returns {boolean} True if the object type is displayable/addable/editable
 */
function isDisplayableType(objectType, schemas, tree) {
  return (
    schemas[objectType]?.identifyingProperties?.length > 0 ||
    Object.keys(tree).length > 0
  );
}

/**
 * Show a text field that lets the user type in a search term to filter the list of schemas.
 */
function SearchSection({ searchTerm, setSearchTerm }) {
  return (
    <section className="sticky top-0 flex items-center gap-2 border-b border-panel bg-background py-4">
      <label htmlFor="search-schema-name" className="flex items-center gap-1">
        <MagnifyingGlassIcon className="h-4 w-4" />
        Name
      </label>
      <div className="relative grow">
        <TextField
          name="search-schema-name"
          value={searchTerm}
          fieldLabel="Schema name search"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="[&>input]:pr-7"
          isSpellCheckDisabled
          isMessageAllowed={false}
          placeholder="Search schema name"
        />
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-0 top-0 flex h-full w-8 cursor-pointer items-center justify-center"
          aria-label="Clear schema name search"
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

SearchSection.propTypes = {
  // Current search term
  searchTerm: PropTypes.string.isRequired,
  // Function to set the search term
  setSearchTerm: PropTypes.func.isRequired,
};

/**
 * Displays links to the search-list and report pages for the given schema object type.
 */
function SearchAndReportType({ type, title }) {
  return (
    <AttachedButtons>
      <ButtonLink
        href={`/search?type=${type}`}
        label={`List view of all ${title} objects`}
        type="secondary"
        size="sm"
        hasIconOnly
      >
        <Bars4Icon />
      </ButtonLink>
      <ButtonLink
        href={`/multireport?type=${type}`}
        label={`Report view of all ${title} objects`}
        type="secondary"
        size="sm"
        hasIconOnly
      >
        <TableCellsIcon />
      </ButtonLink>
    </AttachedButtons>
  );
}

SearchAndReportType.propTypes = {
  // @type to search for
  type: PropTypes.string.isRequired,
  // Human-readable title for the schema
  title: PropTypes.string.isRequired,
};

/**
 * Displays a schema element and its children. This component uses recursion, so every element at
 * different times exists as a child and a parent -- possibly a parent with no children.
 */
function SubTree({
  tree,
  objectType,
  schemas,
  searchTerm,
  collectionTitles = null,
}) {
  const tooltipAttr = useTooltip(objectType);

  const title = collectionTitles?.[objectType] || objectType;
  const schema = schemas[objectType];
  const childObjectTypes = Object.keys(tree).filter((childObjectType) =>
    isDisplayableType(childObjectType, schemas, tree[childObjectType])
  );

  const isTitleHighlighted =
    searchTerm && title.toLowerCase().includes(searchTerm.toLowerCase());

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
    <div className="my-1">
      <div
        className="flex items-center gap-1"
        data-testid={`schema-${toShishkebabCase(title)}`}
      >
        <SchemaIcon type={objectType} />
        {schema ? (
          <>
            <Link
              href={`${schema.$id.replace(".json", "")}`}
              aria-label={`View schema for ${title}`}
              className={`block scroll-mt-16${
                isTitleHighlighted ? " bg-schema-name-highlight" : ""
              }`}
            >
              {title}
            </Link>
            <TooltipRef tooltipAttr={tooltipAttr}>
              <button>
                <QuestionMarkCircleIcon className="h-4 w-4 cursor-pointer" />
              </button>
            </TooltipRef>
            <Tooltip tooltipAttr={tooltipAttr}>
              {schema.description || "No description available"}
            </Tooltip>
            <SearchAndReportType type={objectType} title={title} />
            <AddLink schema={schema} label={`Add ${schema.title}`} />
          </>
        ) : (
          <>
            {title}
            <SearchAndReportType type={objectType} title={title} />
          </>
        )}
      </div>
      {childObjectTypes.length > 0 && (
        <div className="ml-4">
          {childObjectTypes.map((childObjectType) => {
            const child = tree[childObjectType];
            return (
              <SubTree
                tree={child}
                objectType={childObjectType}
                schemas={schemas}
                searchTerm={searchTerm}
                collectionTitles={collectionTitles}
                key={childObjectType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

SubTree.propTypes = {
  // Top of the _hierarchy tree to render at this level
  tree: PropTypes.object.isRequired,
  // @type for `tree`
  objectType: PropTypes.string.isRequired,
  // List of schemas to display in the list; directly from /profiles endpoint
  schemas: PropTypes.object.isRequired,
  // Current search term
  searchTerm: PropTypes.string.isRequired,
  // Maps collection names to corresponding human-readable schema titles
  collectionTitles: PropTypes.object.isRequired,
};

export default function Profiles({ schemas, collectionTitles = null }) {
  // Search term for schema
  const [searchTerm, setSearchTerm] = useState("");

  const topLevelObjectTypes = Object.keys(schemas._hierarchy.Item).filter(
    (objectType) =>
      isDisplayableType(
        objectType,
        schemas,
        schemas._hierarchy.Item[objectType]
      )
  );
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <>
        <SearchSection searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {topLevelObjectTypes.map((objectType) => {
          const topOfTree = schemas._hierarchy.Item[objectType];
          return (
            <SubTree
              tree={topOfTree}
              objectType={objectType}
              schemas={schemas}
              searchTerm={searchTerm}
              collectionTitles={collectionTitles}
              key={objectType}
            />
          );
        })}
      </>
    </>
  );
}

Profiles.propTypes = {
  // List of schemas to display in the list; directly from /profiles endpoint
  schemas: PropTypes.shape({
    _hierarchy: PropTypes.shape({
      Item: PropTypes.object.isRequired,
    }).isRequired,
  }),
  // Map of collection names to corresponding schema titles
  collectionTitles: PropTypes.object,
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const schemas = (await request.getObject("/profiles")).union();
  if (FetchRequest.isResponseSuccess(schemas)) {
    const collectionTitles = (
      await request.getObject("/collection-titles/")
    ).optional();
    const schemasWithoutDeprecated = deleteDeprecatedSchemas(schemas);
    const breadcrumbs = await buildBreadcrumbs(schemas, "", req.headers.cookie);
    return {
      props: {
        schemas: schemasWithoutDeprecated,
        collectionTitles,
        pageContext: { title: "Schemas" },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(schemas);
}

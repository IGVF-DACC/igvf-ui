// node_modules
import { Bars4Icon, TableCellsIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { AddLink } from "../../components/add";
import Breadcrumbs from "../../components/breadcrumbs";
import { AttachedButtons, ButtonLink } from "../../components/form-elements";
import PagePreamble from "../../components/page-preamble";
import SchemaIcon from "../../components/schema-icon";
import Tooltip from "../../components/tooltip";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { deprecatedSchemas } from "../../lib/constants";
import errorObjectToProps from "../../lib/errors";
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
function SubTree({ tree, objectType, schemas, collectionTitles = null }) {
  const title = collectionTitles?.[objectType] || objectType;
  const schema = schemas[objectType];
  const childObjectTypes = Object.keys(tree).filter((childObjectType) =>
    isDisplayableType(childObjectType, schemas, tree[childObjectType])
  );

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
              className="block"
            >
              {title}
            </Link>
            <Tooltip content={schema.description} />
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
  // Maps collection names to corresponding human-readable schema titles
  collectionTitles: PropTypes.object.isRequired,
};

export default function Profiles({ schemas, collectionTitles = null }) {
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
        {topLevelObjectTypes.map((objectType) => {
          const topOfTree = schemas._hierarchy.Item[objectType];
          return (
            <SubTree
              tree={topOfTree}
              objectType={objectType}
              schemas={schemas}
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
  const schemas = await request.getObject("/profiles");
  if (FetchRequest.isResponseSuccess(schemas)) {
    const collectionTitles = await request.getObject(
      "/collection-titles/",
      null
    );
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

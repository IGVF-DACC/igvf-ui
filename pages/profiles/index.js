// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { AddLink } from "../../components/add";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { toShishkebabCase } from "../../lib/general";

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
 * Displays a schema element and its children. This component uses recursion, so every element at
 * different times exists as a child and a parent -- possibly a parent with no children.
 */
function SubTree({ tree, objectType, schemas, collectionTitles }) {
  const title = collectionTitles[objectType];
  const schema = schemas[objectType];
  const childObjectTypes = Object.keys(tree).filter((childObjectType) =>
    isDisplayableType(childObjectType, schemas, tree[childObjectType])
  );

  return (
    <div className="my-1">
      {schema ? (
        <div
          className="flex gap-1"
          data-testid={`schema-${toShishkebabCase(title)}`}
        >
          <Link href={`${schema.$id.replace(".json", "")}`} className="block">
            {title}
          </Link>
          <AddLink schema={schema} label={`Add ${schema.title}`} />
        </div>
      ) : (
        <div className="font-bold">{title}</div>
      )}
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
  schemas: PropTypes.object.isRequired,
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
    const breadcrumbs = await buildBreadcrumbs(schemas, "", req.headers.cookie);
    return {
      props: {
        schemas,
        collectionTitles,
        pageContext: { title: "Schemas" },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(schemas);
}

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { AddItemFromSchema } from "../../components/add";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

function ChildElement({ title, schemaKey, schemas, child, indentation }) {
  const schema = schemas[schemaKey];
  if (schema && schema.title) {
    return (
      <div className={`px-${indentation} my-1 flex items-center space-x-1`}>
        <Link href={`${schema.$id.replace(".json", "")}`} className="block">
          {title}
        </Link>
        <AddItemFromSchema schema={schema} label={`Add ${schema.title}`} />
      </div>
    );
  }
  if (Object.keys(child).length > 0) {
    return (
      <div className={`px-${indentation}`}>
        <div className="font-semibold">{title}</div>
        {Object.keys(child).map((childKey) => {
          return (
            <ChildElement
              title={schemas[childKey] ? schemas[childKey].title : childKey}
              schemaKey={childKey}
              schemas={schemas}
              child={child[childKey]}
              indentation={indentation + 4}
              key={childKey}
            />
          );
        })}
      </div>
    );
  }
  return null;
}

ChildElement.propTypes = {
  title: PropTypes.string.isRequired,
  schemaKey: PropTypes.string.isRequired,
  schemas: PropTypes.object.isRequired,
  child: PropTypes.object.isRequired,
  indentation: PropTypes.number.isRequired,
};

export default function SchemaList({ schemas, collectionTitles = null }) {
  const schemaHierarchy = schemas._hierarchy;

  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <>
        {Object.keys(schemaHierarchy.Item).map((hierarchyKey) => {
          if (hierarchyKey !== "AccessKey") {
            const title = collectionTitles?.[hierarchyKey];
            return (
              <ChildElement
                title={title || hierarchyKey}
                schemaKey={hierarchyKey}
                schemas={schemas}
                child={schemaHierarchy.Item[hierarchyKey]}
                indentation={0}
                key={hierarchyKey}
              />
            );
          }
          return null;
        })}
      </>
    </>
  );
}

SchemaList.propTypes = {
  // schemas to display in the list
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

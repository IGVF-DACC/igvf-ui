// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const ChildElement = (props) => {
  const schema = props.schemas[props.schemaKey]
  if (schema && schema.title) {
    return (
      <div className={`px-${props.indentation}`}>
        <Link href={`${schema["$id"].replace(".json", "")}`} key={props.title}>
          <a className="block">{props.title}</a>
        </Link>
      </div>
    )
  } else if (Object.keys(props.child).length > 0) {
    return (
      <div className={`px-${props.indentation}`}>
        <div className="font-semibold">{props.title}</div>
        {Object.keys(props.child).map((child_key) => {
          return (
            <ChildElement
              title={
                props.schemas[child_key]
                  ? props.schemas[child_key].title
                  : child_key
              }
              schemaKey={child_key}
              schemas={props.schemas}
              child={props.child[child_key]}
              indentation={props.indentation + 4}
              key={child_key}
            />
          )
        })}
      </div>
    )
  }
  return null
}

ChildElement.propTypes = {
  title: PropTypes.string.isRequired,
  schemaKey: PropTypes.string.isRequired,
  schemas: PropTypes.object.isRequired,
  child: PropTypes.object.isRequired,
  indentation: PropTypes.number.isRequired,
}

const SchemaList = ({ schemas }) => {
  const schemaHierarchy = schemas["_hierarchy"]

  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <>
        {Object.keys(schemaHierarchy.Item).map((hierarchy_key) => {
          if (hierarchy_key === "AccessKey") {
            return null
          } else {
            return (
              <ChildElement
                title={hierarchy_key}
                schemaKey={hierarchy_key}
                schemas={schemas}
                child={schemaHierarchy.Item[hierarchy_key]}
                indentation={0}
                key={hierarchy_key}
              />
            )
          }
        })}
      </>
    </>
  )
}

SchemaList.propTypes = {
  // schemas to display in the list
  schemas: PropTypes.object.isRequired,
}

export default SchemaList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const schemas = await request.getCollection("profiles")
  const breadcrumbs = await buildBreadcrumbs(schemas)
  return {
    props: {
      schemas,
      pageContext: { title: "Schemas" },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}

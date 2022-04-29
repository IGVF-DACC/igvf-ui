// node_modules
import PropTypes from "prop-types"
// libs
import Request from "../libs/request"
// components
import { DataArea } from "../components/data-item"

/**
 * Displays the JSON of the specified object or collection for any object or collection that
 * doesn't have a page defined in the NextJS router.
 */
const FallbackObject = ({ generic = null }) => {
  return (
    <DataArea>
      <div className="overflow-x-auto border border-gray-300 bg-gray-100 text-xs dark:border-gray-800 dark:bg-gray-900">
        <pre className="p-1">{JSON.stringify(generic, null, 4)}</pre>
      </div>
    </DataArea>
  )
}

FallbackObject.propTypes = {
  // Any object which doesn't have a page defined.
  generic: PropTypes.object,
}

export default FallbackObject

export const getServerSideProps = async ({ req, resolvedUrl }) => {
  const request = new Request(req?.headers?.cookie)
  const generic = await request.getObject(resolvedUrl)
  console.log("GEN %o", generic)
  if (generic.status !== "error") {
    return {
      props: {
        generic,
      },
    }
  }
  return { notFound: true }
}

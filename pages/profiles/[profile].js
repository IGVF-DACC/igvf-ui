// node_modules
import PropTypes from "prop-types"
import { marked } from "marked"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import PagePreamble from "../../components/page-preamble"
import { DataPanel, DataAreaTitle } from "../../components/data-area"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const Schema = ({ schema, changelog }) => {
  const html = marked(changelog)
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataPanel>
        <div className="border border-gray-300 bg-gray-100 text-xs dark:border-gray-800 dark:bg-gray-900">
          <pre className="p-1 overflow-x-scroll">{JSON.stringify(schema, null, 4)}</pre>
        </div>
      </DataPanel>
      <DataAreaTitle>Changelog</DataAreaTitle>
      <DataPanel>
        <div className="border border-gray-300 bg-gray-100 text-xs dark:border-gray-800 dark:bg-gray-900">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </DataPanel>
    </>
  )
}

Schema.propTypes = {
  schema: PropTypes.object.isRequired,
  changelog: PropTypes.string.isRequired,
}

export default Schema

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const schema = await request.getObject(`/profiles/${params.profile}`)
  const changelog = await request.getMarkdown(schema.changelog)
  const breadcrumbs = await buildBreadcrumbs(schema, params.profile)

  return {
    props: {
      schema,
      changelog,
      pageContext: { title: schema.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}

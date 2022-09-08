// node_modules
import PropTypes from "prop-types";
import { marked } from "marked";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import PagePreamble from "../../components/page-preamble";
import { DataPanel, DataAreaTitle } from "../../components/data-area";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { AddLink } from "../../components/add";

const Schema = ({ schema, changelog }) => {
  console.log(schema);
  const html = marked(changelog);
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <AddLink schema={schema}/>
      <DataPanel>
        <div className="border border-gray-300 bg-gray-100 text-xs dark:border-gray-800 dark:bg-gray-900">
          <pre className="overflow-x-scroll p-1">
            {JSON.stringify(schema, null, 4)}
          </pre>
        </div>
      </DataPanel>
      <DataAreaTitle>Changelog</DataAreaTitle>
      <DataPanel>
        <div
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </DataPanel>
    </>
  );
};

Schema.propTypes = {
  schema: PropTypes.object.isRequired,
  changelog: PropTypes.string.isRequired,
};

export default Schema;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const schema = await request.getObject(`/profiles/${params.profile}`);
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
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(schema);
};

// node_modules
import FetchRequest from "../../lib/fetch-request";
import PropTypes from "prop-types";

// components
import Breadcrumbs from "../../components/breadcrumbs";
import { DataPanel, DataAreaTitle } from "../../components/data-area";
import PagePreamble from "../../components/page-preamble";

export default function GraphSvg({ graph }) {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataAreaTitle>Graph</DataAreaTitle>
      <DataPanel>
        <div
          id="graph"
          className="overflow-y-auto dark:[&>svg>g>polygon]:fill-transparent [&>svg]:h-full [&>svg]:w-auto"
          dangerouslySetInnerHTML={{ __html: graph }}
        />
      </DataPanel>
    </>
  );
}

GraphSvg.propTypes = {
  graph: PropTypes.string.isRequired,
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const graph = await request.getText("/profiles/graph.svg");
  return {
    props: {
      graph,
    },
  };
}

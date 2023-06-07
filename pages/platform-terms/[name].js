// node_modules
import { PropTypes } from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { DataArea, DataPanel } from "../../components/data-area";
import { OntologyTermDataItems } from "../../components/common-data-items";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function PlatformOntologyTerm({ platformOntologyTerm, isJson }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={platformOntologyTerm}>
        <PagePreamble />
        <JsonDisplay item={platformOntologyTerm} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <OntologyTermDataItems ontologyTerm={platformOntologyTerm} />
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

PlatformOntologyTerm.propTypes = {
  // Platform ontology term to display
  platformOntologyTerm: PropTypes.object.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const platformOntologyTerm = await request.getObject(
    `/platform-terms/${params.name}/`
  );
  if (FetchRequest.isResponseSuccess(platformOntologyTerm)) {
    const breadcrumbs = await buildBreadcrumbs(
      platformOntologyTerm,
      "term_id",
      req.headers.cookie
    );
    return {
      props: {
        platformOntologyTerm,
        pageContext: { title: platformOntologyTerm.term_id },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(platformOntologyTerm);
}

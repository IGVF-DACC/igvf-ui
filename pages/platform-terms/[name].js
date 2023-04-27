// node_modules
import { PropTypes } from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { DataArea, DataPanel } from "../../components/data-area";
import { OntologyTermDataItems } from "../../components/common-data-items";
import { EditableItem } from "../../components/edit";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function PlatformOntologyTerm({ platformOntologyTerm }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={platformOntologyTerm}>
        <PagePreamble />
        <ObjectPageHeader item={platformOntologyTerm} />
        <DataPanel>
          <DataArea>
            <OntologyTermDataItems ontologyTerm={platformOntologyTerm} />
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
}

PlatformOntologyTerm.propTypes = {
  // Platform ontology term to display
  platformOntologyTerm: PropTypes.object.isRequied,
};

export async function getServerSideProps({ params, req }) {
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
      },
    };
  }
  return errorObjectToProps(platformOntologyTerm);
}

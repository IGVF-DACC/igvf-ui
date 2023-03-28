// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { OntologyTermDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function AssayOntologyTerm({ assayOntologyTerm, isA }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={assayOntologyTerm}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={assayOntologyTerm.status} />
            </DataItemValue>
            <OntologyTermDataItems ontologyTerm={assayOntologyTerm} isA={isA}>
              {assayOntologyTerm.category_slims.length > 0 && (
                <>
                  <DataItemLabel>Assay Category</DataItemLabel>
                  <DataItemValue>
                    {assayOntologyTerm.category_slims.join(", ")}
                  </DataItemValue>
                </>
              )}
            </OntologyTermDataItems>
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
}

AssayOntologyTerm.propTypes = {
  // Assay ontology term object to display
  assayOntologyTerm: PropTypes.object.isRequired,
  // List of term names
  isA: PropTypes.arrayOf(PropTypes.object),
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const assayOntologyTerm = await request.getObject(
    `/assay-terms/${params.name}/`
  );
  if (FetchRequest.isResponseSuccess(assayOntologyTerm)) {
    const isA = assayOntologyTerm.is_a
      ? await request.getMultipleObjects(assayOntologyTerm.is_a, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      assayOntologyTerm,
      "term_id",
      req.headers.cookie
    );
    return {
      props: {
        assayOntologyTerm,
        isA,
        pageContext: { title: assayOntologyTerm.term_id },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(assayOntologyTerm);
}

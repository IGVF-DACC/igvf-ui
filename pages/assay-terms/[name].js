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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestOntologyTerms } from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function AssayOntologyTerm({ assayOntologyTerm, isA, isJson }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={assayOntologyTerm}>
        <PagePreamble />
        <ObjectPageHeader item={assayOntologyTerm} isJsonFormat={isJson} />
        <JsonDisplay item={assayOntologyTerm} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <OntologyTermDataItems item={assayOntologyTerm} isA={isA}>
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
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

AssayOntologyTerm.propTypes = {
  // Assay ontology term object to display
  assayOntologyTerm: PropTypes.object.isRequired,
  // List of term names
  isA: PropTypes.arrayOf(PropTypes.object),
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const assayOntologyTerm = (await request.getObject(
    `/assay-terms/${params.name}/`
  )).union();
  if (FetchRequest.isResponseSuccess(assayOntologyTerm)) {
    const isA = assayOntologyTerm.is_a
      ? await requestOntologyTerms(assayOntologyTerm.is_a, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      assayOntologyTerm,
      assayOntologyTerm.term_id,
      req.headers.cookie
    );
    return {
      props: {
        assayOntologyTerm,
        isA,
        pageContext: { title: assayOntologyTerm.term_id },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(assayOntologyTerm);
}

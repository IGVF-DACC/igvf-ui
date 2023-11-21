// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { DataArea, DataPanel } from "../../components/data-area";
import { OntologyTermDataItems } from "../../components/common-data-items";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function PhenotypeOntologyTerm({
  phenotypeOntologyTerm,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={phenotypeOntologyTerm}>
        <PagePreamble />
        <ObjectPageHeader item={phenotypeOntologyTerm} isJsonFormat={isJson} />
        <JsonDisplay item={phenotypeOntologyTerm} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <OntologyTermDataItems item={phenotypeOntologyTerm} />
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

PhenotypeOntologyTerm.propTypes = {
  // Phenotype ontology term object to display
  phenotypeOntologyTerm: PropTypes.object.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const phenotypeOntologyTerm = (
    await request.getObject(`/phenotype-terms/${params.name}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(phenotypeOntologyTerm)) {
    const breadcrumbs = await buildBreadcrumbs(
      phenotypeOntologyTerm,
      phenotypeOntologyTerm.term_id,
      req.headers.cookie
    );
    return {
      props: {
        phenotypeOntologyTerm,
        pageContext: { title: phenotypeOntologyTerm.term_id },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(phenotypeOntologyTerm);
}

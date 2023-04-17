// node_modules
import PropTypes from "prop-types";
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

export default function PhenotypeOntologyTerm({ phenotypeOntologyTerm }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={phenotypeOntologyTerm}>
        <PagePreamble />
        <ObjectPageHeader item={phenotypeOntologyTerm} />
        <DataPanel>
          <DataArea>
            <OntologyTermDataItems ontologyTerm={phenotypeOntologyTerm} />
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
}

PhenotypeOntologyTerm.propTypes = {
  // Phenotype ontology term object to display
  phenotypeOntologyTerm: PropTypes.object.isRequired,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const phenotypeOntologyTerm = await request.getObject(
    `/phenotype-terms/${params.name}/`
  );
  if (FetchRequest.isResponseSuccess(phenotypeOntologyTerm)) {
    const breadcrumbs = await buildBreadcrumbs(
      phenotypeOntologyTerm,
      "term_id",
      req.headers.cookie
    );
    return {
      props: {
        phenotypeOntologyTerm,
        pageContext: { title: phenotypeOntologyTerm.term_id },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(phenotypeOntologyTerm);
}

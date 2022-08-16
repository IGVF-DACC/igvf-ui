// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { OntologyTermDataItems } from "../../components/common-data-items";
import { EditableItem } from "../../components/edit";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const PhenotypeOntologyTerm = ({ phenotypeOntologyTerm }) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={phenotypeOntologyTerm}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={phenotypeOntologyTerm.status} />
            </DataItemValue>
            <OntologyTermDataItems ontologyTerm={phenotypeOntologyTerm} />
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
};

PhenotypeOntologyTerm.propTypes = {
  // Phenotype ontology term object to display
  phenotypeOntologyTerm: PropTypes.object.isRequired,
};

export default PhenotypeOntologyTerm;

export const getServerSideProps = async ({ params, req }) => {
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
        sessionCookie: req?.headers?.cookie,
      },
    };
  }
  return errorObjectToProps(phenotypeOntologyTerm);
};

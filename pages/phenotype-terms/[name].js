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
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs";
import Request from "../../libs/request";

const PhenotypeOntologyTerm = ({ phenotypeOntologyTerm }) => {
  return (
    <>
      <Breadcrumbs />
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
    </>
  );
};

PhenotypeOntologyTerm.propTypes = {
  // Phenotype ontology term object to display
  phenotypeOntologyTerm: PropTypes.object.isRequired,
};

export default PhenotypeOntologyTerm;

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie);
  const phenotypeOntologyTerm = await request.getObject(
    `/phenotype-terms/${params.name}/`
  );
  if (phenotypeOntologyTerm && phenotypeOntologyTerm.status !== "error") {
    const breadcrumbs = await buildBreadcrumbs(
      phenotypeOntologyTerm,
      "term_id"
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
  return { notFound: true };
};

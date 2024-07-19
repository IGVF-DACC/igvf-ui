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
import { requestOntologyTerms } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function PhenotypeOntologyTerm({
  phenotypeOntologyTerm,
  isA,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs item={phenotypeOntologyTerm} />
      <EditableItem item={phenotypeOntologyTerm}>
        <PagePreamble />
        <ObjectPageHeader item={phenotypeOntologyTerm} isJsonFormat={isJson} />
        <JsonDisplay item={phenotypeOntologyTerm} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <OntologyTermDataItems item={phenotypeOntologyTerm} isA={isA} />
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
  // List of term names
  isA: PropTypes.arrayOf(PropTypes.object),
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
    const isA = phenotypeOntologyTerm.is_a
      ? await requestOntologyTerms(phenotypeOntologyTerm.is_a, request)
      : [];
    return {
      props: {
        phenotypeOntologyTerm,
        isA,
        pageContext: { title: phenotypeOntologyTerm.term_id },
        isJson,
      },
    };
  }
  return errorObjectToProps(phenotypeOntologyTerm);
}

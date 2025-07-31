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
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import { requestOntologyTerms } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function AssayOntologyTerm({ assayOntologyTerm, isA, isJson }) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={assayOntologyTerm} />
      <EditableItem item={assayOntologyTerm}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={assayOntologyTerm} isJsonFormat={isJson} />
        <JsonDisplay item={assayOntologyTerm} isJsonFormat={isJson}>
          <StatusPreviewDetail item={assayOntologyTerm} />
          <DataPanel>
            <DataArea>
              <OntologyTermDataItems item={assayOntologyTerm} isA={isA}>
                {assayOntologyTerm.category_slims?.length > 0 && (
                  <>
                    <DataItemLabel>Assay Category</DataItemLabel>
                    <DataItemValue>
                      {assayOntologyTerm.category_slims.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {assayOntologyTerm.preferred_assay_titles?.length > 0 && (
                  <>
                    <DataItemLabel>Preferred Assay Title</DataItemLabel>
                    <DataItemValue>
                      {assayOntologyTerm.preferred_assay_titles.join(", ")}
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
  const assayOntologyTerm = (
    await request.getObject(`/assay-terms/${params.name}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(assayOntologyTerm)) {
    const isA = assayOntologyTerm.is_a
      ? await requestOntologyTerms(assayOntologyTerm.is_a, request)
      : [];
    return {
      props: {
        assayOntologyTerm,
        isA,
        pageContext: { title: assayOntologyTerm.term_id },
        isJson,
      },
    };
  }
  return errorObjectToProps(assayOntologyTerm);
}

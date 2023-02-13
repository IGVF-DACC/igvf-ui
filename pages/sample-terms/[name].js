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
import DbxrefList from "../../components/dbxref-list";
import { EditableItem } from "../../components/edit";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function SampleOntologyTerm({ sampleOntologyTerm }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sampleOntologyTerm}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={sampleOntologyTerm.status} />
            </DataItemValue>
            {sampleOntologyTerm.dbxrefs?.length > 0 && (
              <>
                <DataItemLabel>External Resources</DataItemLabel>
                <DataItemValue>
                  <DbxrefList dbxrefs={sampleOntologyTerm.dbxrefs} />
                </DataItemValue>
              </>
            )}
            <OntologyTermDataItems ontologyTerm={sampleOntologyTerm}>
              {sampleOntologyTerm.organ_slims.length > 0 && (
                <>
                  <DataItemLabel>Organs</DataItemLabel>
                  <DataItemValue>
                    {sampleOntologyTerm.organ_slims.join(", ")}
                  </DataItemValue>
                </>
              )}
              {sampleOntologyTerm.cell_slims.length > 0 && (
                <>
                  <DataItemLabel>Cells</DataItemLabel>
                  <DataItemValue>
                    {sampleOntologyTerm.cell_slims.join(", ")}
                  </DataItemValue>
                </>
              )}
              {sampleOntologyTerm.developmental_slims.length > 0 && (
                <>
                  <DataItemLabel>Developmental Slims</DataItemLabel>
                  <DataItemValue>
                    {sampleOntologyTerm.developmental_slims.join(", ")}
                  </DataItemValue>
                </>
              )}
              {sampleOntologyTerm.system_slims.length > 0 && (
                <>
                  <DataItemLabel>System Slims</DataItemLabel>
                  <DataItemValue>
                    {sampleOntologyTerm.system_slims.join(", ")}
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

SampleOntologyTerm.propTypes = {
  // Sample ontology term object to display
  sampleOntologyTerm: PropTypes.object.isRequired,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sampleOntologyTerm = await request.getObject(
    `/sample-terms//${params.name}/`
  );
  if (FetchRequest.isResponseSuccess(sampleOntologyTerm)) {
    const breadcrumbs = await buildBreadcrumbs(
      sampleOntologyTerm,
      "term_id",
      req.headers.cookie
    );
    return {
      props: {
        sampleOntologyTerm,
        pageContext: { title: sampleOntologyTerm.term_id },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(sampleOntologyTerm);
}

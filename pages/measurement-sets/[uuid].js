// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import SeparatedList from "../../components/separated-list";
import Link from "next/link";

export default function MeasurementSet({
  measurementSet,
  award = null,
  assayTerm,
  documents,
  donors,
  lab = null,
  samples,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={measurementSet}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={measurementSet.status} />
            </DataItemValue>
            <DataItemLabel>Assay Term</DataItemLabel>
            <DataItemValue>
              <Link href={assayTerm["@id"]} key={assayTerm.uuid}>
                {assayTerm.term_name}
              </Link>
            </DataItemValue>
            {measurementSet.protocol && (
              <>
                <DataItemLabel>Protocol</DataItemLabel>
                <DataItemValue>
                  <Link
                    href={measurementSet["protocol"]}
                    key={measurementSet.protocol}
                  >
                    {measurementSet.protocol}
                  </Link>
                </DataItemValue>
              </>
            )}
            <DataItemLabel>Aliases</DataItemLabel>
            <DataItemValue>
              <AliasList aliases={measurementSet.aliases} />
            </DataItemValue>
            {donors.length > 0 && (
              <>
                <DataItemLabel>Donors</DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {donors.map((donor) => (
                      <Link href={donor["@id"]} key={donor.uuid}>
                        {donor.accession}
                      </Link>
                    ))}
                  </SeparatedList>
                </DataItemValue>
              </>
            )}
            {samples.length > 0 && (
              <>
                <DataItemLabel>Samples</DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {samples.map((sample) => (
                      <Link href={sample["@id"]} key={sample.uuid}>
                        {sample.accession}
                      </Link>
                    ))}
                  </SeparatedList>
                </DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
        {documents.length > 0 && (
          <>
            <DataAreaTitle>Documents</DataAreaTitle>
            <DocumentTable documents={documents} />
          </>
        )}

        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
}

MeasurementSet.propTypes = {
  measurementSet: PropTypes.object.isRequired,
  assayTerm: PropTypes.object.isRequired,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Award applied to this measurement set
  award: PropTypes.object,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this measurement set
  lab: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const measurementSet = await request.getObject(
    `/measurement-sets/${params.uuid}/`
  );
  if (FetchRequest.isResponseSuccess(measurementSet)) {
    const award = await request.getObject(measurementSet.award, null);
    const assayTerm = await request.getObject(measurementSet.assay_term, null);
    const documents = measurementSet.documents
      ? await request.getMultipleObjects(measurementSet.documents, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(measurementSet.lab, null);
    const samples = measurementSet.samples
      ? await request.getMultipleObjects(measurementSet.samples, null, {
          filterErrors: true,
        })
      : [];
    const donors = measurementSet.donors
      ? await request.getMultipleObjects(measurementSet.donors, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      measurementSet,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        measurementSet,
        award,
        assayTerm,
        documents,
        donors,
        lab,
        samples,
        pageContext: { title: measurementSet.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(measurementSet);
}

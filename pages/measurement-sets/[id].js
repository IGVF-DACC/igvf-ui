// node_modules
import Link from "next/link";
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
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import SeparatedList from "../../components/separated-list";

export default function MeasurementSet({
  measurementSet,
  assayTerm = null,
  documents,
  donors,
  files,
  samples,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={measurementSet}>
        <PagePreamble />
        <ObjectPageHeader item={measurementSet} />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Assay Term</DataItemLabel>
            {assayTerm && (
              <DataItemValue>
                <Link href={assayTerm["@id"]}>{assayTerm.term_name}</Link>
              </DataItemValue>
            )}
            {measurementSet.protocol && (
              <>
                <DataItemLabel>Protocol</DataItemLabel>
                <DataItemValue>
                  <Link
                    href={measurementSet.protocol}
                    key={measurementSet.protocol}
                  >
                    {measurementSet.protocol}
                  </Link>
                </DataItemValue>
              </>
            )}
            {measurementSet.aliases?.length > 0 && (
              <>
                <DataItemLabel>Aliases</DataItemLabel>
                <DataItemValue>
                  <AliasList aliases={measurementSet.aliases} />
                </DataItemValue>
              </>
            )}
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
        {files.length > 0 && (
          <>
            <DataAreaTitle>Files</DataAreaTitle>
            <FileTable files={files} />
          </>
        )}
        {documents.length > 0 && (
          <>
            <DataAreaTitle>Documents</DataAreaTitle>
            <DocumentTable documents={documents} />
          </>
        )}

        <Attribution attribution={attribution} />
      </EditableItem>
    </>
  );
}

MeasurementSet.propTypes = {
  // Measurement set to display
  measurementSet: PropTypes.object.isRequired,
  // Assay term of the measurement set
  assayTerm: PropTypes.object,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this measurement set
  attribution: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const measurementSet = await request.getObject(
    `/measurement-sets/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(measurementSet)) {
    const assayTerm = await request.getObject(
      measurementSet.assay_term["@id"],
      null
    );
    const documents = measurementSet.documents
      ? await request.getMultipleObjects(measurementSet.documents, null, {
          filterErrors: true,
        })
      : [];
    const files = measurementSet.files
      ? await request.getMultipleObjects(measurementSet.files, null, {
          filterErrors: true,
        })
      : [];
    const samples = measurementSet.samples
      ? await request.getMultipleObjects(measurementSet.samples, null, {
          filterErrors: true,
        })
      : [];
    let donors = [];
    if (measurementSet.donors) {
      const donorPaths = measurementSet.donors.map((donor) => donor["@id"]);
      donors = await request.getMultipleObjects(donorPaths, null, {
        filterErrors: true,
      });
    }
    const breadcrumbs = await buildBreadcrumbs(
      measurementSet,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      measurementSet,
      req.headers.cookie
    );
    return {
      props: {
        measurementSet,
        assayTerm,
        documents,
        donors,
        files,
        samples,
        pageContext: { title: measurementSet.accession },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(measurementSet);
}

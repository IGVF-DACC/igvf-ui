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

export default function AnalysisSet({
  analysisSet,
  award = null,
  documents,
  input_file_sets,
  donors,
  lab = null,
  samples,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={analysisSet}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={analysisSet.status} />
            </DataItemValue>
            <DataItemLabel>Aliases</DataItemLabel>
            <DataItemValue>
              <AliasList aliases={analysisSet.aliases} />
            </DataItemValue>
            {input_file_sets.length > 0 && (
              <>
                <DataItemLabel>Input File Sets</DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {input_file_sets.map((file) => (
                      <Link href={file["@id"]} key={file.uuid}>
                        {file.accession}
                      </Link>
                    ))}
                  </SeparatedList>
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

AnalysisSet.propTypes = {
  analysisSet: PropTypes.object.isRequired,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Award applied to this analysis set
  award: PropTypes.object,
  // input_file_sets to this analysis set
  input_file_sets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this analysis set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Lab that submitted this analysis set
  lab: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisSet = await request.getObject(`/analysis-sets/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(analysisSet)) {
    const award = await request.getObject(analysisSet.award, null);
    const input_file_sets = analysisSet.input_file_sets
      ? await request.getMultipleObjects(analysisSet.input_file_sets, null, {
          filterErrors: true,
        })
      : [];
    const documents = analysisSet.documents
      ? await request.getMultipleObjects(analysisSet.documents, null, {
          filterErrors: true,
        })
      : [];
    const lab = await request.getObject(analysisSet.lab, null);
    const samples = analysisSet.samples
      ? await request.getMultipleObjects(analysisSet.samples, null, {
          filterErrors: true,
        })
      : [];
    const donors = analysisSet.donors
      ? await request.getMultipleObjects(analysisSet.donors, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      analysisSet,
      "accession",
      req.headers.cookie
    );
    return {
      props: {
        analysisSet,
        award,
        input_file_sets,
        documents,
        donors,
        lab,
        samples,
        pageContext: { title: analysisSet.accession },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}

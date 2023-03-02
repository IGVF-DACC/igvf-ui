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
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import SeparatedList from "../../components/separated-list";
import Link from "next/link";
import buildAttribution from "../../lib/attribution";

export default function AnalysisSet({
  analysisSet,
  documents,
  inputFileSets,
  donors,
  samples,
  attribution = null,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={analysisSet}>
        <PagePreamble />
        <ObjectPageHeader item={analysisSet} />
        <DataPanel>
          <DataArea>
            {analysisSet.aliases?.length > 0 && (
              <>
                <DataItemLabel>Aliases</DataItemLabel>
                <DataItemValue>
                  <AliasList aliases={analysisSet.aliases} />
                </DataItemValue>
              </>
            )}
            {inputFileSets.length > 0 && (
              <>
                <DataItemLabel>Input File Sets</DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {inputFileSets.map((file) => (
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
        <Attribution attribution={attribution} />
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
  // input_file_sets to this analysis set
  inputFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this analysis set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this analysis set
  attribution: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisSet = await request.getObject(`/analysis-sets/${params.id}/`);
  if (FetchRequest.isResponseSuccess(analysisSet)) {
    const inputFileSets = analysisSet.input_file_sets
      ? await request.getMultipleObjects(analysisSet.input_file_sets, null, {
          filterErrors: true,
        })
      : [];
    const documents = analysisSet.documents
      ? await request.getMultipleObjects(analysisSet.documents, null, {
          filterErrors: true,
        })
      : [];
    const samples = analysisSet.samples
      ? await request.getMultipleObjects(analysisSet.samples, null, {
          filterErrors: true,
        })
      : [];
    let donors = [];
    if (analysisSet.donors) {
      const donorPaths = analysisSet.donors.map((donor) => donor["@id"]);
      donors = await request.getMultipleObjects(donorPaths, null, {
        filterErrors: true,
      });
    }
    const breadcrumbs = await buildBreadcrumbs(
      analysisSet,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(analysisSet, req.headers.cookie);
    return {
      props: {
        analysisSet,
        inputFileSets,
        documents,
        donors,
        samples,
        pageContext: { title: analysisSet.accession },
        breadcrumbs,
        attribution,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataAreaTitle,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { logTime } from "../../lib/general";


export default function AnalysisSet({
  analysisSet,
  documents,
  inputFileSets,
  donors,
  files,
  samples,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={analysisSet}>
        <PagePreamble />
        <ObjectPageHeader item={analysisSet} isJsonFormat={isJson} />
        <JsonDisplay item={analysisSet} isJsonFormat={isJson}>
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
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

AnalysisSet.propTypes = {
  analysisSet: PropTypes.object.isRequired,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // input_file_sets to this analysis set
  inputFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this analysis set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this analysis set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  return logTime(
    `/analysis-sets/${params.id}/`,
    async ({ params, req, query }) => {
      const isJson = isJsonFormat(query);
      const request = new FetchRequest({ cookie: req.headers.cookie });
      const analysisSet = await request.getObject(
        `/analysis-sets/${params.id}/`
      );
      if (FetchRequest.isResponseSuccess(analysisSet)) {
        const inputFileSets = analysisSet.input_file_sets
          ? await request.getMultipleObjects(
              analysisSet.input_file_sets,
              null,
              {
                filterErrors: true,
              }
            )
          : [];
        const documents = analysisSet.documents
          ? await request.getMultipleObjects(analysisSet.documents, null, {
              filterErrors: true,
            })
          : [];
        const files = analysisSet.files
          ? await request.getMultipleObjects(analysisSet.files, null, {
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
        const attribution = await buildAttribution(
          analysisSet,
          req.headers.cookie
        );
        return {
          props: {
            analysisSet,
            inputFileSets,
            documents,
            donors,
            files,
            samples,
            pageContext: { title: analysisSet.accession },
            breadcrumbs,
            attribution,
            isJson,
          },
        };
      }
      return errorObjectToProps(analysisSet);
    }
  )({ params, req, query });
}

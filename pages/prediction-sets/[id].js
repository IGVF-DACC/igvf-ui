// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import ChromosomeLocations from "../../components/chromosome-locations";
import {
  DataArea,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import SeparatedList from "../../components/separated-list";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestPublications,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import DonorTable from "../../components/donor-table";

export default function PredictionSet({
  predictionSet,
  documents,
  publications,
  files,
  attribution = null,
  isJson,
}) {
  const constructLibrarySets =
    predictionSet.samples?.length > 0
      ? predictionSet.samples.reduce(
          (acc, sample) =>
            sample.construct_library_sets
              ? acc.concat(sample.construct_library_sets)
              : acc,
          []
        )
      : [];

  return (
    <>
      <Breadcrumbs item={predictionSet} />
      <EditableItem item={predictionSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={predictionSet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={predictionSet} isJsonFormat={isJson} />
        <JsonDisplay item={predictionSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileSetDataItems
                item={predictionSet}
                publications={publications}
              >
                {constructLibrarySets.length > 0 && (
                  <>
                    <DataItemLabel>Construct Library Sets</DataItemLabel>
                    <DataItemList isCollapsible>
                      {constructLibrarySets.map((fileSet) => {
                        return (
                          <div key={fileSet["@id"]}>
                            <Link href={fileSet["@id"]}>
                              {fileSet.accession}
                            </Link>
                            <span className="text-gray-600 dark:text-gray-400">
                              {" "}
                              {fileSet.summary}
                            </span>
                          </div>
                        );
                      })}
                    </DataItemList>
                  </>
                )}
                {predictionSet.scope && (
                  <>
                    <DataItemLabel>Scope</DataItemLabel>
                    <DataItemValue>{predictionSet.scope}</DataItemValue>
                  </>
                )}
                {predictionSet.small_scale_gene_list && (
                  <>
                    <DataItemLabel>Small Scale Gene List</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {predictionSet.small_scale_gene_list.map((gene) => (
                          <Link href={gene["@id"]} key={gene["@id"]}>
                            {gene.symbol}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
                {predictionSet.small_scale_loci_list && (
                  <>
                    <DataItemLabel>Small Scale Loci List</DataItemLabel>
                    <DataItemValue>
                      <ChromosomeLocations
                        locations={predictionSet.small_scale_loci_list}
                        isCollapsible
                      />
                    </DataItemValue>
                  </>
                )}
                {predictionSet.large_scale_gene_list && (
                  <>
                    <DataItemLabel>Large Scale Gene List</DataItemLabel>
                    <DataItemValue>
                      <Link
                        href={predictionSet.large_scale_gene_list["@id"]}
                        key={predictionSet.large_scale_gene_list["@id"]}
                      >
                        {predictionSet.large_scale_gene_list.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {predictionSet.large_scale_loci_list && (
                  <>
                    <DataItemLabel>Large Scale Loci List</DataItemLabel>
                    <DataItemValue>
                      <Link
                        href={predictionSet.large_scale_loci_list["@id"]}
                        key={predictionSet.large_scale_loci_list["@id"]}
                      >
                        {predictionSet.large_scale_loci_list.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
            </DataArea>
          </DataPanel>
          {predictionSet.samples?.length > 0 && (
            <SampleTable
              samples={predictionSet.samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${predictionSet["@id"]}`}
              reportLabel="Report of samples in this prediction set"
            />
          )}
          {predictionSet.donors?.length > 0 && (
            <DonorTable donors={predictionSet.donors} />
          )}
          {files.length > 0 && (
            <FileTable files={files} fileSet={predictionSet} isDownloadable />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

PredictionSet.propTypes = {
  // Prediction set to display
  predictionSet: PropTypes.object.isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this prediction set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this prediction set
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this prediction set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const predictionSet = (
    await request.getObject(`/prediction-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(predictionSet)) {
    const documents = predictionSet.documents
      ? await requestDocuments(predictionSet.documents, request)
      : [];

    let files = [];
    if (predictionSet.files.length > 0) {
      const filePaths = predictionSet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }

    let publications = [];
    if (predictionSet.publications?.length > 0) {
      const publicationPaths = predictionSet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const attribution = await buildAttribution(
      predictionSet,
      req.headers.cookie
    );
    return {
      props: {
        predictionSet,
        documents,
        publications,
        files,
        pageContext: { title: predictionSet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(predictionSet);
}

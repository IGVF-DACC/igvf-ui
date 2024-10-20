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
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import { usePagePanels } from "../../components/page-panels";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import SeparatedList from "../../components/separated-list";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
  requestGenes,
  requestPublications,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import DonorTable from "../../components/donor-table";

export default function PredictionSet({
  predictionSet,
  inputFileSets,
  inputFileSetFor,
  controlFor,
  documents,
  publications,
  files,
  assessedGenes,
  attribution = null,
  isJson,
}) {
  const pagePanels = usePagePanels(predictionSet["@id"]);
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
        <PagePreamble />
        <AlternateAccessions
          alternateAccessions={predictionSet.alternate_accessions}
        />
        <ObjectPageHeader item={predictionSet} isJsonFormat={isJson} />
        <JsonDisplay item={predictionSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileSetDataItems
                item={predictionSet}
                publications={publications}
              >
                {predictionSet.scope && (
                  <>
                    <DataItemLabel>Scope</DataItemLabel>
                    <DataItemValue>{predictionSet.scope}</DataItemValue>
                  </>
                )}
                {predictionSet.assessed_genes && (
                  <>
                    <DataItemLabel>Assessed Genes</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {predictionSet.assessed_genes.map((gene) => (
                          <Link href={gene["@id"]} key={gene["@id"]}>
                            {gene.symbol}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
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
                {assessedGenes.length > 0 && (
                  <>
                    <DataItemLabel>Assessed Genes</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList isCollapsible>
                        {assessedGenes.map((gene) => (
                          <Link href={gene["@id"]} key={gene["@id"]}>
                            {gene.symbol}
                          </Link>
                        ))}
                      </SeparatedList>
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
              pagePanels={pagePanels}
              pagePanelId="samples"
            />
          )}
          {predictionSet.donors?.length > 0 && (
            <DonorTable
              donors={predictionSet.donors}
              pagePanels={pagePanels}
              pagePanelId="donors"
            />
          )}
          {inputFileSets.length > 0 && (
            <FileSetTable
              fileSets={inputFileSets}
              reportLink={`/multireport/?type=FileSet&input_file_set_for=${predictionSet["@id"]}`}
              reportLabel="Report of file sets that are inputs for this prediction set"
              title="Input File Sets"
              pagePanels={pagePanels}
              pagePanelId="input-file-sets"
            />
          )}
          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${predictionSet["@id"]}`}
              reportLabel="Report of file sets that this prediction set is an input for"
              title="File Sets Using This Prediction Set as an Input"
              pagePanels={pagePanels}
              pagePanelId="input-file-set-for"
            />
          )}
          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${predictionSet["@id"]}`}
              reportLabel="Report of file sets that have this prediction set as a control"
              title="File Sets Controlled by This Prediction Set"
              pagePanels={pagePanels}
              pagePanelId="control-for"
            />
          )}
          {files.length > 0 && (
            <FileTable files={files} fileSet={predictionSet} isDownloadable />
          )}
          {documents.length > 0 && (
            <DocumentTable
              documents={documents}
              pagePanels={pagePanels}
              pagePanelId="documents"
            />
          )}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

PredictionSet.propTypes = {
  // Prediction set to display
  predictionSet: PropTypes.object.isRequired,
  // Input file sets that this prediction set is an input for
  inputFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file sets for this prediction set
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control file sets for this prediction set
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Genes that are assessed in this prediction set
  assessedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
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

    const inputFileSets =
      predictionSet.input_file_sets?.length > 0
        ? await requestFileSets(predictionSet.input_file_sets, request)
        : [];

    const inputFileSetFor =
      predictionSet.input_file_set_for.length > 0
        ? await requestFileSets(predictionSet.input_file_set_for, request)
        : [];

    let controlFor = [];
    if (predictionSet.control_for.length > 0) {
      const controlForPaths = predictionSet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    let files = [];
    if (predictionSet.files.length > 0) {
      const filePaths = predictionSet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }

    const assessedGenes =
      predictionSet.assessed_genes?.length > 0
        ? await requestGenes(predictionSet.assessed_genes, request)
        : [];

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
        inputFileSets,
        inputFileSetFor,
        controlFor,
        assessedGenes,
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

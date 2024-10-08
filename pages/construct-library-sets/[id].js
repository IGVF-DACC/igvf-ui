// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataAreaTitle,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileSetFilesTables from "../../components/file-set-files-tables";
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
  requestPublications,
  requestSeqspecFiles,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

/**
 * Display the library details for the given library. This can comprise one of three different
 * types of library details: expression vector, guide, or reporter. Exactly one of these three
 * types of library details must exist in the library object. We still check all three types in
 * case the data is malformed.
 */
function LibraryDetails({ library }) {
  return (
    <>
      <DataAreaTitle className="capitalize">
        {library.file_set_type} Details
      </DataAreaTitle>
      <DataPanel>
        <DataArea>
          <DataItemLabel>Library Construct Scope</DataItemLabel>
          <DataItemValue>{library.scope}</DataItemValue>
          <DataItemLabel>Selection Criteria</DataItemLabel>
          <DataItemValue>{library.selection_criteria.join(", ")}</DataItemValue>
          {library.small_scale_gene_list && (
            <>
              <DataItemLabel>Small Scale Gene List</DataItemLabel>
              <DataItemValue>
                <SeparatedList isCollapsible>
                  {library.small_scale_gene_list.map((gene) => (
                    <Link href={gene["@id"]} key={gene["@id"]}>
                      {gene.symbol}
                    </Link>
                  ))}
                </SeparatedList>
              </DataItemValue>
            </>
          )}
          {library.small_scale_loci_list && (
            <>
              <DataItemLabel>Small Scale Loci List</DataItemLabel>
              <DataItemValue>
                <SeparatedList isCollapsible>
                  {library.small_scale_loci_list.map((loci, index) => (
                    <Fragment key={index}>
                      {loci.assembly} {loci.chromosome} {loci.start}
                      {"-"}
                      {loci.end}
                    </Fragment>
                  ))}
                </SeparatedList>
              </DataItemValue>
            </>
          )}
          {library.large_scale_gene_list && (
            <>
              <DataItemLabel>Large Scale Gene List</DataItemLabel>
              <DataItemValue>
                <Link
                  href={library.large_scale_gene_list["@id"]}
                  key={library.large_scale_gene_list["@id"]}
                >
                  {library.large_scale_gene_list.accession}
                </Link>
              </DataItemValue>
            </>
          )}
          {library.large_scale_loci_list && (
            <>
              <DataItemLabel>Large Scale Loci List</DataItemLabel>
              <DataItemValue>
                <Link
                  href={library.large_scale_loci_list["@id"]}
                  key={library.large_scale_loci_list["@id"]}
                >
                  {library.large_scale_loci_list.accession}
                </Link>
              </DataItemValue>
            </>
          )}
          {library.orf_list && (
            <>
              <DataItemLabel>Open Reading Frame List</DataItemLabel>
              <DataItemValue>
                <SeparatedList isCollapsible>
                  {library.orf_list.map((orf) => (
                    <Link href={orf["@id"]} key={orf["@id"]}>
                      {orf.orf_id}
                    </Link>
                  ))}
                </SeparatedList>
              </DataItemValue>
            </>
          )}
          {library.associated_phenotypes?.length > 0 && (
            <>
              <DataItemLabel>Associated Phenotypes</DataItemLabel>
              <DataItemValue>
                <SeparatedList isCollapsible>
                  {library.associated_phenotypes.map((phenotype) => (
                    <Link href={phenotype["@id"]} key={phenotype["@id"]}>
                      {phenotype.term_name}
                    </Link>
                  ))}
                </SeparatedList>
              </DataItemValue>
            </>
          )}
          {library.average_insert_size && (
            <>
              <DataItemLabel>Average Insert Size</DataItemLabel>
              <DataItemValue>{library.average_insert_size}</DataItemValue>
            </>
          )}
          {library.lower_bound_insert_size &&
            library.upper_bound_insert_size && (
              <>
                {library.lower_bound_insert_size !==
                  library.upper_bound_insert_size && (
                  <>
                    <DataItemLabel>Insert Size Range</DataItemLabel>
                    <DataItemValue>
                      {library.lower_bound_insert_size} {UC.ndash}{" "}
                      {library.upper_bound_insert_size}
                    </DataItemValue>
                  </>
                )}
                {library.lower_bound_insert_size ===
                  library.upper_bound_insert_size && (
                  <>
                    <DataItemLabel>Insert Size</DataItemLabel>
                    <DataItemValue>
                      {library.lower_bound_insert_size}
                    </DataItemValue>
                  </>
                )}
              </>
            )}
          {library.guide_type && (
            <>
              <DataItemLabel>Guide Type</DataItemLabel>
              <DataItemValue>{library.guide_type}</DataItemValue>
            </>
          )}
          {library.tiling_modality && (
            <>
              <DataItemLabel>Tiling Modality</DataItemLabel>
              <DataItemValue>{library.tiling_modality}</DataItemValue>
            </>
          )}
          {library.average_guide_coverage && (
            <>
              <DataItemLabel>Average Guide Coverage</DataItemLabel>
              <DataItemValue>{library.average_guide_coverage}</DataItemValue>
            </>
          )}
          {library.lower_bound_guide_coverage &&
            library.upper_bound_guide_coverage && (
              <>
                {library.lower_bound_guide_coverage !==
                  library.upper_bound_guide_coverage && (
                  <>
                    <DataItemLabel>Guide Coverage Range</DataItemLabel>
                    <DataItemValue>
                      {library.lower_bound_guide_coverage} {UC.ndash}{" "}
                      {library.upper_bound_guide_coverage}
                    </DataItemValue>
                  </>
                )}
                {library.lower_bound_guide_coverage ===
                  library.upper_bound_guide_coverage && (
                  <>
                    <DataItemLabel>Guide Coverage</DataItemLabel>
                    <DataItemValue>
                      {library.lower_bound_guide_coverage}
                    </DataItemValue>
                  </>
                )}
              </>
            )}
          {library.exon && (
            <>
              <DataItemLabel>Exon</DataItemLabel>
              <DataItemValue>{library.exon}</DataItemValue>
            </>
          )}
          {library.tile && (
            <>
              <DataItemLabel>Tile</DataItemLabel>
              <DataItemValue>
                {library.tile.tile_id} {library.tile.tile_start}
                {"-"}
                {library.tile.tile_end}
              </DataItemValue>
            </>
          )}
          {library.targeton && (
            <>
              <DataItemLabel>Targeton</DataItemLabel>
              <DataItemValue>{library.targeton}</DataItemValue>
            </>
          )}
        </DataArea>
      </DataPanel>
    </>
  );
}

LibraryDetails.propTypes = {
  // Library object to display
  library: PropTypes.object.isRequired,
};

export default function ConstructLibrarySet({
  constructLibrarySet,
  controlFor,
  inputFileSetFor,
  documents,
  publications,
  files,
  seqspecFiles,
  integratedContentFiles,
  attribution = null,
  isJson,
}) {
  const pagePanels = usePagePanels();

  return (
    <>
      <Breadcrumbs item={constructLibrarySet} />
      <EditableItem item={constructLibrarySet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={constructLibrarySet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={constructLibrarySet} isJsonFormat={isJson} />
        <JsonDisplay item={constructLibrarySet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileSetDataItems
                item={constructLibrarySet}
                publications={publications}
              >
                {constructLibrarySet.product_id && (
                  <>
                    <DataItemLabel>Product ID</DataItemLabel>
                    <DataItemValue>
                      <Link
                        href={`https://www.addgene.org/${
                          constructLibrarySet.product_id.split(":")[1]
                        }/`}
                      >
                        {constructLibrarySet.product_id}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {constructLibrarySet.sources && (
                  <>
                    <DataItemLabel>Sources</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {constructLibrarySet.sources.map((source) => (
                          <Link href={source} key={source}>
                            {source.split("/")[2]}
                          </Link>
                        ))}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
            </DataArea>
          </DataPanel>
          <LibraryDetails library={constructLibrarySet} />
          <FileSetFilesTables
            files={files}
            fileSet={constructLibrarySet}
            seqspecFiles={seqspecFiles}
            pagePanels={pagePanels}
            isDefaultExpanded
          />
          {integratedContentFiles.length > 0 && (
            <FileTable
              files={integratedContentFiles}
              title="Integrated Content Files"
              reportLink={`/multireport/?type=File&integrated_in.@id=${constructLibrarySet["@id"]}`}
              reportLabel="Report of files that have integrated in this construct library set"
              pagePanels={pagePanels}
              pagePanelId="integrated-content-files"
            />
          )}
          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${constructLibrarySet["@id"]}`}
              reportLabel="Report of file sets that this construct library set is an input for"
              title="File Sets Using This Construct Library Set as an Input"
              pagePanels={pagePanels}
              pagePanelId="input-file-set-for"
            />
          )}
          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${constructLibrarySet["@id"]}`}
              reportLabel="Report of file sets that have this construct library set as a control"
              title="File Sets Controlled by This Construct Library Set"
              pagePanels={pagePanels}
              pagePanelId="control-for"
            />
          )}
          {constructLibrarySet.applied_to_samples.length > 0 && (
            <SampleTable
              samples={constructLibrarySet.applied_to_samples}
              reportLink={`/multireport/?type=Sample&construct_library_sets=${constructLibrarySet["@id"]}`}
              reportLabel="Report of samples that link to this construct library set"
              title="Applied to Samples"
              pagePanels={pagePanels}
              pagePanelId="applied-to-samples"
            />
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

ConstructLibrarySet.propTypes = {
  // Construct library object this page displays
  constructLibrarySet: PropTypes.object.isRequired,
  // File sets controlled by this file set
  controlFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets that this file set is an input for
  inputFileSetFor: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Integrated content file objects
  integratedContentFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this construct library
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this construct library
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this analysis set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const constructLibrarySet = (
    await request.getObject(`/construct-library-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(constructLibrarySet)) {
    const documents = constructLibrarySet.documents
      ? await requestDocuments(constructLibrarySet.documents, request)
      : [];

    const inputFileSetFor =
      constructLibrarySet.input_file_set_for.length > 0
        ? await requestFileSets(constructLibrarySet.input_file_set_for, request)
        : [];

    let controlFor = [];
    if (constructLibrarySet.control_for.length > 0) {
      const controlForPaths = constructLibrarySet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    // Request files and their sequencing platforms.
    const filePaths = constructLibrarySet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    let integratedContentFiles = [];
    if (constructLibrarySet.integrated_content_files?.length > 0) {
      const filePaths = constructLibrarySet.integrated_content_files.map(
        (file) => file["@id"]
      );
      integratedContentFiles = await requestFiles(filePaths, request);
    }

    const seqspecFiles =
      files.length > 0 ? await requestSeqspecFiles(files, request) : [];

    let publications = [];
    if (constructLibrarySet.publications?.length > 0) {
      const publicationPaths = constructLibrarySet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const attribution = await buildAttribution(
      constructLibrarySet,
      req.headers.cookie
    );
    return {
      props: {
        constructLibrarySet,
        controlFor,
        inputFileSetFor,
        documents,
        files,
        seqspecFiles,
        integratedContentFiles,
        publications,
        pageContext: { title: constructLibrarySet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(constructLibrarySet);
}

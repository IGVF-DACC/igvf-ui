// node_modules
import PropTypes from "prop-types";
import { Fragment, useContext } from "react";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
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
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetFilesTables from "../../components/file-set-files-tables";
import FileSetTable from "../../components/file-set-table";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
import SessionContext from "../../components/session-context";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestDonors,
  requestFiles,
  requestFileSets,
  requestPublications,
  requestSeqspecFiles,
  requestSupersedes,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { convertTextToTitleCase } from "../../lib/general";
import {
  getAssayTitleDescriptionMap,
  getPreferredAssayTitleDescriptionMap,
} from "../../lib/ontology-terms";
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
      <DataAreaTitle id="library-details">
        {convertTextToTitleCase(library.file_set_type)} Details
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
  fileSets,
  donors,
  seqspecFiles,
  seqspecDocuments,
  integratedContentFiles,
  assayTitleDescriptionMap,
  supersedes,
  supersededBy,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);

  return (
    <>
      <Breadcrumbs item={constructLibrarySet} />
      <EditableItem item={constructLibrarySet}>
        <PagePreamble sections={sections} />
        <AlternativeIdentifiers
          alternateAccessions={constructLibrarySet.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={constructLibrarySet} isJsonFormat={isJson} />
        <JsonDisplay item={constructLibrarySet} isJsonFormat={isJson}>
          <StatusPreviewDetail item={constructLibrarySet} />
          <DataPanel>
            <DataArea>
              <FileSetDataItems
                item={constructLibrarySet}
                publications={publications}
                assayTitleDescriptionMap={assayTitleDescriptionMap}
                preferredAssayTitleDescriptionMap={
                  preferredAssayTitleDescriptionMap
                }
              >
                {constructLibrarySet.product_id && (
                  <>
                    <DataItemLabel>Product ID</DataItemLabel>
                    <DataItemValue>
                      <a
                        href={`https://www.addgene.org/${
                          constructLibrarySet.product_id.split(":")[1]
                        }/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Addgene product page for ${constructLibrarySet.product_id}`}
                      >
                        {constructLibrarySet.product_id}
                      </a>
                    </DataItemValue>
                  </>
                )}
                {constructLibrarySet.sources?.length > 0 && (
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
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <LibraryDetails library={constructLibrarySet} />
          <FileSetFilesTables
            files={files}
            fileSet={constructLibrarySet}
            seqspecFiles={seqspecFiles}
            seqspecDocuments={seqspecDocuments}
          />
          {fileSets.length > 0 && (
            <FileSetTable
              fileSets={fileSets}
              reportLink={`/multireport/?type=FileSet&construct_library_sets.@id=${constructLibrarySet["@id"]}`}
              reportLabel="Report of file sets associated with this construct library set"
              title="File Sets Using This Construct Library Set"
              panelId="file-sets"
            />
          )}
          {integratedContentFiles.length > 0 && (
            <FileTable
              files={integratedContentFiles}
              title="Library Design Files"
              reportLink={`/multireport/?type=File&integrated_in.@id=${constructLibrarySet["@id"]}`}
              reportLabel="Report of library design files in this construct library set"
              isDeletedVisible
              panelId="library-design-files"
            />
          )}
          {inputFileSetFor.length > 0 && (
            <FileSetTable
              fileSets={inputFileSetFor}
              reportLink={`/multireport/?type=FileSet&input_file_sets.@id=${constructLibrarySet["@id"]}`}
              reportLabel="Report of file sets that this construct library set is an input for"
              title="File Sets Using This Construct Library Set as an Input"
              panelId="input-file-set-for"
            />
          )}
          {controlFor.length > 0 && (
            <FileSetTable
              fileSets={controlFor}
              reportLink={`/multireport/?type=FileSet&control_file_sets.@id=${constructLibrarySet["@id"]}`}
              reportLabel="Report of file sets that have this construct library set as a control"
              title="File Sets Controlled by This Construct Library Set"
              panelId="control-for"
            />
          )}
          {constructLibrarySet.samples?.length > 0 && (
            <SampleTable
              samples={constructLibrarySet.samples}
              reportLink={`/multireport/?type=Sample&construct_library_sets.@id=${constructLibrarySet["@id"]}`}
              reportLabel="Report of samples that link to this construct library set"
              title="Samples"
            />
          )}
          {donors.length > 0 && <DonorTable donors={donors} />}
          {documents.length > 0 && <DocumentTable documents={documents} />}
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
  // File sets associated with this construct library set
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors associated with this construct library set
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec documents associated with `files`
  seqspecDocuments: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Integrated content file objects
  integratedContentFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this construct library
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Publications associated with this construct library
  publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Map of assay titles to corresponding descriptions
  assayTitleDescriptionMap: PropTypes.object.isRequired,
  // File set that this file set supersedes
  supersedes: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File set that supersedes this file set
  supersededBy: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this analysis set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const constructLibrarySet = (
    await request.getObject(`/construct-library-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(constructLibrarySet)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      constructLibrarySet,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const documents = constructLibrarySet.documents
      ? await requestDocuments(constructLibrarySet.documents, request)
      : [];

    const inputFileSetFor =
      constructLibrarySet.input_for?.length > 0
        ? await requestFileSets(constructLibrarySet.input_for, request)
        : [];

    let controlFor = [];
    if (constructLibrarySet.control_for?.length > 0) {
      const controlForPaths = constructLibrarySet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlFor = await requestFileSets(controlForPaths, request);
    }

    // Request files and their sequencing platforms.
    const filePaths =
      constructLibrarySet.files?.length > 0
        ? constructLibrarySet.files.map((file) => file["@id"])
        : [];
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    const fileSets =
      constructLibrarySet.file_sets?.length > 0
        ? await requestFileSets(constructLibrarySet.file_sets, request)
        : [];

    const donors = await requestDonors(
      constructLibrarySet.donors?.map((donor) => donor["@id"]) || [],
      request
    );

    let integratedContentFiles = [];
    if (constructLibrarySet.integrated_content_files?.length > 0) {
      const filePaths = constructLibrarySet.integrated_content_files.map(
        (file) => file["@id"]
      );
      integratedContentFiles = await requestFiles(filePaths, request);
    }

    const seqspecFiles =
      files.length > 0 ? await requestSeqspecFiles(files, request) : [];

    let seqspecDocuments = [];
    if (files.length > 0) {
      const seqspecDocumentPaths = files.reduce(
        (acc, seqspecFile) =>
          seqspecFile.seqspec_document
            ? acc.concat(seqspecFile.seqspec_document)
            : acc,
        []
      );
      if (seqspecDocumentPaths.length > 0) {
        const uniqueDocumentPaths = [...new Set(seqspecDocumentPaths)];
        seqspecDocuments = await requestDocuments(uniqueDocumentPaths, request);
      }
    }

    let publications = [];
    if (constructLibrarySet.publications?.length > 0) {
      const publicationPaths = constructLibrarySet.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }

    const assayTitleDescriptionMap =
      constructLibrarySet.assay_titles?.length > 0
        ? await getAssayTitleDescriptionMap(
            constructLibrarySet.assay_titles,
            request
          )
        : {};

    const { supersedes, supersededBy } = await requestSupersedes(
      constructLibrarySet,
      "FileSet",
      request
    );

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
        fileSets,
        donors,
        seqspecFiles,
        seqspecDocuments,
        integratedContentFiles,
        publications,
        assayTitleDescriptionMap,
        supersedes,
        supersededBy,
        pageContext: { title: constructLibrarySet.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(constructLibrarySet);
}

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import ChromosomeLocations from "../../components/chromosome-locations";
import { FileSetDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataAreaTitle,
  DataItemValue,
  DataItemValueCollapseControl,
  DataItemValueControlLabel,
  DataPanel,
  useDataAreaCollapser,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
import SequencingFileTable from "../../components/sequencing-file-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestFiles,
  requestOntologyTerms,
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
  const genesCollapser = useDataAreaCollapser(library.genes);
  const lociCollapser = useDataAreaCollapser(library.loci);

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
          {library.associated_phenotypes?.length > 0 && (
            <>
              <DataItemLabel>Associated Phenotypes</DataItemLabel>
              <DataItemValue>
                <SeparatedList>
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
                <DataItemLabel>Insert Size Range</DataItemLabel>
                <DataItemValue>
                  {library.lower_bound_insert_size} {UC.ndash}{" "}
                  {library.upper_bound_insert_size}
                </DataItemValue>
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
                <DataItemLabel>Guide Coverage Range</DataItemLabel>
                <DataItemValue>
                  {library.lower_bound_guide_coverage} {UC.ndash}{" "}
                  {library.upper_bound_guide_coverage}
                </DataItemValue>
              </>
            )}
          {library.exon && (
            <>
              <DataItemLabel>Exon</DataItemLabel>
              <DataItemValue>{library.exon}</DataItemValue>
            </>
          )}
          {genesCollapser.displayedData.length > 0 && (
            <>
              <DataItemLabel>Genes</DataItemLabel>
              <DataItemValue>
                <SeparatedList>
                  {genesCollapser.displayedData.map((gene, index) => (
                    <Fragment key={gene["@id"]}>
                      <Link href={gene["@id"]}>{gene.geneid}</Link>
                      {index === genesCollapser.displayedData.length - 1 && (
                        <DataItemValueCollapseControl
                          key="more-control"
                          collapser={genesCollapser}
                          className="ml-1 inline-block"
                        >
                          <DataItemValueControlLabel
                            key="more-control"
                            collapser={genesCollapser}
                            className="ml-1 inline-block"
                          />
                        </DataItemValueCollapseControl>
                      )}
                    </Fragment>
                  ))}
                </SeparatedList>
              </DataItemValue>
            </>
          )}
          {lociCollapser.displayedData.length > 0 && (
            <>
              <DataItemLabel>Loci</DataItemLabel>
              <DataItemValue>
                <ChromosomeLocations locations={lociCollapser.displayedData} />
                <DataItemValueCollapseControl collapser={lociCollapser}>
                  <DataItemValueControlLabel collapser={lociCollapser} />
                </DataItemValueCollapseControl>
              </DataItemValue>
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
  documents,
  files,
  seqspecFiles,
  integratedContentFiles,
  sequencingPlatforms,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
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
              <FileSetDataItems item={constructLibrarySet}>
                {constructLibrarySet.product_id && (
                  <>
                    <DataItemLabel>Product ID</DataItemLabel>
                    <DataItemValue>
                      {constructLibrarySet.product_id}
                    </DataItemValue>
                  </>
                )}
                {constructLibrarySet.publication_identifiers && (
                  <>
                    <DataItemLabel>Publication Identifiers</DataItemLabel>
                    <DataItemValue>
                      <DbxrefList
                        dbxrefs={constructLibrarySet.publication_identifiers}
                      />
                    </DataItemValue>
                  </>
                )}
                {constructLibrarySet.applied_to_samples.length > 0 && (
                  <>
                    <DataItemLabel>Applied to Samples</DataItemLabel>
                    <DataItemValue>
                      <SeparatedList>
                        {constructLibrarySet.applied_to_samples.map(
                          (sample) => (
                            <Link href={sample["@id"]} key={sample["@id"]}>
                              {sample.accession}
                            </Link>
                          )
                        )}
                      </SeparatedList>
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
            </DataArea>
          </DataPanel>
          <LibraryDetails library={constructLibrarySet} />
          {files.length > 0 && (
            <SequencingFileTable
              files={files}
              title="Sequencing Results"
              itemPath={constructLibrarySet["@id"]}
              seqspecFiles={seqspecFiles}
              sequencingPlatforms={sequencingPlatforms}
            />
          )}
          {integratedContentFiles.length > 0 && (
            <FileTable
              files={integratedContentFiles}
              title="Integrated Content Files"
            />
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

ConstructLibrarySet.propTypes = {
  // Construct library object this page displays
  constructLibrarySet: PropTypes.object.isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Integrated content file objects
  integratedContentFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this construct library
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sequencing platform objects
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
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

    // Request files and their sequencing platforms.
    const filePaths = constructLibrarySet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];
    const sequencingPlatformPaths = files
      .map((file) => file.sequencing_platform)
      .filter((sequencingPlatform) => sequencingPlatform);
    const uniqueSequencingPlatformPaths = [...new Set(sequencingPlatformPaths)];
    const sequencingPlatforms =
      uniqueSequencingPlatformPaths.length > 0
        ? await requestOntologyTerms(uniqueSequencingPlatformPaths, request)
        : [];
    const integratedContentFiles = constructLibrarySet.integrated_content_files
      ? await requestFiles(
          constructLibrarySet.integrated_content_files,
          request
        )
      : [];

    // Use the files to retrieve all the seqspec files they might link to.
    let seqspecFiles = [];
    if (files.length > 0) {
      const seqspecPaths = files
        .map((file) => file.seqspec)
        .filter((seqspec) => seqspec);
      const uniqueSeqspecPaths = [...new Set(seqspecPaths)];
      seqspecFiles =
        uniqueSeqspecPaths.length > 0
          ? await requestFiles(uniqueSeqspecPaths, request)
          : [];
    }

    const breadcrumbs = await buildBreadcrumbs(
      constructLibrarySet,
      constructLibrarySet.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      constructLibrarySet,
      req.headers.cookie
    );
    return {
      props: {
        constructLibrarySet,
        documents,
        files,
        seqspecFiles,
        integratedContentFiles,
        sequencingPlatforms,
        pageContext: { title: constructLibrarySet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(constructLibrarySet);
}

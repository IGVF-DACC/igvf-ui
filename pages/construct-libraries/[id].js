// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import AliasList from "../../components/alias-list";
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import ChromosomeLocations from "../../components/chromosome-locations";
import {
  DataArea,
  DataItemLabel,
  DataAreaTitle,
  DataItemValue,
  DataItemValueExpandButton,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import Icon from "../../components/icon";
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
  requestGenes,
  requestOntologyTerms,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

/**
 * Display the expression vector library details as a comma-separated list of links to gene objects.
 */
function ExpressionVector({ clonedGenes, children }) {
  return (
    <>
      <DataAreaTitle>Expression Vector Library Details</DataAreaTitle>
      <DataPanel>
        <DataArea>
          <DataItemLabel>Cloned Genes</DataItemLabel>
          <DataItemValue>
            <SeparatedList>
              {clonedGenes.map((clonedGene) => (
                <Link href={clonedGene["@id"]} key={clonedGene["@id"]}>
                  {clonedGene.geneid}
                </Link>
              ))}
            </SeparatedList>
          </DataItemValue>
          {children}
        </DataArea>
      </DataPanel>
    </>
  );
}

ExpressionVector.propTypes = {
  // Cloned gene objects to display
  clonedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Display the guide library details.
 */
function Guide({ guideLibraryDetails, children }) {
  return (
    <>
      <DataAreaTitle>Guide Library Details</DataAreaTitle>
      <DataPanel>
        <DataArea>
          <DataItemLabel>Guide Type</DataItemLabel>
          <DataItemValue>{guideLibraryDetails.guide_type}</DataItemValue>
          {guideLibraryDetails.tiling_modality && (
            <>
              <DataItemLabel>Tiling Modality</DataItemLabel>
              <DataItemValue>
                {guideLibraryDetails.tiling_modality}
              </DataItemValue>
            </>
          )}
          {guideLibraryDetails.average_guide_coverage && (
            <>
              <DataItemLabel>Average Guide Coverage</DataItemLabel>
              <DataItemValue>
                {guideLibraryDetails.average_guide_coverage}
              </DataItemValue>
            </>
          )}
          {guideLibraryDetails.lower_bound_guide_coverage &&
            guideLibraryDetails.upper_bound_guide_coverage && (
              <>
                <DataItemLabel>Guide Coverage Range</DataItemLabel>
                <DataItemValue>
                  {guideLibraryDetails.lower_bound_guide_coverage} {UC.ndash}{" "}
                  {guideLibraryDetails.upper_bound_guide_coverage}
                </DataItemValue>
              </>
            )}
          {children}
        </DataArea>
      </DataPanel>
    </>
  );
}

Guide.propTypes = {
  // Guide library details object to display
  guideLibraryDetails: PropTypes.object.isRequired,
};

/**
 * Display the reporter library details.
 */
function Reporter({ reporterLibraryDetails, children }) {
  return (
    <>
      <DataAreaTitle>Reporter Library Details</DataAreaTitle>
      <DataPanel>
        <DataArea>
          {reporterLibraryDetails.average_insert_size && (
            <>
              <DataItemLabel>Average Insert Size</DataItemLabel>
              <DataItemValue>
                {reporterLibraryDetails.average_insert_size}
              </DataItemValue>
            </>
          )}
          {reporterLibraryDetails.lower_bound_insert_size &&
            reporterLibraryDetails.upper_bound_insert_size && (
              <>
                <DataItemLabel>Insert Size Range</DataItemLabel>
                <DataItemValue>
                  {reporterLibraryDetails.lower_bound_insert_size} {UC.ndash}{" "}
                  {reporterLibraryDetails.upper_bound_insert_size}
                </DataItemValue>
              </>
            )}
          {children}
        </DataArea>
      </DataPanel>
    </>
  );
}

Reporter.propTypes = {
  // Reporter library details object to display
  reporterLibraryDetails: PropTypes.object.isRequired,
};

/**
 * Display the library details for the given library. This can comprise one of three different
 * types of library details: expression vector, guide, or reporter. Exactly one of these three
 * types of library details must exist in the library object. We still check all three types in
 * case the data is malformed.
 */
function LibraryDetails({ library, clonedGenes, children }) {
  if (library.expression_vector_library_details) {
    return (
      <ExpressionVector clonedGenes={clonedGenes}>{children}</ExpressionVector>
    );
  }
  if (library.guide_library_details) {
    return (
      <Guide guideLibraryDetails={library.guide_library_details}>
        {children}
      </Guide>
    );
  }
  if (library.reporter_library_details) {
    return (
      <Reporter reporterLibraryDetails={library.reporter_library_details}>
        {children}
      </Reporter>
    );
  }
  return null;
}

LibraryDetails.propTypes = {
  // Library object to display
  library: PropTypes.object.isRequired,
  // Cloned genes to display for expression vector libraries
  clonedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

// Maximum number of targeted genes and targeted loci to display before we make the lists
// expandable.
const MAX_TRUNCATED_TARGETED_GENES = 3;
const MAX_TRUNCATED_TARGETED_LOCI = 3;

export default function ConstructLibrary({
  constructLibrary,
  documents,
  files,
  integratedContentFiles,
  clonedGenes,
  targetedGenes,
  associatedDiseases,
  sequencingPlatforms,
  attribution = null,
  isJson,
}) {
  // Handles the targeted genes expandable states.
  const [isTargetedGenesExpanded, setIsTargetedGenesExpanded] = useState(false);
  const isTargetedGenesExpandable =
    targetedGenes.length > MAX_TRUNCATED_TARGETED_GENES;
  const isTargetedGenesTruncated =
    isTargetedGenesExpandable && !isTargetedGenesExpanded;
  const displayableTargetedGeneList = isTargetedGenesTruncated
    ? targetedGenes.slice(0, MAX_TRUNCATED_TARGETED_GENES)
    : targetedGenes;

  // Handles the targeted loci expandable states.
  const [isTargetedLociExpanded, setIsTargetedLociExpanded] = useState(false);
  const targetedLoci = constructLibrary.targeted_loci || [];
  const isTargetedLociExpandable =
    targetedLoci.length > MAX_TRUNCATED_TARGETED_LOCI;
  const isTargetedLociTruncated =
    isTargetedLociExpandable && !isTargetedLociExpanded;
  const displayableTargetedLoci = isTargetedLociTruncated
    ? targetedLoci.slice(0, MAX_TRUNCATED_TARGETED_LOCI)
    : targetedLoci;

  return (
    <>
      <Breadcrumbs />
      <EditableItem item={constructLibrary}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={constructLibrary.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={constructLibrary} isJsonFormat={isJson} />
        <JsonDisplay item={constructLibrary} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              {constructLibrary.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{constructLibrary.description}</DataItemValue>
                </>
              )}
              {constructLibrary.product_id && (
                <>
                  <DataItemLabel>Product ID</DataItemLabel>
                  <DataItemValue>{constructLibrary.product_id}</DataItemValue>
                </>
              )}
              {constructLibrary.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={constructLibrary.aliases} />
                  </DataItemValue>
                </>
              )}
              {constructLibrary.publication_identifiers && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={constructLibrary.publication_identifiers}
                    />
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>Summary</DataItemLabel>
              <DataItemValue>{constructLibrary.summary}</DataItemValue>
            </DataArea>
          </DataPanel>
          <LibraryDetails library={constructLibrary} clonedGenes={clonedGenes}>
            <DataItemLabel>Scope</DataItemLabel>
            <DataItemValue>{constructLibrary.scope}</DataItemValue>
            <DataItemLabel>Selection Criteria</DataItemLabel>
            <DataItemValue>
              {constructLibrary.selection_criteria.join(", ")}
            </DataItemValue>
            {associatedDiseases.length > 0 && (
              <>
                <DataItemLabel>Associated Diseases</DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {associatedDiseases.map((disease) => (
                      <Link href={disease["@id"]} key={disease["@id"]}>
                        {disease.term_name}
                      </Link>
                    ))}
                  </SeparatedList>
                </DataItemValue>
              </>
            )}
            {displayableTargetedLoci.length > 0 && (
              <>
                <DataItemLabel className="flex items-baseline">
                  Targeted Loci
                  <DataItemValueExpandButton
                    isExpandable={isTargetedLociExpandable}
                    isExpanded={isTargetedLociExpanded}
                    onClick={setIsTargetedLociExpanded}
                  />
                </DataItemLabel>
                <DataItemValue>
                  <ChromosomeLocations locations={displayableTargetedLoci} />
                  {isTargetedLociTruncated && (
                    <div className="flex items-center h-6">
                      <Icon.EllipsisHorizontal className="h-1 ml-1" />
                    </div>
                  )}
                </DataItemValue>
              </>
            )}
            {displayableTargetedGeneList.length > 0 && (
              <>
                <DataItemLabel className="flex items-baseline">
                  Targeted Genes
                  <DataItemValueExpandButton
                    isExpandable={isTargetedGenesExpandable}
                    isExpanded={isTargetedGenesExpanded}
                    onClick={setIsTargetedGenesExpanded}
                  />
                </DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {displayableTargetedGeneList.map((gene) => (
                      <Link href={gene["@id"]} key={gene["@id"]}>
                        {gene.geneid}
                      </Link>
                    ))}
                  </SeparatedList>
                  {isTargetedGenesTruncated && (
                    <Icon.EllipsisHorizontal className="h-1 mt-2" />
                  )}
                </DataItemValue>
              </>
            )}
          </LibraryDetails>
          {files.length > 0 && (
            <>
              <DataAreaTitle>Sequencing Results</DataAreaTitle>
              <SequencingFileTable
                files={files}
                sequencingPlatforms={sequencingPlatforms}
              />
            </>
          )}
          {integratedContentFiles.length > 0 && (
            <>
              <DataAreaTitle>Integrated Content Files</DataAreaTitle>
              <FileTable files={integratedContentFiles} />
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

ConstructLibrary.propTypes = {
  // Construct library object this page displays
  constructLibrary: PropTypes.object.isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Integrated content file objects
  integratedContentFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this construct library
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // cloned_genes objects
  clonedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Targeted gene objects
  targetedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Associated disease objects
  associatedDiseases: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  const constructLibrary = await request.getObject(
    `/construct-libraries/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(constructLibrary)) {
    const documents = constructLibrary.documents
      ? await requestDocuments(constructLibrary.documents, request)
      : [];
    const filePaths = constructLibrary.files.map((file) => file["@id"]);

    // Request files and their sequencing platforms.
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

    const integratedContentFiles = constructLibrary.integrated_content_files
      ? await requestFiles(constructLibrary.integrated_content_files, request)
      : [];
    let clonedGenes = [];
    if (constructLibrary.expression_vector_library_details) {
      clonedGenes = await requestGenes(
        constructLibrary.expression_vector_library_details.cloned_genes,
        request
      );
    }
    let associatedDiseases = [];
    if (constructLibrary.associated_diseases) {
      associatedDiseases = await requestOntologyTerms(
        constructLibrary.associated_diseases,
        request
      );
    }
    let targetedGenes = [];
    if (constructLibrary.targeted_genes) {
      targetedGenes = await requestGenes(
        constructLibrary.targeted_genes,
        request
      );
    }
    const breadcrumbs = await buildBreadcrumbs(
      constructLibrary,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      constructLibrary,
      req.headers.cookie
    );
    return {
      props: {
        constructLibrary,
        documents,
        files,
        integratedContentFiles,
        clonedGenes,
        targetedGenes,
        associatedDiseases,
        sequencingPlatforms,
        pageContext: { title: constructLibrary.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(constructLibrary);
}

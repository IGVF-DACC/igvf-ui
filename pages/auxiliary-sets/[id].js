// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileSetDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import SequencingFileTable from "../../components/sequencing-file-table";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestFiles,
  requestFileSets,
  requestOntologyTerms,
  requestSeqspecFiles,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { splitIlluminaSequenceFiles } from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function AuxiliarySet({
  auxiliarySet,
  documents,
  libraryConstructionPlatform = null,
  files,
  relatedDatasets,
  seqspecFiles,
  sequencingPlatforms,
  controlForSets,
  attribution = null,
  isJson,
}) {
  const { filesWithReadType, filesWithoutReadType } =
    splitIlluminaSequenceFiles(files);

  return (
    <>
      <Breadcrumbs />
      <EditableItem item={auxiliarySet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={auxiliarySet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={auxiliarySet} isJsonFormat={isJson} />
        <JsonDisplay item={auxiliarySet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileSetDataItems item={auxiliarySet}>
                {libraryConstructionPlatform && (
                  <>
                    <DataItemLabel>Library Construction Platform</DataItemLabel>
                    <DataItemValue>
                      <Link href={libraryConstructionPlatform["@id"]}>
                        {libraryConstructionPlatform.term_name}
                      </Link>
                    </DataItemValue>
                  </>
                )}
              </FileSetDataItems>
            </DataArea>
          </DataPanel>
          {filesWithReadType.length > 0 && (
            <SequencingFileTable
              files={filesWithReadType}
              title="Sequencing Results (Illumina)"
              isIlluminaReadType={true}
              itemPath={auxiliarySet["@id"]}
              seqspecFiles={seqspecFiles}
              sequencingPlatforms={sequencingPlatforms}
              hasReadType
            />
          )}
          {filesWithoutReadType.length > 0 && (
            <SequencingFileTable
              files={filesWithoutReadType}
              title="Sequencing Results"
              isIlluminaReadType={false}
              itemPath={auxiliarySet["@id"]}
              seqspecFiles={seqspecFiles}
              sequencingPlatforms={sequencingPlatforms}
            />
          )}
          {relatedDatasets.length > 0 && (
            <FileSetTable
              fileSets={relatedDatasets}
              title="Related Measurement Sets"
              reportLinkSpecs={{
                fileSetType: "MeasurementSet",
                identifierProp: "auxiliary_sets.accession",
                itemIdentifier: auxiliarySet.accession,
              }}
            />
          )}
          {controlForSets.length > 0 && (
            <FileSetTable
              fileSets={controlForSets}
              title="File Sets This Auxiliary Set Serves as a Control For"
              reportLinkSpecs={{
                fileSetType: "FileSet",
                identifierProp: "control_file_sets.accession",
                itemIdentifier: auxiliarySet.accession,
              }}
            />
          )}
          {auxiliarySet.samples?.length > 0 && (
            <SampleTable
              samples={auxiliarySet.samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${auxiliarySet["@id"]}`}
            />
          )}
          {auxiliarySet.donors?.length > 0 && (
            <DonorTable donors={auxiliarySet.donors} />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}

          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

AuxiliarySet.propTypes = {
  // Auxiliary set to display
  auxiliarySet: PropTypes.object.isRequired,
  // Library construction platform object
  libraryConstructionPlatform: PropTypes.object,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Related Datasets to display
  relatedDatasets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // seqspec files associated with `files`
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sequencing platform objects associated with `files`
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets controlled by this file set
  controlForSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this measurement set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this measurement set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const auxiliarySet = (
    await request.getObject(`/auxiliary-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(auxiliarySet)) {
    const documents = auxiliarySet.documents
      ? await requestDocuments(auxiliarySet.documents, request)
      : [];

    const libraryConstructionPlatform =
      auxiliarySet.library_construction_platform
        ? (
            await request.getObject(auxiliarySet.library_construction_platform)
          ).optional()
        : null;

    let files = [];
    if (auxiliarySet.files.length > 0) {
      const filePaths = auxiliarySet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }

    let relatedDatasets = [];
    if (auxiliarySet.measurement_sets?.length > 0) {
      const datasetPaths =
        auxiliarySet.measurement_sets.map((dataset) => dataset["@id"]) || [];
      relatedDatasets = await requestFileSets(datasetPaths, request);
    }

    const sequencingPlatformPaths = files
      .map((file) => file.sequencing_platform)
      .filter((sequencingPlatform) => sequencingPlatform);
    const uniqueSequencingPlatformPaths = [...new Set(sequencingPlatformPaths)];
    const sequencingPlatforms =
      uniqueSequencingPlatformPaths.length > 0
        ? await requestOntologyTerms(uniqueSequencingPlatformPaths, request)
        : [];

    const seqspecFiles =
      files.length > 0 ? await requestSeqspecFiles(files, request) : [];

    let controlForSets = [];
    if (auxiliarySet.control_for.length > 0) {
      const controlForPaths = auxiliarySet.control_for.map(
        (controlFor) => controlFor["@id"]
      );
      controlForSets = await requestFileSets(controlForPaths, request);
    }

    const breadcrumbs = await buildBreadcrumbs(
      auxiliarySet,
      auxiliarySet.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      auxiliarySet,
      req.headers.cookie
    );
    return {
      props: {
        auxiliarySet,
        documents,
        libraryConstructionPlatform,
        files,
        relatedDatasets,
        seqspecFiles,
        sequencingPlatforms,
        controlForSets,
        pageContext: { title: auxiliarySet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(auxiliarySet);
}

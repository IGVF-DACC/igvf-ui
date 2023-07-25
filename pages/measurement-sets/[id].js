// node_modules
import Link from "next/link";
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
import { DataGridContainer } from "../../components/data-grid";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileAccessionAndDownload } from "../../components/file-download";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SortableGrid from "../../components/sortable-grid";
import Status from "../../components/status";
// lib
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import SeparatedList from "../../components/separated-list";

/**
 * Columns for the two file tables; both those with `illumina_read_type` (meta.hasReadType is true)
 * and those without.
 */
const filesColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => <FileAccessionAndDownload file={source} />,
  },
  {
    id: "file_format",
    title: "File Format",
  },
  {
    id: "content_type",
    title: "Content Type",
  },
  {
    id: "illumina_read_type",
    title: "Illumina Read Type",
    hide: (data, columns, meta) => !meta.hasReadType,
  },
  {
    id: "sequencing_run",
    title: "Sequencing Run",
  },
  {
    id: "sequencing_platform",
    title: "Sequencing Platform",
    display: (cell, meta) => {
      const platform = meta.sequencingPlatforms.find(
        (platform) => platform["@id"] === cell.source.sequencing_platform
      );
      return platform?.term_name || null;
    },
  },
  {
    id: "flowcell_id",
    title: "Flowcell ID",
  },
  {
    id: "lane",
    title: "Lane",
  },
  {
    id: "file_size",
    title: "File Size",
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title,
  },
  {
    id: "status",
    title: "Status",
    display: ({ source }) => <Status status={source.status} />,
  },
];

/**
 * Display a sortable table of the given files, specifically for the MeasurementSet display.
 */
function MeasurementSetFileTable({
  files,
  sequencingPlatforms,
  hasReadType = false,
}) {
  return (
    <DataGridContainer>
      <SortableGrid
        data={files}
        columns={filesColumns}
        meta={{ sequencingPlatforms, hasReadType }}
        keyProp="@id"
      />
    </DataGridContainer>
  );
}

MeasurementSetFileTable.propTypes = {
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sequencing platform objects associated with `files`
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
  // True if files have illumina_read_type
  hasReadType: PropTypes.bool,
};

export default function MeasurementSet({
  measurementSet,
  assayTerm = null,
  documents,
  donors,
  files,
  sequencingPlatforms,
  attribution = null,
  isJson,
}) {
  // Split files array into two arrays: those with illumina_read_type and those without.
  const [filesWithReadType, filesWithoutReadType] = files.reduce(
    (acc, file) => {
      if (file.illumina_read_type) {
        acc[0].push(file);
      } else {
        acc[1].push(file);
      }
      return acc;
    },
    [[], []]
  );

  return (
    <>
      <Breadcrumbs />
      <EditableItem item={measurementSet}>
        <PagePreamble />
        <ObjectPageHeader item={measurementSet} isJsonFormat={isJson} />
        <JsonDisplay item={measurementSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Assay Term</DataItemLabel>
              {assayTerm && (
                <DataItemValue>
                  <Link href={assayTerm["@id"]}>{assayTerm.term_name}</Link>
                </DataItemValue>
              )}
              {measurementSet.protocol && (
                <>
                  <DataItemLabel>Protocol</DataItemLabel>
                  <DataItemValue>
                    <Link
                      href={measurementSet.protocol}
                      key={measurementSet.protocol}
                    >
                      {measurementSet.protocol}
                    </Link>
                  </DataItemValue>
                </>
              )}
              {measurementSet.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={measurementSet.aliases} />
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
              {measurementSet.samples?.length > 0 && (
                <>
                  <DataItemLabel>Samples</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {measurementSet.samples.map((sample) => (
                        <Link href={sample["@id"]} key={sample["@id"]}>
                          {sample.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {filesWithReadType.length > 0 && (
            <>
              <DataAreaTitle>Sequencing Results (Illumina)</DataAreaTitle>
              <MeasurementSetFileTable
                files={filesWithReadType}
                sequencingPlatforms={sequencingPlatforms}
                hasReadType
              />
            </>
          )}
          {filesWithoutReadType.length > 0 && (
            <>
              <DataAreaTitle>Sequencing Results</DataAreaTitle>
              <MeasurementSetFileTable
                files={filesWithoutReadType}
                sequencingPlatforms={sequencingPlatforms}
              />
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

MeasurementSet.propTypes = {
  // Measurement set to display
  measurementSet: PropTypes.object.isRequired,
  // Assay term of the measurement set
  assayTerm: PropTypes.object,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sequencing platform objects associated with `files`
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  const measurementSet = await request.getObject(
    `/measurement-sets/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(measurementSet)) {
    const assayTerm = await request.getObject(
      measurementSet.assay_term["@id"],
      null
    );
    const documents = measurementSet.documents
      ? await request.getMultipleObjects(measurementSet.documents, null, {
          filterErrors: true,
        })
      : [];
    let donors = [];
    if (measurementSet.donors) {
      const donorPaths = measurementSet.donors.map((donor) => donor["@id"]);
      donors = await request.getMultipleObjects(donorPaths, null, {
        filterErrors: true,
      });
    }
    const filePaths = measurementSet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0
        ? await request.getMultipleObjects(filePaths, null, {
            filterErrors: true,
          })
        : [];

    // Use the files to retrieve all the sequencing platform objects they link to.
    const sequencingPlatformPaths = files
      .map((file) => file.sequencing_platform)
      .filter((sequencingPlatform) => sequencingPlatform);
    const uniqueSequencingPlatformPaths = [...new Set(sequencingPlatformPaths)];
    const sequencingPlatforms =
      uniqueSequencingPlatformPaths.length > 0
        ? await request.getMultipleObjects(
            uniqueSequencingPlatformPaths,
            null,
            { filterErrors: true }
          )
        : [];

    const breadcrumbs = await buildBreadcrumbs(
      measurementSet,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      measurementSet,
      req.headers.cookie
    );
    return {
      props: {
        measurementSet,
        assayTerm,
        documents,
        donors,
        files,
        sequencingPlatforms,
        pageContext: { title: measurementSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(measurementSet);
}

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
import SortableGrid from "../../components/sortable-grid";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestDonors,
  requestFileSets,
  requestFiles,
  requestMeasurementSets,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { pathToType } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

const fileSetColumns = [
  {
    id: "sample-summary",
    title: "Sample Summary",
    display: ({ source }) =>
      source.samples.map((sample) => sample.summary).join(", "),
  },
  {
    id: "summary",
    title: "Summary",
    sorter: (item) => item.summary.toLowerCase(),
  },
  {
    id: "controls-accession",
    title: "Controls",
    display: ({ source }) => {
      if (source.control_file_sets?.length > 0) {
        return (
          <SeparatedList>
            {source.control_file_sets.map((controlSet) => (
              <Link href={controlSet["@id"]} key={controlSet.accession}>
                {controlSet.accession}
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
  },
  {
    id: "auxiliary-sets",
    title: "Auxiliary Sets",
    display: ({ source }) => {
      if (source.auxiliary_sets?.length > 0) {
        return (
          <SeparatedList>
            {source.auxiliary_sets.map((auxSet) => (
              <Link href={auxSet["@id"]} key={auxSet.accession}>
                {auxSet.accession}
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
  },
  {
    id: "construct-library-sets",
    title: "Construct Library Sets",
    display: ({ source }) => {
      if (source.samples?.length > 0) {
        const constructLibrarySets = source.samples.reduce((acc, sample) => {
          if (sample.construct_library_sets?.length > 0) {
            return acc.concat(sample.construct_library_sets);
          }
          return acc;
        }, []);
        return (
          <SeparatedList>
            {constructLibrarySets.map((cls) => (
              <Link href={cls["@id"]} key={cls.accession} title={cls.summary}>
                {cls.accession}
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
  },
];

function TableOne({ fileSets }) {
  return (
    <>
      <DataAreaTitle>Measurement Sets</DataAreaTitle>
      <SortableGrid
        data={fileSets}
        columns={fileSetColumns}
        keyProp="@id"
        pager={{}}
      />
    </>
  );
}

TableOne.propTypes = {
  // File sets to display
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function AnalysisSet({
  analysisSet,
  documents,
  donors,
  files,
  measurementSets,
  auxiliarySets,
  constructLibrarySets,
  attribution = null,
  isJson,
}) {
  console.log("MEASUREMENT SETS", measurementSets);

  return (
    <>
      <Breadcrumbs />
      <EditableItem item={analysisSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={analysisSet.alternate_accessions}
          />
        </PagePreamble>
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
              <DataItemLabel>File Set Type</DataItemLabel>
              <DataItemValue>{analysisSet.file_set_type}</DataItemValue>
              {analysisSet.publication_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={analysisSet.publication_identifiers}
                      isCollapsible
                    />
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
              {analysisSet.samples?.length > 0 && (
                <>
                  <DataItemLabel>Samples</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {analysisSet.samples.map((sample) => (
                        <Link href={sample["@id"]} key={sample["@id"]}>
                          {sample.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {analysisSet.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{analysisSet.submitter_comment}</DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>

          {measurementSets.length > 0 && (
            <TableOne fileSets={measurementSets} />
          )}

          {auxiliarySets.length > 0 && (
            <FileSetTable fileSets={auxiliarySets} title="Auxiliary Sets" />
          )}

          {constructLibrarySets.length > 0 && (
            <FileSetTable
              fileSets={constructLibrarySets}
              title="Construct Library Sets"
            />
          )}

          {files.length > 0 && (
            <FileTable files={files} itemPath={analysisSet["@id"]} />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
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
  // Input file sets to display
  measurementSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // AuxiliarySets to display
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // ConstructLibrarySets to display
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this analysis set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this analysis set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisSet = (
    await request.getObject(`/analysis-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(analysisSet)) {
    const documents = analysisSet.documents
      ? await requestDocuments(analysisSet.documents, request)
      : [];

    const filePaths = analysisSet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    let donors = [];
    if (analysisSet.donors) {
      const donorPaths = analysisSet.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }

    let measurementSets = [];
    if (analysisSet.input_file_sets?.length > 0) {
      // Filter for measurement sets and request them.
      const measurementSetPaths = analysisSet.input_file_sets
        .filter((fileSet) => pathToType(fileSet["@id"]) === "measurement-sets")
        .map((fileSet) => fileSet["@id"]);
      const uniqueMeasurementSetPaths = Array.from(
        new Set(measurementSetPaths)
      );
      measurementSets = await requestMeasurementSets(
        uniqueMeasurementSetPaths,
        request
      );
    }

    let auxiliarySets = [];
    if (measurementSets.length > 0) {
      const auxiliarySetsPaths = measurementSets.reduce((acc, ms) => {
        if (ms.auxiliary_sets?.length > 0) {
          return acc.concat(ms.auxiliary_sets.map((aux) => aux["@id"]));
        }
        return acc;
      }, []);
      auxiliarySets =
        auxiliarySetsPaths.length > 0
          ? await requestFileSets(auxiliarySetsPaths, request)
          : [];
    }

    const samples = measurementSets.reduce((acc, ms) => {
      if (ms.samples?.length > 0) {
        return acc.concat(ms.samples);
      }
      return acc;
    }, []);

    let constructLibrarySets = [];
    if (samples.length > 0) {
      constructLibrarySets = samples.reduce((acc, sample) => {
        if (sample.construct_library_sets?.length > 0) {
          return acc.concat(sample.construct_library_sets);
        }
        return acc;
      }, []);

      if (constructLibrarySets.length > 0) {
        const constructLibrarySetPaths = constructLibrarySets.map(
          (cls) => cls["@id"]
        );
        constructLibrarySets = await requestFileSets(
          constructLibrarySetPaths,
          request
        );
      }
    }

    const breadcrumbs = await buildBreadcrumbs(
      analysisSet,
      analysisSet.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(analysisSet, req.headers.cookie);
    return {
      props: {
        analysisSet,
        documents,
        donors,
        files,
        measurementSets,
        auxiliarySets,
        constructLibrarySets,
        pageContext: { title: analysisSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}

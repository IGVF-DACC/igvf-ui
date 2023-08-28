// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import AliasList from "../../components/alias-list";
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
  requestDonors,
  requestFiles,
  requestOntologyTerms,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { splitIlluminaSequenceFiles } from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

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
  const { filesWithReadType, filesWithoutReadType } =
    splitIlluminaSequenceFiles(files);

  return (
    <>
      <Breadcrumbs />
      <EditableItem item={measurementSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={measurementSet.alternate_accessions}
          />
        </PagePreamble>
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
              {measurementSet.publication_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={measurementSet.publication_identifiers}
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
              <SequencingFileTable
                files={filesWithReadType}
                sequencingPlatforms={sequencingPlatforms}
                hasReadType
              />
            </>
          )}
          {filesWithoutReadType.length > 0 && (
            <>
              <DataAreaTitle>Sequencing Results</DataAreaTitle>
              <SequencingFileTable
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
      ? await requestDocuments(measurementSet.documents, request)
      : [];
    let donors = [];
    if (measurementSet.donors) {
      const donorPaths = measurementSet.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }
    let files = [];
    if (measurementSet.files.length > 0) {
      const filePaths = measurementSet.files.map((file) => file["@id"]) || [];
      files = await requestFiles(filePaths, request);
    }

    // Use the files to retrieve all the sequencing platform objects they link to.
    const sequencingPlatformPaths = files
      .map((file) => file.sequencing_platform)
      .filter((sequencingPlatform) => sequencingPlatform);
    const uniqueSequencingPlatformPaths = [...new Set(sequencingPlatformPaths)];
    const sequencingPlatforms =
      uniqueSequencingPlatformPaths.length > 0
        ? await requestOntologyTerms(uniqueSequencingPlatformPaths, request)
        : [];

    const breadcrumbs = await buildBreadcrumbs(
      measurementSet,
      measurementSet.accession,
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

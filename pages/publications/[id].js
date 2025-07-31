// node_modules
import PropTypes from "prop-types";
// components
import AttachmentThumbnail from "../../components/attachment-thumbnail";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentAttachmentLink from "../../components/document-link";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { PublicationCitation } from "../../components/publication";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import SoftwareTable from "../../components/software-table";
import SoftwareVersionTable from "../../components/software-version-table";
import { StatusPreviewDetail } from "../../components/status";
import WorkflowTable from "../../components/workflow-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDonors,
  requestFileSets,
  requestSamples,
  requestSoftware,
  requestSoftwareVersions,
  requestWorkflows,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truncateText } from "../../lib/general";
import { checkPublicationCitationVisible } from "../../lib/publication";
import { isJsonFormat } from "../../lib/query-utils";

export default function Publication({
  publication,
  samples,
  donors,
  fileSets,
  workflows,
  software,
  softwareVersions,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs
        item={publication}
        title={truncateText(publication.title, 40)}
      />
      <EditableItem item={publication}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={publication} isJsonFormat={isJson} />
        <JsonDisplay item={publication} isJsonFormat={isJson}>
          <StatusPreviewDetail item={publication} />
          <DataPanel>
            <DataArea>
              <DataItemLabel>Title</DataItemLabel>
              <DataItemValue>{publication.title}</DataItemValue>
              {publication.authors && (
                <>
                  <DataItemLabel>Authors</DataItemLabel>
                  <DataItemValue>{publication.authors}</DataItemValue>
                </>
              )}
              {checkPublicationCitationVisible(publication) && (
                <>
                  <DataItemLabel>Citation</DataItemLabel>
                  <DataItemValue>
                    <PublicationCitation publication={publication} />
                  </DataItemValue>
                </>
              )}
              {publication.abstract && (
                <>
                  <DataItemLabel>Abstract</DataItemLabel>
                  <DataItemValue>{publication.abstract}</DataItemValue>
                </>
              )}
              <DataItemLabel>Publication Identifiers</DataItemLabel>
              <DataItemValue>
                <DbxrefList dbxrefs={publication.publication_identifiers} />
              </DataItemValue>
              {publication.attachment && (
                <>
                  <DataItemLabel>Download</DataItemLabel>
                  <DataItemValue>
                    <DocumentAttachmentLink document={publication} />
                  </DataItemValue>
                  <DataItemLabel>Thumbnail</DataItemLabel>
                  <DataItemValue>
                    <div className="flex w-28 items-center justify-center border p-1.5">
                      <AttachmentThumbnail
                        attachment={publication.attachment}
                        ownerPath={publication["@id"]}
                        alt={publication.title}
                      />
                    </div>
                  </DataItemValue>
                </>
              )}
              {publication.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{publication.submitter_comment}</DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {samples.length > 0 && (
            <SampleTable
              samples={samples}
              reportLink={`/multireport/?type=Sample&publications.@id=${publication["@id"]}`}
              reportLabel="Report of samples in this publication"
            />
          )}
          {donors.length > 0 && (
            <DonorTable
              reportLink={`/multireport/?type=Donor&publications.@id=${publication["@id"]}`}
              reportLabel="Report of donors with this publication"
              donors={donors}
            />
          )}
          {fileSets.length > 0 && (
            <FileSetTable
              fileSets={fileSets}
              reportLink={`/multireport/?type=FileSet&publications.@id=${publication["@id"]}`}
              reportLabel="Report of file sets with this publication"
            />
          )}
          {workflows.length > 0 && (
            <WorkflowTable
              workflows={workflows}
              reportLink={`/multireport/?type=Workflow&publications.@id=${publication["@id"]}`}
              reportLabel="Report of workflows with this publication"
            />
          )}
          {software.length > 0 && (
            <SoftwareTable
              software={software}
              reportLink={`/multireport/?type=Software&publications.@id=${publication["@id"]}`}
              reportLabel="Report of software with this publication"
            />
          )}
          {softwareVersions.length > 0 && (
            <SoftwareVersionTable
              versions={softwareVersions}
              reportLink={`/multireport/?type=SoftwareVersion&publications.@id=${publication["@id"]}`}
              reportLabel="Report of software versions with this publication"
            />
          )}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Publication.propTypes = {
  // Publication object to display
  publication: PropTypes.object.isRequired,
  // Samples for this publication
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Donors for this publication
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // File sets for this publication
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Workflows for this publication
  workflows: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Software for this publication
  software: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Software versions for this publication
  softwareVersions: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this publication
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const publication = (
    await request.getObject(`/publications/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(publication)) {
    const samples =
      publication.samples?.length > 0
        ? await requestSamples(publication.samples, request)
        : [];
    const donors =
      publication.donors?.length > 0
        ? await requestDonors(publication.donors, request)
        : [];
    const fileSets =
      publication.file_sets?.length > 0
        ? await requestFileSets(publication.file_sets, request)
        : [];
    const workflows =
      publication.workflows?.length > 0
        ? await requestWorkflows(publication.workflows, request)
        : [];
    const software =
      publication.software?.length > 0
        ? await requestSoftware(publication.software, request)
        : [];
    const softwareVersions =
      publication.software_versions?.length > 0
        ? await requestSoftwareVersions(publication.software_versions, request)
        : [];
    const attribution = await buildAttribution(publication, req.headers.cookie);
    return {
      props: {
        publication,
        samples,
        donors,
        fileSets,
        workflows,
        software,
        softwareVersions,
        pageContext: { title: publication.title },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(publication);
}

// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { useSecDir } from "../../components/section-directory";
import SeparatedList from "../../components/separated-list";
// lib
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import { isJsonFormat } from "../../lib/query-utils";

export default function AnalysisStepVersion({
  analysisStepVersion,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir();

  return (
    <>
      <Breadcrumbs item={analysisStepVersion} />
      <EditableItem item={analysisStepVersion}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={analysisStepVersion} isJsonFormat={isJson} />
        <JsonDisplay item={analysisStepVersion} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              {analysisStepVersion.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>
                    {analysisStepVersion.description}
                  </DataItemValue>
                </>
              )}
              {analysisStepVersion.analysis_step && (
                <>
                  <DataItemLabel>Analysis Step</DataItemLabel>
                  <DataItemValue>
                    {
                      <Link
                        key={analysisStepVersion.analysis_step["@id"]}
                        href={analysisStepVersion.analysis_step["@id"]}
                      >
                        {analysisStepVersion.analysis_step.name}
                      </Link>
                    }
                  </DataItemValue>
                </>
              )}
              {analysisStepVersion.software_versions && (
                <>
                  <DataItemLabel>Software Versions</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {analysisStepVersion.software_versions.map((version) => (
                        <Link key={version["@id"]} href={version["@id"]}>
                          {version.name}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {analysisStepVersion.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={analysisStepVersion.aliases} />
                  </DataItemValue>
                </>
              )}
              {analysisStepVersion.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>
                    {analysisStepVersion.submitter_comment}
                  </DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

AnalysisStepVersion.propTypes = {
  // Analysis Step Versions object to display
  analysisStepVersion: PropTypes.object.isRequired,
  // Attribution for this analysis step
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisStepVersion = (
    await request.getObject(`/analysis-step-versions/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(analysisStepVersion)) {
    const attribution = await buildAttribution(
      analysisStepVersion,
      req.headers.cookie
    );
    return {
      props: {
        analysisStepVersion,
        pageContext: {
          title: `${analysisStepVersion.analysis_step.title} Version`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisStepVersion);
}

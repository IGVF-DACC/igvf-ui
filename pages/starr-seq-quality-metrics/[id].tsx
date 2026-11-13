// node_modules
import _ from "lodash";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { DataArea, DataPanel } from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { QualityMetricSummaryPanel } from "../../components/quality-metric";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import { requestFiles } from "../../lib/common-requests";
import { pathsFromDatabaseObjects } from "../../lib/database-object";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { type PageProps } from "../../lib/next-js";
import { extractSchema } from "../../lib/profiles";
import {
  filterQualityMetricSchemaSummaryProps,
  isQualityMetricSchema,
  qualityMetricFallbackSchema,
  qualityMetricTitle,
  type QualityMetricProperties,
  type QualityMetricSchema,
  type StarrSeqQualityMetricObject,
} from "../../lib/quality-metric";
import { isJsonFormat } from "../../lib/query-utils";
import { retrieveProfiles } from "../../lib/server-objects";
// root
import type { FileObject } from "../../globals";

interface StarrSeqQualityMetricPageProps extends PageProps {
  qualityMetric: StarrSeqQualityMetricObject;
  qualityMetricOf: FileObject[];
  schemaProps: QualityMetricProperties;
}

export default function StarrSeqQualityMetric({
  qualityMetric,
  qualityMetricOf,
  schemaProps,
  isJson,
}: StarrSeqQualityMetricPageProps) {
  const sections = useSecDir({ isJson });

  const displayedSchema = filterQualityMetricSchemaSummaryProps(schemaProps);

  return (
    <>
      <Breadcrumbs item={qualityMetric} />
      <EditableItem item={qualityMetric}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={qualityMetric} isJsonFormat={isJson} />
        <JsonDisplay item={qualityMetric} isJsonFormat={isJson}>
          <StatusPreviewDetail item={qualityMetric} />
          <DataPanel>
            <DataArea>
              <QualityMetricSummaryPanel
                qualityMetric={qualityMetric}
                schemaProps={displayedSchema}
              />
            </DataArea>
          </DataPanel>

          <FileTable
            files={qualityMetricOf}
            title="Files This Quality Metric Applies To"
            reportLink={`/multireport/?type=File&quality_metrics=${qualityMetric["@id"]}`}
            reportLabel="File with this quality metric"
            isDeletedVisible
            panelId="quality-metric-of"
          />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

export async function getServerSideProps({
  params,
  req,
  query,
}: GetServerSidePropsContext<{ id: string }>): Promise<
  GetServerSidePropsResult<StarrSeqQualityMetricPageProps>
> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const qualityMetric = (
    await request.getObject<StarrSeqQualityMetricObject>(
      `/starr-seq-quality-metrics/${params.id}/`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(qualityMetric)) {
    const qualityMetricOf =
      qualityMetric.quality_metric_of?.length > 0
        ? await requestFiles(
            pathsFromDatabaseObjects(qualityMetric.quality_metric_of),
            request
          )
        : [];

    // Get the schema for the Starr-Seq quality metric, using the cached profiles if possible.
    const profiles = await retrieveProfiles(req.headers.cookie ?? "");
    const extractedSchema = extractSchema(profiles, "StarrSeqQualityMetric");
    const schema: QualityMetricSchema =
      extractedSchema && isQualityMetricSchema(extractedSchema)
        ? extractedSchema
        : qualityMetricFallbackSchema;

    return {
      props: {
        qualityMetric,
        qualityMetricOf,
        schemaProps: schema?.properties ?? null,
        pageContext: {
          title: qualityMetricTitle(qualityMetric),
        },
        isJson,
      },
    };
  }
  return errorObjectToProps(qualityMetric);
}

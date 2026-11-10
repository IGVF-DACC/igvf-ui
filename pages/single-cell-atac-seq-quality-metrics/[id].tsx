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
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import { requestFiles } from "../../lib/common-requests";
import { pathsFromDatabaseObjects } from "../../lib/database-object";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { type PageProps } from "../../lib/next-js";
import { extractSchema } from "../../lib/profiles";
import {
  qualityMetricTitle,
  filterQualityMetricSchemaSummaryProps,
  isQualityMetricSchema,
  qualityMetricFallbackSchema,
  type QualityMetricProperties,
  type QualityMetricSchema,
  type SingleCellAtacSeqQualityMetricObject,
} from "../../lib/quality-metric";
import { isJsonFormat } from "../../lib/query-utils";
import { retrieveProfiles } from "../../lib/server-objects";
// root
import type { FileObject } from "../../globals";

interface SingleCellAtacSeqQualityMetricPageProps extends PageProps {
  qualityMetric: SingleCellAtacSeqQualityMetricObject;
  qualityMetricOf: FileObject[];
  schemaProps: QualityMetricProperties;
}

export default function SingleCellAtacSeqQualityMetric({
  qualityMetric,
  qualityMetricOf,
  schemaProps,
  isJson,
}: SingleCellAtacSeqQualityMetricPageProps) {
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
  resolvedUrl,
}: GetServerSidePropsContext<{ id: string }>): Promise<
  GetServerSidePropsResult<SingleCellAtacSeqQualityMetricPageProps>
> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const qualityMetric = (
    await request.getObject<SingleCellAtacSeqQualityMetricObject>(
      `/single-cell-atac-seq-quality-metrics/${params.id}/`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(qualityMetric)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      qualityMetric,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const qualityMetricOf =
      qualityMetric.quality_metric_of?.length > 0
        ? await requestFiles(
            pathsFromDatabaseObjects(qualityMetric.quality_metric_of),
            request
          )
        : [];

    // Get the schema for the single-cell ATAC-Seq quality metric, using the cached profiles if
    // possible. Use the fallback schema if the specific schema is not available (should be a rare
    // case).
    const profiles = await retrieveProfiles(req.headers.cookie ?? "");
    const extractedSchema = extractSchema(
      profiles,
      "SingleCellAtacSeqQualityMetric"
    );
    const schema: QualityMetricSchema =
      extractedSchema && isQualityMetricSchema(extractedSchema)
        ? extractedSchema
        : qualityMetricFallbackSchema;

    return {
      props: {
        qualityMetric,
        qualityMetricOf,
        schemaProps: schema.properties,
        pageContext: {
          title: qualityMetricTitle(qualityMetric),
        },
        isJson,
      },
    };
  }
  return errorObjectToProps(qualityMetric);
}

// node_modules
import _ from "lodash";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { DataArea, DataPanel } from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { QualityMetricField } from "../../components/quality-metric";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import { requestFiles } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  singleCellRnaSeqFields,
  qualityMetricTitle,
  type SingleCellRnaSeqQualityMetricObject,
  type QualityMetricObject,
} from "../../lib/quality-metric";
import { isJsonFormat } from "../../lib/query-utils";
// root
import type { FileObject } from "../../globals";

export default function PerturbSeqQualityMetric({
  qualityMetric,
  qualityMetricOf,
  isJson,
}: {
  qualityMetric: SingleCellRnaSeqQualityMetricObject;
  qualityMetricOf: FileObject[];
  isJson: boolean;
}) {
  const sections = useSecDir();

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
              {singleCellRnaSeqFields.map((fieldAttr) => {
                if (qualityMetric[fieldAttr.name]) {
                  return (
                    <QualityMetricField
                      key={fieldAttr.name}
                      fieldAttr={fieldAttr}
                      qualityMetric={qualityMetric}
                    />
                  );
                }
              })}
            </DataArea>
          </DataPanel>

          <FileTable
            files={qualityMetricOf}
            title="Files this quality metric applies to"
            reportLink={`/multireport/?type=File&quality_metrics=${qualityMetric["@id"]}`}
            reportLabel="File with this quality metric"
            panelId="quality-metric-of"
          />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const item = (
    await request.getObject(
      `/single-cell-rna-seq-quality-metrics/${params.id}/`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(item)) {
    const qualityMetric = item as QualityMetricObject;

    const qualityMetricOf =
      qualityMetric.quality_metric_of.length > 0
        ? await requestFiles(
            qualityMetric.quality_metric_of as string[],
            request
          )
        : [];

    return {
      props: {
        qualityMetric,
        qualityMetricOf,
        pageContext: {
          title: qualityMetricTitle(qualityMetric),
        },
        isJson,
      },
    };
  }
  return errorObjectToProps(item);
}

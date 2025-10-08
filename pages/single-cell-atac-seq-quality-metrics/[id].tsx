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
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import { requestFiles } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  singleCellAtacSeqFields,
  qualityMetricTitle,
  type SingleCellAtacSeqQualityMetricObject,
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
  qualityMetric: SingleCellAtacSeqQualityMetricObject;
  qualityMetricOf: FileObject[];
  isJson: boolean;
}) {
  const sections = useSecDir({ isJson });

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
              {singleCellAtacSeqFields.map((fieldAttr) => {
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

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const item = (
    await request.getObject(
      `/single-cell-atac-seq-quality-metrics/${params.id}/`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(item)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      item,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const qualityMetric = item as QualityMetricObject;

    const qualityMetricOf =
      qualityMetric.quality_metric_of?.length > 0
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

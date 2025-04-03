// node_modules
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataItemLabel,
  DataItemValueUrl,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
// lib
import buildAttribution from "../../lib/attribution";
import { requestSamples } from "../../lib/common-requests";
import { formatDate } from "../../lib/dates";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { type ErrorObject } from "../../lib/fetch-request.d";
import PagePreamble from "../../components/page-preamble";
import { isJsonFormat } from "../../lib/query-utils";
// root
import type {
  InstitutionalCertificateObject,
  SampleObject,
  UserObject,
} from "../../globals";
import { DataUseLimitationStatus } from "../../components/data-use-limitation-status";

export default function InstitutionalCertificate({
  institutionalCertificate,
  samples,
  attribution,
  isJson,
}: {
  institutionalCertificate: InstitutionalCertificateObject;
  samples: SampleObject[];
  attribution: any;
  isJson: boolean;
}) {
  const sections = useSecDir();
  const submittedBy = institutionalCertificate.submitted_by as UserObject;

  // Array but schema allows exactly one URL.
  const url = institutionalCertificate.urls[0];

  return (
    <>
      <Breadcrumbs item={institutionalCertificate} />
      <EditableItem item={institutionalCertificate}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={institutionalCertificate} isJsonFormat={isJson}>
          <DataUseLimitationStatus
            limitation={institutionalCertificate.data_use_limitation}
            modifiers={institutionalCertificate.data_use_limitation_modifiers}
          />
          <ControlledAccessIndicator item={institutionalCertificate} />
        </ObjectPageHeader>
        <JsonDisplay item={institutionalCertificate} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Certificate Identifier</DataItemLabel>
              <DataItemValue>
                {institutionalCertificate.certificate_identifier}
              </DataItemValue>

              <DataItemLabel>Original Documents</DataItemLabel>
              <DataItemValueUrl>
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {url}
                </a>
              </DataItemValueUrl>

              <DataItemLabel>Creation Timestamp</DataItemLabel>
              <DataItemValue>
                {formatDate(institutionalCertificate.creation_timestamp)}
              </DataItemValue>

              {institutionalCertificate.release_timestamp && (
                <>
                  <DataItemLabel>Release Timestamp</DataItemLabel>
                  <DataItemValue>
                    {formatDate(institutionalCertificate.release_timestamp)}
                  </DataItemValue>
                </>
              )}

              {submittedBy && (
                <>
                  <DataItemLabel>Submitted By</DataItemLabel>
                  <DataItemValue>
                    <Link href={submittedBy["@id"]}>{submittedBy.title}</Link>
                  </DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {samples.length > 0 && <SampleTable samples={samples} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

type Params = {
  id: string[];
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<Params>
) {
  const { req, query, params } = context;
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const item = (
    await request.getObject(`/institutional-certificates/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(item)) {
    const institutionalCertificate =
      item as unknown as InstitutionalCertificateObject;
    const samples =
      institutionalCertificate.samples?.length > 0
        ? await requestSamples(institutionalCertificate.samples, request)
        : [];
    const attribution = await buildAttribution(
      institutionalCertificate,
      req.headers.cookie
    );

    return {
      props: {
        institutionalCertificate,
        samples,
        pageContext: {
          title: item.summary,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(item as ErrorObject);
}

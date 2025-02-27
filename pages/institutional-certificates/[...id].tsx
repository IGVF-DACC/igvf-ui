// node_modules
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValueBoolean,
  DataItemValueUrl,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import { useSecDir } from "../../components/section-directory";
// lib
import buildAttribution from "../../lib/attribution";
import { formatDate } from "../../lib/dates";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { type ErrorObject } from "../../lib/fetch-request.d";
import PagePreamble from "../../components/page-preamble";
import { isJsonFormat } from "../../lib/query-utils";
// root
import {
  type InstitutionalCertificateObject,
  type UserObject,
} from "../../globals.d";

export default function InstitutionalCertificate({
  institutionalCertificate,
  attribution,
  isJson,
}: {
  institutionalCertificate: InstitutionalCertificateObject;
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
        <ObjectPageHeader
          item={institutionalCertificate}
          isJsonFormat={isJson}
        />
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

              <DataItemLabel>Controlled Access</DataItemLabel>
              <DataItemValueBoolean>
                {institutionalCertificate.controlled_access}
              </DataItemValueBoolean>

              {institutionalCertificate.data_use_limitation && (
                <>
                  <DataItemLabel>Data Use Limitation</DataItemLabel>
                  <DataItemValue>
                    {institutionalCertificate.data_use_limitation}
                  </DataItemValue>
                </>
              )}

              {institutionalCertificate.data_use_limitation_modifiers && (
                <>
                  <DataItemLabel>Data Use Limitation Modifiers</DataItemLabel>
                  <DataItemValue>
                    {institutionalCertificate.data_use_limitation_modifiers.join(
                      ", "
                    )}
                  </DataItemValue>
                </>
              )}

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
            </DataArea>
          </DataPanel>
          <Attribution attribution={attribution} />
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
    const attribution = await buildAttribution(
      institutionalCertificate,
      req.headers.cookie
    );

    return {
      props: {
        institutionalCertificate,
        pageContext: {
          title: `${item.summary} ${item.data_use_limitation_summary}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(item as ErrorObject);
}

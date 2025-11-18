// node_modules
import type { GetServerSidePropsContext } from "next";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import Link from "../../components/link-no-prefetch";
import JsonDisplay from "../../components/json-display";
import NoContent from "../../components/no-content";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
// root
import type {
  LabObject,
  PageComponentProps,
  ServerSideProps,
  UserObject,
} from "../../globals";

/**
 * Props for the User page component.
 *
 * @property user - User object containing user details
 * @property lab - Lab object associated with the user, if any
 */
interface UserProps extends PageComponentProps {
  user: UserObject;
  lab: LabObject | null;
}

export default function User({ user, lab, isJson }: UserProps) {
  return (
    <>
      <Breadcrumbs item={user} />
      <EditableItem item={user}>
        <PagePreamble />
        <ObjectPageHeader item={user} isJsonFormat={isJson} />
        <JsonDisplay item={user} isJsonFormat={isJson}>
          {user.job_title || lab || user.email || user.submitter_comment ? (
            <DataPanel>
              <DataArea>
                {user.job_title && (
                  <>
                    <DataItemLabel>Job Title</DataItemLabel>
                    <DataItemValue>{user.job_title}</DataItemValue>
                  </>
                )}
                {lab && (
                  <>
                    <DataItemLabel>Lab</DataItemLabel>
                    <DataItemValue>
                      <Link href={lab["@id"]}>{lab.title}</Link>
                    </DataItemValue>
                  </>
                )}
                {user.email && (
                  <>
                    <DataItemLabel>Email</DataItemLabel>
                    <DataItemValue>
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </DataItemValue>
                  </>
                )}
                {user.submitter_comment && (
                  <>
                    <DataItemLabel>Submitter Comment</DataItemLabel>
                    <DataItemValue>{user.submitter_comment}</DataItemValue>
                  </>
                )}
              </DataArea>
            </DataPanel>
          ) : (
            <NoContent message="No user data to display" />
          )}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

export async function getServerSideProps({
  params,
  req,
  query,
}: GetServerSidePropsContext<{
  uuid: string;
}>): Promise<ServerSideProps> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const response = (await request.getObject(`/users/${params.uuid}/`)).union();
  if (FetchRequest.isResponseSuccess(response)) {
    const user = response as UserObject;

    const lab: LabObject | null = user.lab
      ? ((
          await request.getObject(
            typeof user.lab === "string" ? user.lab : user.lab["@id"]
          )
        ).optional() as LabObject | null)
      : null;

    return {
      props: {
        user,
        lab,
        pageContext: { title: user.title },
        isJson,
      } satisfies UserProps,
    };
  }
  return errorObjectToProps(response);
}

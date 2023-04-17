// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import NoContent from "../../components/no-content";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function User({ user, lab = null }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={user}>
        <PagePreamble />
        <ObjectPageHeader item={user} />
        {user.status || user.job_title || lab || user.email ? (
          <DataPanel>
            <DataArea>
              {user.job_title && (
                <>
                  <DataItemLabel>Job Title</DataItemLabel>
                  <DataItemValue>{user.job_title}</DataItemValue>
                </>
              )}
              {lab?.title && (
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
      </EditableItem>
    </>
  );
}

User.propTypes = {
  // User object from the server
  user: PropTypes.object.isRequired,
  // Lab data associated with `user`
  lab: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const user = await request.getObject(`/users/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(user)) {
    const lab = await request.getObject(user.lab, null);
    const breadcrumbs = await buildBreadcrumbs(
      user,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        user,
        lab,
        pageContext: { title: user.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(user);
}

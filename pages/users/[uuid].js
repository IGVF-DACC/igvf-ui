// node_modules
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
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const User = ({ lab, user }) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={user}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Lab</DataItemLabel>
            <DataItemValue>{lab.title}</DataItemValue>
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
};

User.propTypes = {
  // Lab data associated with `user`
  lab: PropTypes.object.isRequired,
  // user object from the server
  user: PropTypes.object.isRequired,
};

export default User;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const user = await request.getObject(`/users/${params.uuid}/`);
  if (FetchRequest.isResponseSuccess(user)) {
    const lab = await request.getObject(user.lab, {});
    const breadcrumbs = await buildBreadcrumbs(
      user,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        lab,
        pageContext: { title: user.title },
        breadcrumbs,
        user,
      },
    };
  }
  return errorObjectToProps(user);
};

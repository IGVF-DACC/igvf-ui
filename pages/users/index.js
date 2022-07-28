// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const UserList = ({ users }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <div>
        {users.length > 0 ? (
          users.map((user) => (
            <Link href={user["@id"]} key={user.uuid}>
              <a className="block">{user.title}</a>
            </Link>
          ))
        ) : (
          <NoCollectionData />
        )}
      </div>
    </>
  );
};

UserList.propTypes = {
  // Users to display in the list
  users: PropTypes.array.isRequired,
};

export default UserList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const users = await request.getCollection("users");
  if (FetchRequest.isResponseSuccess(users)) {
    const breadcrumbs = await buildBreadcrumbs(
      users,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        users: users["@graph"],
        pageContext: { title: users.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(users);
};

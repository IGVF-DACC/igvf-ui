// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { NoCollectionData } from "../../components/no-content";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import Request from "../../lib/request";

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
  const request = new Request(req?.headers?.cookie);
  const users = await request.getCollection("users");
  const breadcrumbs = await buildBreadcrumbs(users, "title");
  return {
    props: {
      users: users["@graph"],
      pageContext: { title: users.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  };
};

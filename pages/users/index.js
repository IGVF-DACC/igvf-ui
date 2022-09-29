// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  Collection,
  CollectionContent,
  CollectionHeader,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection";
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
      <Collection items={users}>
        {({ pageItems: pageUsers, pagerStatus, pagerAction }) => {
          if (users.length > 0) {
            return (
              <>
                <CollectionHeader
                  pagerStatus={pagerStatus}
                  pagerAction={pagerAction}
                />
                <CollectionContent collection={users} pagerStatus={pagerStatus}>
                  {pageUsers.map((user) => (
                    <CollectionItem
                      key={user.uuid}
                      testid={user.uuid}
                      href={user["@id"]}
                      label={`User ${user.name}`}
                      status={user.status}
                    >
                      <CollectionItemName>{user.title}</CollectionItemName>
                      {user.lab && (
                        <Link href={user.lab["@id"]}>
                          <a>{user.lab.title}</a>
                        </Link>
                      )}
                    </CollectionItem>
                  ))}
                </CollectionContent>
              </>
            );
          }

          return <NoCollectionData />;
        }}
      </Collection>
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
    await request.getAndEmbedCollectionObjects(users["@graph"], "lab");
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

// node_modules
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
import { NoCollectionData } from "../../components/no-content";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import Request from "../../lib/request";

const DifferentiatedCellList = ({ differentiatedCells }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {differentiatedCells.length > 0 ? (
          <>
            <CollectionHeader count={differentiatedCells.length} />
            <CollectionContent collection={differentiatedCells}>
              {differentiatedCells.map((differentiatedCell) => (
                <CollectionItem
                  key={differentiatedCell.uuid}
                  testid={differentiatedCell.uuid}
                  href={differentiatedCell["@id"]}
                  label={`Differentiated Cell ${differentiatedCell.accession}`}
                  status={differentiatedCell.status}
                >
                  <CollectionItemName>
                    {differentiatedCell.accession}
                  </CollectionItemName>
                  {differentiatedCell.organism && (
                    <div>{differentiatedCell.organism}</div>
                  )}
                  {differentiatedCell.nih_institutional_certification && (
                    <div>
                      {differentiatedCell.nih_institutional_certification}
                    </div>
                  )}
                </CollectionItem>
              ))}
            </CollectionContent>
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

DifferentiatedCellList.propTypes = {
  // Differentiated cells list to display
  differentiatedCells: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DifferentiatedCellList;

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie);
  const differentiatedCells = await request.getCollection(
    "differentiated-cells"
  );
  const breadcrumbs = await buildBreadcrumbs(differentiatedCells, "title");
  return {
    props: {
      differentiatedCells: differentiatedCells["@graph"],
      pageContext: { title: differentiatedCells.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  };
};

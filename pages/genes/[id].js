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
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const Gene = ({ gene }) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={gene}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={gene.status} />
            </DataItemValue>
            <DataItemLabel>NCBI Entrez GeneID</DataItemLabel>
            <DataItemValue>{gene.geneid}</DataItemValue>
            <DataItemLabel>NCBI Entrez Gene Status</DataItemLabel>
            <DataItemValue>{gene.ncbi_entrez_status}</DataItemValue>
            <DataItemLabel>Gene Symbol</DataItemLabel>
            <DataItemValue>{gene.symbol}</DataItemValue>
            <DataItemLabel>Taxa</DataItemLabel>
            <DataItemValue>{gene.taxa}</DataItemValue>
            {gene.name && (
              <>
                <DataItemLabel>Name</DataItemLabel>
                <DataItemValue>{gene.name}</DataItemValue>
              </>
            )}
            {gene.synonyms?.length > 0 && (
              <>
                <DataItemLabel>Synonyms</DataItemLabel>
                <DataItemValue>{gene.synonyms.join(", ")}</DataItemValue>
              </>
            )}
            {gene.locations?.length > 0 && (
              <>
                <DataItemLabel>Gene Locations</DataItemLabel>
                <DataItemValue>
                  <ul>
                    {gene.locations.map((location, index) => (
                      <li key={index} className="flex items-center">
                        {`${location.chromosome}:${location.start}-${location.end}`}
                        <div className="ml-2 bg-gray-300 px-1.5 text-xs font-semibold dark:bg-gray-700">
                          {location.assembly}
                        </div>
                      </li>
                    ))}
                  </ul>
                </DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
};

Gene.propTypes = {
  // Data for gene displayed on the page
  gene: PropTypes.object.isRequired,
};

export default Gene;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const gene = await request.getObject(`/genes/${params.id}/`);
  if (FetchRequest.isResponseSuccess(gene)) {
    const breadcrumbs = await buildBreadcrumbs(
      gene,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        gene,
        pageContext: { title: gene.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(gene);
};

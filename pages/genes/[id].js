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
import DbxrefList from "../../components/dbxref-list";
import ChromosomeLocations from "../../components/chromosome-locations";
import { EditableItem } from "../../components/edit";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

function EnsemblLink({ geneid, taxa }) {
  const organism = taxa.replace(/ /g, "_");
  return (
    <a href={`http://www.ensembl.org/${organism}/Gene/Summary?g=${geneid}`}>
      {geneid}
    </a>
  );
}

EnsemblLink.propTypes = {
  // GeneID to display as a link
  geneid: PropTypes.string.isRequired,
  // Metadata that affects certain dbxrefs
  taxa: PropTypes.string.isRequired,
};

export default function Gene({ gene }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={gene}>
        <PagePreamble />
        <ObjectPageHeader item={gene} />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={gene.status} />
            </DataItemValue>
            <DataItemLabel>ENSEMBL GeneID</DataItemLabel>
            <DataItemValue>
              <EnsemblLink geneid={gene.geneid} taxa={gene.taxa} />
            </DataItemValue>
            <DataItemLabel>Gene Symbol</DataItemLabel>
            <DataItemValue>{gene.symbol}</DataItemValue>
            <DataItemLabel>Taxa</DataItemLabel>
            <DataItemValue>{gene.taxa}</DataItemValue>
            {gene.dbxrefs?.length > 0 && (
              <>
                <DataItemLabel>External Resources</DataItemLabel>
                <DataItemValue>
                  <DbxrefList
                    dbxrefs={gene.dbxrefs}
                    meta={{ taxa: gene.taxa }}
                  />
                </DataItemValue>
              </>
            )}
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
                  <ChromosomeLocations locations={gene.locations} />
                </DataItemValue>
              </>
            )}
            {gene.submitter_comment && (
              <>
                <DataItemLabel>Submitter Comment</DataItemLabel>
                <DataItemValue>{gene.submitter_comment}</DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
}

Gene.propTypes = {
  // Data for gene displayed on the page
  gene: PropTypes.object.isRequired,
};

export async function getServerSideProps({ params, req }) {
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
}

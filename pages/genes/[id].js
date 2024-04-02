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
import EnsemblLink from "../../components/ensemble-link";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import Status from "../../components/status";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import SeparatedList from "../../components/separated-list";

export default function Gene({ gene, isJson }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={gene}>
        <PagePreamble />
        <ObjectPageHeader item={gene} isJsonFormat={isJson} />
        <JsonDisplay item={gene} isJsonFormat={isJson}>
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
                      isCollapsible
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
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {gene.synonyms.map((synonym) => (
                        <span key={synonym}>{synonym}</span>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {gene.locations?.length > 0 && (
                <>
                  <DataItemLabel>Gene Locations</DataItemLabel>
                  <DataItemValue>
                    <ChromosomeLocations
                      locations={gene.locations}
                      isCollapsible
                    />
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
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Gene.propTypes = {
  // Data for gene displayed on the page
  gene: PropTypes.object.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const gene = (await request.getObject(`/genes/${params.id}/`)).union();
  if (FetchRequest.isResponseSuccess(gene)) {
    const breadcrumbs = await buildBreadcrumbs(
      gene,
      gene.title,
      req.headers.cookie
    );
    return {
      props: {
        gene,
        pageContext: { title: gene.title },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(gene);
}

// node_modules
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import Collections from "../../components/collections";
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
import { StatusPreviewDetail } from "../../components/status";
// lib
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { encodeUriElement } from "../../lib/query-encoding";
import { isJsonFormat } from "../../lib/query-utils";
import SeparatedList from "../../components/separated-list";

export default function Gene({ gene, isJson }) {
  const sortedStudySets = _.sortBy(gene.study_sets, (studySet) =>
    studySet.toLowerCase()
  );

  return (
    <>
      <Breadcrumbs item={gene} />
      <EditableItem item={gene}>
        <PagePreamble />
        <ObjectPageHeader item={gene} isJsonFormat={isJson} />
        <JsonDisplay item={gene} isJsonFormat={isJson}>
          <StatusPreviewDetail item={gene} />
          <DataPanel>
            <DataArea>
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
              {sortedStudySets.length > 0 && (
                <>
                  <DataItemLabel>Study Sets</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {sortedStudySets.map((studySet) => (
                        <Link
                          key={studySet}
                          href={`/search/?type=Gene&study_sets=${encodeUriElement(
                            studySet
                          )}`}
                        >
                          {studySet}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {gene.collections?.length > 0 && (
                <>
                  <DataItemLabel>Collections</DataItemLabel>
                  <Collections
                    collections={gene.collections}
                    itemType={gene["@type"][0]}
                  />
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
    return {
      props: {
        gene,
        pageContext: { title: gene.title },
        isJson,
      },
    };
  }
  return errorObjectToProps(gene);
}

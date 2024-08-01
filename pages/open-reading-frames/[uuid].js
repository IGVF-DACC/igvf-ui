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
import { EditableItem } from "../../components/edit";
import EnsemblLink from "../../components/ensemble-link";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import AliasList from "../../components/alias-list";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function OpenReadingFrame({ orf, isJson }) {
  return (
    <>
      <Breadcrumbs item={orf} />
      <EditableItem item={orf}>
        <PagePreamble />
        <ObjectPageHeader item={orf} isJsonFormat={isJson} />
        <JsonDisplay item={orf} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Open Reading Frame ID</DataItemLabel>
              <DataItemValue>{orf.orf_id}</DataItemValue>
              {orf.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{orf.description}</DataItemValue>
                </>
              )}
              {orf.gene.length > 0 && (
                <>
                  <DataItemLabel>ENSEMBL GeneID</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {orf.gene.map((gene) => (
                        <EnsemblLink
                          geneid={gene.geneid}
                          key={gene}
                          taxa={"Homo sapiens"}
                        />
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {orf.protein_id && (
                <>
                  <DataItemLabel>ENSEMBL ProteinID</DataItemLabel>
                  <DataItemValue>{orf.protein_id}</DataItemValue>
                </>
              )}
              {orf.dbxrefs?.length > 0 && (
                <>
                  <DataItemLabel>External Resources</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList dbxrefs={orf.dbxrefs} isCollapsible />
                  </DataItemValue>
                </>
              )}
              {orf.pct_identical_protein >= 0 && (
                <>
                  <DataItemLabel>
                    Percentage of Identical Matches to Ensembl Protein
                  </DataItemLabel>
                  <DataItemValue>{orf.pct_identical_protein}</DataItemValue>
                </>
              )}
              {orf.pct_coverage_protein >= 0 && (
                <>
                  <DataItemLabel>
                    Percentage of ORF Covered by Ensembl Protein
                  </DataItemLabel>
                  <DataItemValue>{orf.pct_coverage_protein}</DataItemValue>
                </>
              )}
              {orf.pct_coverage_orf >= 0 && (
                <>
                  <DataItemLabel>
                    Percentage of Ensembl Protein Covered by ORF
                  </DataItemLabel>
                  <DataItemValue>{orf.pct_coverage_orf}</DataItemValue>
                </>
              )}
              {orf.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={orf.aliases} />
                  </DataItemValue>
                </>
              )}
              {orf.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{orf.submitter_comment}</DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

OpenReadingFrame.propTypes = {
  // Data for orf displayed on the page
  orf: PropTypes.object.isRequired,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const orf = (
    await request.getObject(`/open-reading-frames/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(orf)) {
    return {
      props: {
        orf,
        pageContext: { title: orf.orf_id },
        isJson,
      },
    };
  }
  return errorObjectToProps(orf);
}

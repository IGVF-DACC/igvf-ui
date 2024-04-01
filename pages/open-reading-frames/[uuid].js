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
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

function EnsemblLink({ ensemblid }) {
  return (
    <a href={`http://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${ensemblid}`}>
      {ensemblid}
    </a>
  );
}

EnsemblLink.propTypes = {
  // EnsemblID to display as a link
  ensemblid: PropTypes.string.isRequired,
};

export default function OpenReadingFrame({ orf, isJson }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={orf}>
        <PagePreamble />
        <ObjectPageHeader item={orf} isJsonFormat={isJson} />
        <JsonDisplay item={orf} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Open Reading Frame ID</DataItemLabel>
              <DataItemValue>{orf.orf_id}</DataItemValue>
              {orf.gene.length > 0 && (
                <>
                  <DataItemLabel>ENSEMBL GeneID</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {orf.gene.map((gene) => (
                        <EnsemblLink ensemblid={gene.geneid} key={gene} />
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
              {orf.pct_identical_protein && (
                <>
                  <DataItemLabel>
                    Percentage of Identical Matches to Ensembl Protein
                  </DataItemLabel>
                  <DataItemValue>{orf.pct_identical_protein}</DataItemValue>
                </>
              )}
              {orf.pct_coverage_protein && (
                <>
                  <DataItemLabel>
                    Percentage of ORF Covered by Ensembl Protein
                  </DataItemLabel>
                  <DataItemValue>{orf.pct_coverage_protein}</DataItemValue>
                </>
              )}
              {orf.pct_coverage_orf && (
                <>
                  <DataItemLabel>
                    Percentage of Ensembl Protein Covered by ORF
                  </DataItemLabel>
                  <DataItemValue>{orf.pct_coverage_orf}</DataItemValue>
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
    const breadcrumbs = await buildBreadcrumbs(
      orf,
      orf.orf_id,
      req.headers.cookie
    );
    return {
      props: {
        orf,
        pageContext: { title: orf.orf_id },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(orf);
}

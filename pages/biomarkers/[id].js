// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
import AliasList from "../../components/alias-list";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { EditableItem } from "../../components/edit";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function Biomarker({
  biomarker,
  award = null,
  lab = null,
  gene,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={biomarker}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Name</DataItemLabel>
            <DataItemValue>{biomarker.name}</DataItemValue>
            <DataItemLabel>quantification</DataItemLabel>
            <DataItemValue>{biomarker.quantification}</DataItemValue>
            {biomarker.description && (
              <>
                <DataItemLabel>Description</DataItemLabel>
                <DataItemValue>{biomarker.description}</DataItemValue>
              </>
            )}
            {biomarker.classification && (
              <>
                <DataItemLabel>Classification</DataItemLabel>
                <DataItemValue>{biomarker.classification}</DataItemValue>
              </>
            )}
            {biomarker.gene && (
              <>
                <DataItemLabel>Gene</DataItemLabel>
                <DataItemValue>
                  <Link href={gene["@id"]}>{gene.symbol}</Link>
                </DataItemValue>
              </>
            )}
            {biomarker.synonyms?.length > 0 && (
              <>
                <DataItemLabel>Synonyms</DataItemLabel>
                <DataItemValue>{biomarker.synonyms.join(", ")}</DataItemValue>
              </>
            )}
            {biomarker.aliases?.length > 0 && (
              <>
                <DataItemLabel>Aliases</DataItemLabel>
                <DataItemValue>
                  <AliasList aliases={biomarker.aliases} />
                </DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
}

Biomarker.propTypes = {
  // Biomarker object to display
  biomarker: PropTypes.object.isRequired,
  // Award applied to this biomarker
  award: PropTypes.object,
  // Lab that submitted this biomarker
  lab: PropTypes.object,
  // Gene that submitted this biomarker
  gene: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const biomarker = await request.getObject(`/biomarkers/${params.id}/`);
  if (FetchRequest.isResponseSuccess(biomarker)) {
    const award = await request.getObject(biomarker.award, null);
    const lab = await request.getObject(biomarker.lab, null);
    const gene = await request.getObject(biomarker.gene, null);
    const breadcrumbs = await buildBreadcrumbs(
      biomarker,
      "name",
      req.headers.cookie
    );
    return {
      props: {
        biomarker,
        award,
        lab,
        gene,
        pageContext: { title: biomarker.name },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(biomarker);
}

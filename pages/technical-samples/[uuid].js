// node_modules
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { SampleDataItems } from "../../components/common-data-items";
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
import { formatDate } from "../../lib/dates";
import Request from "../../lib/request";

const TechnicalSample = ({ sample, award, lab, source }) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sample}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={sample.status} />
            </DataItemValue>
            <SampleDataItems sample={sample} source={source}>
              {sample.date && (
                <>
                  <DataItemLabel>Technical Sample Date</DataItemLabel>
                  <DataItemValue>{formatDate(sample.date)}</DataItemValue>
                </>
              )}
              <DataItemLabel>Sample Material</DataItemLabel>
              <DataItemValue>{sample.sample_material}</DataItemValue>
              {sample.technical_sample_ontology && (
                <>
                  <DataItemLabel>Ontology</DataItemLabel>
                  <DataItemValue>
                    {sample.technical_sample_ontology}
                  </DataItemValue>
                </>
              )}
            </SampleDataItems>
          </DataArea>
        </DataPanel>
        <Attribution award={award} lab={lab} />
      </EditableItem>
    </>
  );
};

TechnicalSample.propTypes = {
  // Technical sample to display
  sample: PropTypes.object.isRequired,
  // Award applied to this technical sample
  award: PropTypes.object.isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.object.isRequired,
  // Source lab or source for this technical sample
  source: PropTypes.object.isRequired,
};

export default TechnicalSample;

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie);
  const sample = await request.getObject(`/technical-samples/${params.uuid}/`);
  if (sample && sample.status !== "error") {
    const award = await request.getObject(sample.award);
    const lab = await request.getObject(sample.lab);
    const source = await request.getObject(sample.source);
    const breadcrumbs = await buildBreadcrumbs(sample, "accession");
    return {
      props: {
        sample,
        award,
        lab,
        source,
        pageContext: { title: sample.accession },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
        uuid: params.uuid,
      },
    };
  }
  return { notFound: true };
};

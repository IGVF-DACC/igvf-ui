// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// components
import AliasList from "../../components/alias-list";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataItemValueAnnotated,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import ProductInfo from "../../components/product-info";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
// lib
import buildAttribution from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestDocuments,
  requestBiosamples,
  requestSources,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import { pathsFromDatabaseObjects } from "../../lib/database-object";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { truthyOrZero } from "../../lib/general";
import { PageProps } from "../../lib/next-js";
import { isJsonFormat } from "../../lib/query-utils";
import { type BiosampleObject } from "../../lib/samples";
// root
import type {
  DocumentObject,
  SourceObject,
  LabObject,
  TreatmentObject,
} from "../../globals";

/**
 * Props for the Treatment page component.
 *
 * @property biosamplesTreated - Biosample objects treated by this treatment
 * @property documents - Document objects associated with this treatment
 * @property sources - Source or lab objects associated with this treatment
 * @property treatment - Treatment object to display as the page content
 */
interface TreatmentPageProps extends PageProps {
  biosamplesTreated: BiosampleObject[];
  documents: DocumentObject[];
  sources: (SourceObject | LabObject)[];
  treatment: TreatmentObject;
}

/**
 * Page-rendering component for the treatment page.
 *
 * @param treatment - Treatment object to render
 * @param biosamplesTreated - Biosample objects treated by this treatment
 * @param documents - Documents associated with the treatment
 * @param attribution - Attribution data for the page
 * @param sources - Sources or labs associated with the treatment
 * @param isJson - True if user requested viewing JSON for the page
 */
export default function Treatment({
  treatment,
  biosamplesTreated,
  documents,
  sources,
  attribution,
  isJson,
}: TreatmentPageProps) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={treatment} />
      <EditableItem item={treatment}>
        <PagePreamble sections={sections} />
        <ObjectPageHeader item={treatment} isJsonFormat={isJson} />
        <JsonDisplay item={treatment} isJsonFormat={isJson}>
          <StatusPreviewDetail item={treatment} />
          <DataPanel>
            <DataArea>
              <DataItemLabel>Treatment Term Name</DataItemLabel>
              <DataItemValue>{treatment.treatment_term_name}</DataItemValue>
              <DataItemLabel>Treatment Type</DataItemLabel>
              <DataItemValue>{treatment.treatment_type}</DataItemValue>
              {treatment.treatment_term_id && (
                <>
                  <DataItemLabel>Treatment Term ID</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={[treatment.treatment_term_id]}
                      isCollapsible
                    />
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>Treatment Summary</DataItemLabel>
              <DataItemValue>{treatment.summary}</DataItemValue>
              {truthyOrZero(treatment.amount) && (
                <>
                  <DataItemLabel>Amount</DataItemLabel>
                  <DataItemValue>
                    {treatment.amount} {treatment.amount_units}
                    {treatment.amount === 1 ? "" : "s"}
                  </DataItemValue>
                </>
              )}
              {treatment.depletion && (
                <>
                  <DataItemLabel>Depletion</DataItemLabel>
                  <DataItemValue>True</DataItemValue>
                </>
              )}
              {truthyOrZero(treatment.duration) && (
                <>
                  <DataItemLabel>Duration</DataItemLabel>
                  <DataItemValue>
                    {treatment.duration} {treatment.duration_units}
                    {treatment.duration === 1 ? "" : "s"}
                  </DataItemValue>
                </>
              )}
              {truthyOrZero(treatment.pH) && (
                <>
                  <DataItemLabel>pH</DataItemLabel>
                  <DataItemValue>{treatment.pH}</DataItemValue>
                </>
              )}
              {treatment.purpose && (
                <>
                  <DataItemLabel>Purpose</DataItemLabel>
                  <DataItemValueAnnotated
                    objectType={treatment["@type"][0]}
                    propertyName="purpose"
                  >
                    {treatment.purpose}
                  </DataItemValueAnnotated>
                </>
              )}
              {truthyOrZero(treatment.post_treatment_time) && (
                <>
                  <DataItemLabel>Post-Treatment Time</DataItemLabel>
                  <DataItemValue>
                    {treatment.post_treatment_time}{" "}
                    {treatment.post_treatment_time_units}
                    {treatment.post_treatment_time === 1 ? "" : "s"}
                  </DataItemValue>
                </>
              )}
              {truthyOrZero(treatment.temperature) && (
                <>
                  <DataItemLabel>Temperature</DataItemLabel>
                  <DataItemValue>
                    {treatment.temperature}{" "}
                    {treatment.temperature_units === "Celsius"
                      ? `${UC.deg}C`
                      : treatment.temperature_units}
                  </DataItemValue>
                </>
              )}
              {treatment.description && (
                <>
                  <DataItemLabel>Description</DataItemLabel>
                  <DataItemValue>{treatment.description}</DataItemValue>
                </>
              )}
              {treatment.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{treatment.submitter_comment}</DataItemValue>
                </>
              )}
              {treatment.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={treatment.aliases} />
                  </DataItemValue>
                </>
              )}
              {(treatment.lot_id ||
                treatment.product_id ||
                sources.length > 0) && (
                <>
                  <DataItemLabel>Sources</DataItemLabel>
                  <DataItemValue>
                    <ProductInfo
                      lotId={treatment.lot_id}
                      productId={treatment.product_id}
                      sources={sources}
                    />
                  </DataItemValue>
                </>
              )}
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          {biosamplesTreated.length > 0 && (
            <SampleTable
              samples={biosamplesTreated}
              title="Treated Biosamples"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

export async function getServerSideProps({
  params,
  req,
  query,
  resolvedUrl,
}: GetServerSidePropsContext<{ uuid: string }>): Promise<
  GetServerSidePropsResult<TreatmentPageProps>
> {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const treatment = (
    await request.getObject<TreatmentObject>(`/treatments/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(treatment)) {
    const canonicalRedirect = createCanonicalUrlRedirect(
      treatment,
      resolvedUrl,
      query,
      ["uuid"]
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }

    const biosamplesTreated = await requestBiosamples(
      pathsFromDatabaseObjects(treatment.biosamples_treated),
      request
    );

    const documents = await requestDocuments(
      pathsFromDatabaseObjects(treatment.documents),
      request
    );

    const treatmentId =
      treatment.treatment_type === "environmental"
        ? treatment.summary
        : treatment.treatment_term_id;

    const sources = await requestSources(
      pathsFromDatabaseObjects(treatment.sources),
      request
    );

    const attribution = await buildAttribution(treatment, req.headers.cookie);
    return {
      props: {
        treatment,
        biosamplesTreated,
        documents,
        sources,
        pageContext: {
          title: treatmentId,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(treatment);
}

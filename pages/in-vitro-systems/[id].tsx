// root
import { type GetServerSidePropsContext } from "next";
// components
import { AlternativeIdentifiers } from "../../components/alternative-identifiers";
import Attribution from "../../components/attribution";
import BiomarkerTable from "../../components/biomarker-table";
import Breadcrumbs from "../../components/breadcrumbs";
import { BiosampleDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileSetTable from "../../components/file-set-table";
import { InstitutionalCertificateTable } from "../../components/institutional-certificate-table";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ModificationTable from "../../components/modification-table";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
import TreatmentTable from "../../components/treatment-table";
// lib
import buildAttribution, { type AttributionData } from "../../lib/attribution";
import { createCanonicalUrlRedirect } from "../../lib/canonical-redirect";
import {
  requestBiomarkers,
  requestBiosamples,
  requestDocuments,
  requestDonors,
  requestFileSets,
  requestInstitutionalCertificates,
  requestOntologyTerms,
  requestPublications,
  requestSamples,
  requestSupersedes,
  requestTreatments,
} from "../../lib/common-requests";
import { UC } from "../../lib/constants";
import { type InstitutionalCertificateObject } from "../../lib/data-use-limitation";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import { Ok } from "../../lib/result";
import type {
  BiosampleObject,
  InVitroSystemObject,
  SampleObject,
} from "../../lib/samples";
import {
  isEmbedded,
  isEmbeddedArray,
  isPath,
  isPathArray,
} from "../../lib/types";
// root
import type {
  BiomarkerObject,
  DocumentObject,
  DonorObject,
  FileSetObject,
  LabObject,
  OntologyTermObject,
  PublicationObject,
  SourceObject,
  TreatmentObject,
} from "../../globals";

export default function InVitroSystem({
  inVitroSystem,
  cellFateProtocol,
  constructLibrarySets,
  demultiplexedFrom,
  demultiplexedTo,
  diseaseTerms,
  annotatedFrom,
  documents,
  donors,
  originOf,
  partOf,
  parts,
  pooledFrom,
  pooledIn,
  publications,
  sortedFractions,
  sources,
  treatments,
  biomarkers,
  multiplexedInSamples,
  institutionalCertificates,
  supersedes,
  supersededBy,
  attribution,
  isJson,
}: {
  inVitroSystem: InVitroSystemObject;
  cellFateProtocol: DocumentObject | null;
  constructLibrarySets: FileSetObject[];
  demultiplexedFrom: SampleObject | null;
  demultiplexedTo: SampleObject[];
  diseaseTerms: OntologyTermObject[];
  annotatedFrom: BiosampleObject | null;
  documents: DocumentObject[];
  donors: DonorObject[];
  originOf: SampleObject[];
  partOf: BiosampleObject | null;
  parts: BiosampleObject[];
  pooledFrom: BiosampleObject[];
  pooledIn: BiosampleObject[];
  publications: PublicationObject[];
  sortedFractions: SampleObject[];
  sources: (SourceObject | LabObject)[];
  treatments: TreatmentObject[];
  biomarkers: BiomarkerObject[];
  multiplexedInSamples: SampleObject[];
  institutionalCertificates: InstitutionalCertificateObject[];
  supersedes: SampleObject[];
  supersededBy: SampleObject[];
  attribution?: AttributionData;
  isJson: boolean;
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={inVitroSystem} />
      <EditableItem item={inVitroSystem}>
        <PagePreamble sections={sections} />
        <AlternativeIdentifiers
          alternateAccessions={inVitroSystem.alternate_accessions}
          supersedes={supersedes}
          supersededBy={supersededBy}
        />
        <ObjectPageHeader item={inVitroSystem} isJsonFormat={isJson} />
        <JsonDisplay item={inVitroSystem} isJsonFormat={isJson}>
          <StatusPreviewDetail item={inVitroSystem} />
          <DataPanel>
            <DataArea>
              <BiosampleDataItems
                item={inVitroSystem}
                classifications={inVitroSystem.classifications}
                constructLibrarySets={constructLibrarySets}
                diseaseTerms={diseaseTerms}
                annotatedFrom={annotatedFrom}
                partOf={partOf}
                publications={publications}
                sampleTerms={
                  isEmbeddedArray(inVitroSystem.sample_terms)
                    ? inVitroSystem.sample_terms
                    : []
                }
                sources={sources}
              >
                {isEmbedded(inVitroSystem.targeted_sample_term) && (
                  <>
                    <DataItemLabel>Targeted Sample Term</DataItemLabel>
                    <DataItemValue>
                      <Link href={inVitroSystem.targeted_sample_term["@id"]}>
                        {inVitroSystem.targeted_sample_term.term_name}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {inVitroSystem.passage_number !== undefined && (
                  <>
                    <DataItemLabel>Passage Number</DataItemLabel>
                    <DataItemValue>
                      {inVitroSystem.passage_number}
                    </DataItemValue>
                  </>
                )}
                {inVitroSystem.time_post_change !== undefined && (
                  <>
                    <DataItemLabel>Time Post Change</DataItemLabel>
                    <DataItemValue>
                      {inVitroSystem.time_post_change}{" "}
                      {inVitroSystem.time_post_change === 1
                        ? inVitroSystem.time_post_change_units
                        : `${inVitroSystem.time_post_change_units}s`}
                    </DataItemValue>
                  </>
                )}
                {inVitroSystem.time_post_culture !== undefined && (
                  <>
                    <DataItemLabel>Time Post Culture</DataItemLabel>
                    <DataItemValue>
                      {inVitroSystem.time_post_culture}{" "}
                      {inVitroSystem.time_post_culture === 1
                        ? inVitroSystem.time_post_culture_units
                        : `${inVitroSystem.time_post_culture_units}s`}
                    </DataItemValue>
                  </>
                )}
                {inVitroSystem.growth_medium && (
                  <>
                    <DataItemLabel>Growth Medium</DataItemLabel>
                    <DataItemValue>{inVitroSystem.growth_medium}</DataItemValue>
                  </>
                )}
                {demultiplexedFrom && (
                  <>
                    <DataItemLabel>Demultiplexed From Sample</DataItemLabel>
                    <DataItemValue>
                      <Link href={demultiplexedFrom["@id"]}>
                        {demultiplexedFrom.accession}
                      </Link>
                    </DataItemValue>
                  </>
                )}
                {cellFateProtocol && (
                  <>
                    <DataItemLabel>Cell Fate Change Protocol</DataItemLabel>
                    <DataItemValue>
                      <Link href={cellFateProtocol["@id"]}>
                        {cellFateProtocol.attachment.download}
                      </Link>
                    </DataItemValue>
                  </>
                )}
              </BiosampleDataItems>
              <Attribution attribution={attribution ?? null} />
            </DataArea>
          </DataPanel>
          {donors.length > 0 && <DonorTable donors={donors} />}
          {isEmbeddedArray(inVitroSystem.file_sets) && (
            <FileSetTable fileSets={inVitroSystem.file_sets} />
          )}
          {multiplexedInSamples.length > 0 && (
            <SampleTable
              samples={multiplexedInSamples}
              reportLink={`/multireport/?type=MultiplexedSample&multiplexed_samples.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of multiplexed samples in which this sample is included"
              title="Multiplexed In Samples"
              panelId="multiplexed-in-samples"
            />
          )}
          {pooledFrom.length > 0 && (
            <SampleTable
              samples={pooledFrom}
              reportLink={`/multireport/?type=Sample&pooled_in=${inVitroSystem["@id"]}`}
              reportLabel="Report of samples this biosample is pooled from"
              title="Biosamples Pooled From"
              isDeletedVisible
              panelId="pooled-from"
            />
          )}
          {pooledIn.length > 0 && (
            <SampleTable
              samples={pooledIn}
              reportLink={`/multireport/?type=Biosample&pooled_from=${inVitroSystem["@id"]}`}
              reportLabel="Report of pooled biosamples in which this sample is included"
              title="Pooled In"
              panelId="pooled-in"
            />
          )}
          {demultiplexedTo.length > 0 && (
            <SampleTable
              samples={demultiplexedTo}
              reportLink={`/multireport/?type=Biosample&demultiplexed_from=${inVitroSystem["@id"]}`}
              reportLabel="Report of parts into which this sample has been demultiplexed"
              title="Demultiplexed To Sample"
              panelId="demultiplexed-to"
            />
          )}
          {parts.length > 0 && (
            <SampleTable
              samples={parts}
              reportLink={`/multireport/?type=Biosample&part_of=${inVitroSystem["@id"]}`}
              reportLabel="Report of parts into which this sample has been divided"
              title="Sample Parts"
              panelId="parts"
            />
          )}
          {originOf.length > 0 && (
            <SampleTable
              samples={originOf}
              reportLink={`/multireport/?type=Biosample&originated_from.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of samples which originate from this sample"
              title="Origin Sample Of"
              panelId="origin-of"
            />
          )}
          {isEmbeddedArray(inVitroSystem.modifications) && (
            <ModificationTable modifications={inVitroSystem.modifications} />
          )}
          {sortedFractions.length > 0 && (
            <SampleTable
              samples={sortedFractions}
              reportLink={`/multireport/?type=Sample&sorted_from.@id=${inVitroSystem["@id"]}`}
              reportLabel="Report of fractions into which this sample has been sorted"
              title="Sorted Fractions of Sample"
              panelId="sorted-fractions"
            />
          )}
          {biomarkers.length > 0 && (
            <BiomarkerTable
              biomarkers={biomarkers}
              reportLink={`/multireport/?type=Biomarker&biomarker_for=${inVitroSystem["@id"]}`}
              reportLabel={`Report of biological markers that are associated with biosample ${inVitroSystem.accession}`}
              isDeletedVisible
            />
          )}
          {treatments.length > 0 && (
            <TreatmentTable
              treatments={treatments}
              reportLink={`/multireport/?type=Treatment&biosamples_treated=${inVitroSystem["@id"]}`}
              reportLabel={`Report of treatments applied to the biosample ${inVitroSystem.accession}`}
              isDeletedVisible
            />
          )}
          {institutionalCertificates.length > 0 && (
            <InstitutionalCertificateTable
              institutionalCertificates={institutionalCertificates}
              reportLink={`/multireport/?type=InstitutionalCertificate&samples=${inVitroSystem["@id"]}`}
              reportLabel={`Report of institutional certificates associated with ${inVitroSystem.accession}`}
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
}: GetServerSidePropsContext) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const response = (
    await request.getObject(`/in-vitro-systems/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(response)) {
    const inVitroSystem = response as InVitroSystemObject;

    const canonicalRedirect = createCanonicalUrlRedirect(
      inVitroSystem,
      resolvedUrl,
      query
    );
    if (canonicalRedirect) {
      return canonicalRedirect;
    }
    let biomarkers: BiomarkerObject[] = [];
    if (isEmbeddedArray(inVitroSystem.biomarkers)) {
      const biomarkerPaths = inVitroSystem.biomarkers.map(
        (biomarker) => biomarker["@id"]
      );
      biomarkers = await requestBiomarkers(biomarkerPaths, request);
    }
    let cellFateProtocol: DocumentObject | null = null;
    if (isPath(inVitroSystem.cell_fate_change_protocol)) {
      cellFateProtocol = (
        await request.getObject<DocumentObject>(
          inVitroSystem.cell_fate_change_protocol
        )
      ).optional();
    }
    const demultiplexedFrom = isPath(inVitroSystem.demultiplexed_from)
      ? (
          await request.getObject<SampleObject>(
            inVitroSystem.demultiplexed_from
          )
        ).optional()
      : null;
    const demultiplexedTo = isPathArray(inVitroSystem.demultiplexed_to)
      ? await requestBiosamples(inVitroSystem.demultiplexed_to, request)
      : [];
    let diseaseTerms: OntologyTermObject[] = [];
    if (isEmbeddedArray(inVitroSystem.disease_terms)) {
      const diseaseTermPaths = inVitroSystem.disease_terms.map(
        (diseaseTerm) => diseaseTerm["@id"]
      );
      diseaseTerms = await requestOntologyTerms(diseaseTermPaths, request);
    }
    const documents = isPathArray(inVitroSystem.documents)
      ? await requestDocuments(inVitroSystem.documents, request)
      : [];
    let donors: DonorObject[] = [];
    if (isEmbeddedArray(inVitroSystem.donors)) {
      const donorPaths = inVitroSystem.donors.map((donor) => donor["@id"]);
      donors = await requestDonors(donorPaths, request);
    }
    const partOf = isPath(inVitroSystem.part_of)
      ? (
          await request.getObject<BiosampleObject>(inVitroSystem.part_of)
        ).optional()
      : null;
    const parts = isPathArray(inVitroSystem.parts)
      ? await requestBiosamples(inVitroSystem.parts, request)
      : [];
    const pooledFrom = isPathArray(inVitroSystem.pooled_from)
      ? await requestBiosamples(inVitroSystem.pooled_from, request)
      : [];
    const pooledIn = isPathArray(inVitroSystem.pooled_in)
      ? await requestBiosamples(inVitroSystem.pooled_in, request)
      : [];
    const originOf = isPathArray(inVitroSystem.origin_of)
      ? await requestBiosamples(inVitroSystem.origin_of, request)
      : [];
    const sortedFractions = isPathArray(inVitroSystem.sorted_fractions)
      ? await requestSamples(inVitroSystem.sorted_fractions, request)
      : [];
    let sources: (SourceObject | LabObject)[] = [];
    if (isEmbeddedArray(inVitroSystem.sources)) {
      const sourcePaths = inVitroSystem.sources.map((source) => source["@id"]);
      sources = Ok.all(
        await request.getMultipleObjects<SourceObject | LabObject>(
          sourcePaths,
          {
            filterErrors: true,
          }
        )
      );
    }
    let treatments: TreatmentObject[] = [];
    if (isEmbeddedArray(inVitroSystem.treatments)) {
      const treatmentPaths = inVitroSystem.treatments.map(
        (treatment) => treatment["@id"]
      );
      treatments = await requestTreatments(treatmentPaths, request);
    }
    let constructLibrarySets: FileSetObject[] = [];
    if (isEmbeddedArray(inVitroSystem.construct_library_sets)) {
      const constructLibrarySetPaths = inVitroSystem.construct_library_sets.map(
        (constructLibrarySet) => constructLibrarySet["@id"]
      );
      constructLibrarySets = await requestFileSets(
        constructLibrarySetPaths,
        request
      );
    }
    let multiplexedInSamples: SampleObject[] = [];
    if (isEmbeddedArray(inVitroSystem.multiplexed_in)) {
      const multiplexedInPaths = inVitroSystem.multiplexed_in.map(
        (sample) => sample["@id"]
      );
      multiplexedInSamples = await requestSamples(multiplexedInPaths, request);
    }
    let institutionalCertificates: InstitutionalCertificateObject[] = [];
    if (isEmbeddedArray(inVitroSystem.institutional_certificates)) {
      const institutionalCertificatePaths =
        inVitroSystem.institutional_certificates.map(
          (institutionalCertificate) => institutionalCertificate["@id"]
        );
      institutionalCertificates = await requestInstitutionalCertificates(
        institutionalCertificatePaths,
        request
      );
    }
    const annotatedFrom = isPath(inVitroSystem.annotated_from)
      ? (
          await request.getObject<BiosampleObject>(inVitroSystem.annotated_from)
        ).optional()
      : null;
    let publications: PublicationObject[] = [];
    if (isEmbeddedArray(inVitroSystem.publications)) {
      const publicationPaths = inVitroSystem.publications.map(
        (publication) => publication["@id"]
      );
      publications = await requestPublications(publicationPaths, request);
    }
    const { supersedes, supersededBy } = await requestSupersedes(
      inVitroSystem,
      "Sample",
      request
    );
    const attribution = await buildAttribution(
      inVitroSystem,
      req.headers.cookie
    );

    const sampleTermName =
      isEmbeddedArray(inVitroSystem.sample_terms) &&
      inVitroSystem.sample_terms.length > 0
        ? (inVitroSystem.sample_terms[0].term_name ?? "no sample term")
        : "no sample term";

    return {
      props: {
        inVitroSystem,
        biomarkers,
        cellFateProtocol,
        constructLibrarySets,
        demultiplexedFrom,
        demultiplexedTo,
        annotatedFrom,
        diseaseTerms,
        documents,
        donors,
        originOf,
        pooledFrom,
        parts,
        partOf,
        pooledIn,
        publications,
        sortedFractions,
        sources,
        treatments,
        multiplexedInSamples,
        institutionalCertificates,
        supersedes,
        supersededBy,
        pageContext: {
          title: `${inVitroSystem.accession} ${UC.mdash} ${sampleTermName}`,
        },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(response);
}

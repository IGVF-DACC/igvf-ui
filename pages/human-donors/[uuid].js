// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { DonorDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import ExternalResources from "../../components/external-resources";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import RelatedDonorsTable from "../../components/related-donors-table";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestDocuments } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import { isJsonFormat } from "../../lib/query-utils";
import buildAttribution from "../../lib/attribution";

// TEMPORARY starting here
import { ListSelect } from "../../components/form-elements";
import { useState } from "react";
import {
  Dropdown,
  DROPDOWN_ALIGN_LEFT,
  DROPDOWN_ALIGN_RIGHT,
  DropdownRef,
  useDropdown,
} from "../../components/dropdown";

const months = ["January", "February", "March", "April", "May", "June", "July"];

function DropdownExampleComponent({ alignment }) {
  const dropdownAttr = useDropdown("dropdown-id", alignment);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Called when the user selects a month from the dropdown.
  function monthSelection(month) {
    setSelectedMonth(month);
    dropdownAttr.isVisible = false;
  }

  return (
    <>
      <DropdownRef dropdownAttr={dropdownAttr}>
        <button className="rounded border border-black px-2">Click Me</button>
      </DropdownRef>
      <Dropdown dropdownAttr={dropdownAttr}>
        <ListSelect
          value={selectedMonth}
          onChange={monthSelection}
          className="shadow-lg [&>div]:max-h-52"
        >
          {months.map((month) => {
            return (
              <ListSelect.Option key={month} id={month} label={month}>
                <div className="text-left">{month}</div>
              </ListSelect.Option>
            );
          })}
        </ListSelect>
      </Dropdown>
    </>
  );
}

DropdownExampleComponent.propTypes = {
  alignment: PropTypes.oneOf([DROPDOWN_ALIGN_LEFT, DROPDOWN_ALIGN_RIGHT]),
};
// TEMPORARY mostly ending here

export default function HumanDonor({
  donor,
  documents,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={donor}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={donor.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={donor} isJsonFormat={isJson} />
        <JsonDisplay item={donor} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DonorDataItems item={donor} />
              {donor.human_donor_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Identifiers</DataItemLabel>
                  <DataItemValue>
                    {donor.human_donor_identifiers.join(", ")}
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {donor.phenotypic_features && (
            <>
              <DataAreaTitle>Phenotypic Features</DataAreaTitle>
              <PhenotypicFeatureTable
                phenotypicFeatures={donor.phenotypic_features}
              />
            </>
          )}
          {donor.related_donors?.length > 0 && (
            <>
              <DataAreaTitle>Related Donors</DataAreaTitle>
              <RelatedDonorsTable relatedDonors={donor.related_donors} />
            </>
          )}
          <ExternalResources resources={donor.external_resources} />
          {documents.length > 0 && (
            <>
              <DataAreaTitle>Documents</DataAreaTitle>
              <DocumentTable documents={documents} />
            </>
          )}
          <div className="flex justify-between py-2">
            <DropdownExampleComponent alignment={DROPDOWN_ALIGN_LEFT} />
            <DropdownExampleComponent alignment={DROPDOWN_ALIGN_RIGHT} />
          </div>
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

HumanDonor.propTypes = {
  // Human donor to display
  donor: PropTypes.object.isRequired,
  // Documents associated with human donor
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // HumanDonor attribution
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = (
    await request.getObject(`/human-donors/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(donor)) {
    const documents = donor.documents
      ? await requestDocuments(donor.documents, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      donor,
      donor.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(donor, req.headers.cookie);
    return {
      props: {
        donor,
        documents,
        pageContext: { title: donor.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(donor);
}

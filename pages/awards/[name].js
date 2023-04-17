// node_modules
import PropTypes from "prop-types";
import Link from "next/link";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { formatDateRange } from "../../lib/dates";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import SeparatedList from "../../components/separated-list";

export default function Award({ award, pis, contactPi }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={award}>
        <PagePreamble />
        <ObjectPageHeader item={award} />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Title</DataItemLabel>
            <DataItemValue>{award.title}</DataItemValue>
            {award.description && (
              <>
                <DataItemLabel>Description</DataItemLabel>
                <DataItemValue>{award.description}</DataItemValue>
              </>
            )}
            {pis.length > 0 && (
              <>
                <DataItemLabel>Principal Investigator(s)</DataItemLabel>
                <DataItemValue>
                  <SeparatedList>
                    {pis.map((pi) => (
                      <Link href={pi["@id"]} key={pi.uuid}>
                        {pi.title}
                      </Link>
                    ))}
                  </SeparatedList>
                </DataItemValue>
              </>
            )}
            {contactPi && (
              <>
                <DataItemLabel>Contact P.I.</DataItemLabel>
                <DataItemValue>
                  <Link href={contactPi["@id"]} key={contactPi.uuid}>
                    {contactPi.title}
                  </Link>
                </DataItemValue>
              </>
            )}
            {award.component && (
              <>
                <DataItemLabel>Component</DataItemLabel>
                <DataItemValue>{award.component}</DataItemValue>
              </>
            )}
            <DataItemLabel>Project</DataItemLabel>
            <DataItemValue>{award.project}</DataItemValue>
            {(award.start_date || award.end_date) && (
              <>
                <DataItemLabel>Grant Dates</DataItemLabel>
                <DataItemValue>
                  {formatDateRange(award.start_date, award.end_date)}
                </DataItemValue>
              </>
            )}
            {award.submitter_comment && (
              <>
                <DataItemLabel>Submitter Comment</DataItemLabel>
                <DataItemValue>{award.submitter_comment}</DataItemValue>
              </>
            )}
            {award.url && (
              <>
                <DataItemLabel>Additional Information</DataItemLabel>
                <DataItemValue>
                  <a href={award.url} target="_blank" rel="noreferrer">
                    {award.url}
                  </a>
                </DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
}

Award.propTypes = {
  // Award data to display on the page
  award: PropTypes.object.isRequired,
  // Principal investigator data associated with `award`
  pis: PropTypes.arrayOf(PropTypes.object).isRequired,
  // The contact Principal Investigator of the grant.
  contactPi: PropTypes.object,
};

export async function getServerSideProps({ params, req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const award = await request.getObject(`/awards/${params.name}/`);
  if (FetchRequest.isResponseSuccess(award)) {
    const pis =
      award.pis?.length > 0
        ? await request.getMultipleObjects(award.pis, null, {
            filterErrors: true,
          })
        : [];
    const contactPi = award.contact_pi
      ? await request.getObject(award.contact_pi, null)
      : null;
    const breadcrumbs = await buildBreadcrumbs(
      award,
      "name",
      req.headers.cookie
    );
    return {
      props: {
        award,
        pis,
        contactPi,
        pageContext: { title: award.name },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(award);
}

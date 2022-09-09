// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
import Status from "../../components/status";
import { EditableItem } from "../../components/edit";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const Lab = ({ lab, awards, pi = null }) => {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={lab}>
        <PagePreamble />
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status={lab.status} />
            </DataItemValue>
            <DataItemLabel>Institute</DataItemLabel>
            <DataItemValue>{lab.institute_label}</DataItemValue>
            {pi && (
              <>
                <DataItemLabel>Principal Investigator</DataItemLabel>
                <DataItemValue>{pi.title}</DataItemValue>
              </>
            )}
            {awards.length > 0 && (
              <>
                <DataItemLabel>Awards</DataItemLabel>
                <SeparatedList>
                  {awards.map((award) => (
                    <Link href={award["@id"]} key={award.uuid}>
                      <a aria-label={`Award ${award.name}`}>{award.name}</a>
                    </Link>
                  ))}
                </SeparatedList>
              </>
            )}
            {lab.submitter_comment && (
              <>
                <DataItemLabel>Submitter Comment</DataItemLabel>
                <DataItemValue>{lab.submitter_comment}</DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
      </EditableItem>
    </>
  );
};

Lab.propTypes = {
  // Data for lab displayed on the page
  lab: PropTypes.object.isRequired,
  // Awards associated with `lab`
  awards: PropTypes.array.isRequired,
  // Principal investigator for `lab`
  pi: PropTypes.object,
};

export default Lab;

export const getServerSideProps = async ({ params, req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const lab = await request.getObject(`/labs/${params.name}/`);
  if (FetchRequest.isResponseSuccess(lab)) {
    const awards = lab.awards
      ? await request.getMultipleObjects(lab.awards, null, {
          filterErrors: true,
        })
      : [];
    const pi = await request.getObject(lab.pi, null);
    const breadcrumbs = await buildBreadcrumbs(
      lab,
      "title",
      req.headers.cookie
    );
    return {
      props: {
        lab,
        awards,
        pi,
        pageContext: { title: lab.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(lab);
};

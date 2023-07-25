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
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestAwards } from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function Lab({ lab, awards = null, pi = null, isJson }) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={lab}>
        <PagePreamble />
        <ObjectPageHeader item={lab} isJsonFormat={isJson} />
        <JsonDisplay item={lab} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Institute</DataItemLabel>
              <DataItemValue>{lab.institute_label}</DataItemValue>
              {pi && (
                <>
                  <DataItemLabel>Principal Investigator</DataItemLabel>
                  <DataItemValue>{pi.title}</DataItemValue>
                </>
              )}
              {lab.url && (
                <>
                  <DataItemLabel>URL</DataItemLabel>
                  <DataItemValue>
                    <a href={lab.url} target="_blank" rel="noreferrer">
                      {lab.url}
                    </a>
                  </DataItemValue>
                </>
              )}
              {awards?.length > 0 && (
                <>
                  <DataItemLabel>Awards</DataItemLabel>
                  <SeparatedList>
                    {awards.map((award) => (
                      <Link
                        href={award["@id"]}
                        aria-label={`Award ${award.name}`}
                        key={award["@id"]}
                      >
                        {award.name}
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
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

Lab.propTypes = {
  // Data for lab displayed on the page
  lab: PropTypes.object.isRequired,
  // Awards associated with `lab`
  awards: PropTypes.array.isRequired,
  // Principal investigator for `lab`
  pi: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const lab = await request.getObject(`/labs/${params.name}/`);
  if (FetchRequest.isResponseSuccess(lab)) {
    let awards = [];
    if (lab.awards?.length > 0) {
      const awardPaths = lab.awards.map((award) => award["@id"]);
      awards = await requestAwards(awardPaths, request);
    }
    const pi = await request.getObject(lab.pi, null);
    const breadcrumbs = await buildBreadcrumbs(
      lab,
      "title",
      req.headers.cookie,
    );
    return {
      props: {
        lab,
        awards,
        pi,
        pageContext: { title: lab.title },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(lab);
}

// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area"
import PagePreamble from "../../components/page-preamble"
import SeparatedList from "../../components/separated-list"
import Status from "../../components/status"
// libs
import Request from "../../libs/request"
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { EditLink } from '../../components/edit-func'

const Lab = ({ lab, awards, pi }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataPanel>
        <DataArea>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={lab.status} />
          </DataItemValue>
          <DataItemLabel>Institute</DataItemLabel>
          <DataItemValue>{lab.institute_label}</DataItemValue>
          <DataItemLabel>Principal Investigator</DataItemLabel>
          <DataItemValue>{pi.title}</DataItemValue>
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
        </DataArea>
      </DataPanel>
      <EditLink path={`/labs/${lab.name}`} item={lab}/>
    </>
  )
}

Lab.propTypes = {
  // Data for lab displayed on the page
  lab: PropTypes.object.isRequired,
  // Awards associated with `lab`
  awards: PropTypes.array.isRequired,
  // Principal investigator for `lab`
  pi: PropTypes.shape({
    // PI full name
    title: PropTypes.string.isRequired,
  }),
}

export default Lab

export const getServerSideProps = async ({ params, req }) => {
  const request = new Request(req?.headers?.cookie)
  const lab = await request.getObject(`/labs/${params.name}/`)
  if (lab && lab.status !== "error") {
    const awards = await request.getMultipleObjects(lab.awards)
    const pi = await request.getObject(lab.pi)
    const breadcrumbs = await buildBreadcrumbs(lab, "title")
    return {
      props: {
        lab,
        awards,
        pi,
        pageContext: { title: lab.title },
        breadcrumbs,
        sessionCookie: req?.headers?.cookie,
      },
    }
  }
  return { notFound: true }
}

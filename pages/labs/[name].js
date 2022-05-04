// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  DataArea,
  DataItem,
  DataItemLabel,
  DataItemValue,
} from "../../components/data-item"
import PagePreamble from "../../components/page-preamble"
import SeparatedList from "../../components/separated-list"
import Status from "../../components/status"
// libs
import Request from "../../libs/request"
import buildBreadcrumbs from "../../libs/breadcrumbs"

const Lab = ({ lab, awards, pi }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
        <DataItem>
          <DataItemLabel>Status</DataItemLabel>
          <DataItemValue>
            <Status status={lab.status} />
          </DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Institute</DataItemLabel>
          <DataItemValue>{lab.institute_label}</DataItemValue>
        </DataItem>
        <DataItem>
          <DataItemLabel>Principal Investigator</DataItemLabel>
          <DataItemValue>{pi.title}</DataItemValue>
        </DataItem>
        {awards.length > 0 && (
          <DataItem>
            <DataItemLabel>Awards</DataItemLabel>
            <SeparatedList>
              {awards.map((award) => (
                <Link href={award["@id"]} key={award.uuid}>
                  <a aria-label={`Award ${award.name}`}>{award.name}</a>
                </Link>
              ))}
            </SeparatedList>
          </DataItem>
        )}
      </DataArea>
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
      },
    }
  }
  return { notFound: true }
}

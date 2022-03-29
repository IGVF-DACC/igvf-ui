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
// libs
import { getMultipleObjects, getObject } from "../../libs/request"
import buildBreadcrumbContext from "../../libs/breadcrumbs"

const Lab = ({ lab, awards, pi }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <DataArea>
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

export const getServerSideProps = async ({ params }) => {
  const lab = await getObject(`/labs/${params.name}/`)
  const awards = await getMultipleObjects(lab.awards)
  const pi = await getObject(lab.pi)
  const breadcrumbContext = await buildBreadcrumbContext(lab, "title")
  return {
    props: {
      lab,
      awards,
      pi,
      pageContext: { title: lab.title },
      breadcrumbContext,
    },
  }
}

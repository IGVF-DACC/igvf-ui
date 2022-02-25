// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import DataItem, {
  DataItemLabel,
  DataItemValue,
} from "../../components/data-item"
import PageTitle from "../../components/page-title"
import SeparatedList from "../../components/separated-list"
import SiteTitle from "../../components/site-title"
// libs
import { getMultipleObjects, getObject } from "../../libs/request"

const Lab = ({ lab, awards }) => {
  return (
    <>
      <SiteTitle />
      <PageTitle>{lab.title}</PageTitle>
      {lab.institute_name && (
        <DataItem>
          <DataItemLabel>Institute</DataItemLabel>
          <DataItemValue>
            <span className="text-lg font-bold">{lab.institute_name}</span>
          </DataItemValue>
          {lab.address1 && <DataItemValue>{lab.address1}</DataItemValue>}
          {lab.address2 && <DataItemValue>{lab.address2}</DataItemValue>}
          {(lab.city || lab.state || lab.postal_code) && (
            <DataItemValue>
              {[[lab.city, lab.state].join(", "), lab.postal_code].join(" ")}
            </DataItemValue>
          )}
          {lab.country && <DataItemValue>{lab.country}</DataItemValue>}
          {lab.phone1 && <DataItemValue>{lab.phone1}</DataItemValue>}
          {lab.phone2 && <DataItemValue>{lab.phone2}</DataItemValue>}
        </DataItem>
      )}
      {awards.length > 0 && (
        <DataItem>
          <DataItemLabel>Awards</DataItemLabel>
          <SeparatedList key="a">
            {awards.map((award) => (
              <Link href={award["@id"]} key={award.uuid}>
                <a>{award.name}</a>
              </Link>
            ))}
          </SeparatedList>
        </DataItem>
      )}
    </>
  )
}

Lab.propTypes = {
  // Data for lab displayed on the page
  lab: PropTypes.object.isRequired,
  // Awards associated with `lab`
  awards: PropTypes.array.isRequired,
}

export default Lab

export const getServerSideProps = async ({ params }) => {
  const lab = await getObject(`/labs/${params.name}/`)
  const awards = await getMultipleObjects(lab.awards)
  return {
    props: {
      lab,
      awards,
      pageContext: { title: lab.title },
    },
  }
}

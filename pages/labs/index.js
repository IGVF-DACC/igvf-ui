// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import PageTitle from "../../components/page-title"
import SiteTitle from "../../components/site-title"
// libs
import { getCollection } from "../../libs/request"

const LabList = ({ labs }) => {
  return (
    <>
      <SiteTitle />
      <PageTitle>Labs</PageTitle>
      {labs.map((lab) => (
        <Link href={lab["@id"]} key={lab.uuid}>
          <a className="block">{lab.title}</a>
        </Link>
      ))}
    </>
  )
}

LabList.propTypes = {
  // Labs to display in the list
  labs: PropTypes.array.isRequired,
}

export default LabList

export const getServerSideProps = async () => {
  const labs = await getCollection("lab")
  return {
    props: {
      labs: labs["@graph"],
      pageContext: { title: labs.title },
    },
  }
}

// node_modules
import PropTypes from "prop-types"
// components
import {
  Collection,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection"
import PageTitle from "../../components/page-title"
import SiteTitle from "../../components/site-title"
// libs
import { getCollection } from "../../libs/request"

const LabList = ({ labs }) => {
  return (
    <>
      <SiteTitle />
      <PageTitle>Labs</PageTitle>
      <Collection>
        {labs.map((lab) => (
          <CollectionItem key={lab.uuid} href={lab["@id"]}>
            <CollectionItemName name={lab.title} />
            {lab.institute_name && <div>{lab.institute_name}</div>}
          </CollectionItem>
        ))}
      </Collection>
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
  console.log("LABS %o", labs)
  return {
    props: {
      labs: labs["@graph"],
      pageContext: { title: labs.title },
    },
  }
}

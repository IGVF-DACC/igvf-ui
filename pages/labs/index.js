// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  Collection,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection"
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { getCollection } from "../../libs/request"

const LabList = ({ labs }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {labs.map((lab) => (
          <CollectionItem
            key={lab.uuid}
            href={lab["@id"]}
            label={`Lab ${lab.title}`}
          >
            <CollectionItemName>{lab.title}</CollectionItemName>
            <div>{lab.institute_label}</div>
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
  const breadcrumbs = await buildBreadcrumbs(labs, "title")
  return {
    props: {
      labs: labs["@graph"],
      pageContext: { title: labs.title },
      breadcrumbs,
    },
  }
}
